function addChartCoast(chrtStngs, chkbxVl, chrtDataWeek, cnvs){
    var newDataset = {
        label: chkbxVl.val(),
        borderColor: rndColor(),
        backgroundColor: 'transparent',
        data: chrtDataWeek,
    };

    var tmp = chrtStngs.data.datasets;
    tmp[tmp.length] = newDataset;
    cnvs.update();
}

function removeChartCoast(chrtStngs, chkbxVl, cnvs){
    chrtStngs.data.datasets.forEach(function (currentValue, i) {
        if (chrtStngs.data.datasets[i].label == chkbxVl.val()) {
            chrtStngs.data.datasets.splice(i, 1);
            cnvs.update();
        }
    });

}

function getCoastCheckedIDs() {
    var res = {
        banners: [],
        channels: []
    };
    $.each($('.coast-select input[type="checkbox"]:checked'), function (i) {
        var id = $(this).attr("data-obj-id");
        switch ($(this).attr("data-type")){
            case "banner":
                res.banners.push(id);
                break;
            case "channel":
                res.channels.push(id);
                break;
        }
    });
    return res;
}

function rndColor() {
    return '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
}

function ShowFirstCoastChecbox(chkBx) {
    var title_cst = chkBx.val() + ",";
    var html = '<span title_cst="' + title_cst + '">' + title_cst + '</span>';
    $('.coast-sel').append(html);
    $(".hida").hide();
}

// function div(val, by){
//     return (val - val % by) / by;
// }

function getCoastChartsData(checkboxesID, dateStart, dateEnd){
    var ordID = checkboxesID;

    //на беке загнать данные в ассоциативный массив и перегнать его в json json_encode(); в таком виде:
    var resultViews = {
        days: {
            labels: [],
            // channelsId: {}
        }
    };
    console.log('Loading');
    for (key in checkboxesID) {
        if(checkboxesID[key].length === 0)
            continue;

        var ajaxUrl = "";
        var ajaxData = { startDate: dateStart, endDate: dateEnd };
        var arrKey = "";

        switch(key){
            case "channels":
                ajaxUrl = "/Admin/ChartsAdvertiser/CostByChannels";
                ajaxData.channelsId = checkboxesID[key];
                arrKey = "channelsId";
                break;
            case "banners":
                ajaxUrl = "/Admin/ChartsAdvertiser/Cost";
                ajaxData.campaignsId = checkboxesID[key];
                arrKey = "campaignsId";
                break;
        }


        $.ajax({
            url: ajaxUrl,
            type: "POST",
            data: ajaxData,
            dataType: "json",
            async: false,
            success: function (data) {
                console.log(data);
                if(!data.error){
                    //Labels for CHART
                    resultViews.days.labels = data.chartData.labels.slice(0);

                    //Values for CHART
                    resultViews.days[arrKey] = JSON.stringify(data.chartData.days[arrKey]);
                    resultViews.days[arrKey] = JSON.parse( resultViews.days[arrKey]);

                } else {
                    console.log(data);
                    alert('The chosen period must not exceed 30 (31) days')
                }
            }, error: function (data) {
                console.log(data);
            }
        });
    }
    console.log('Ready');
    return  resultViews;
}

function setCoastData(chrtStngs, dataArr, data, chrt){
    chrtStngs.Days.data.labels = data.days.labels;

    $.each(data.days.channelsId, function (index, value) {
        dataArr[index] =  value;
        removeChartCoast(chrtStngs.Days, $("div.coast-select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), chrt);
        addChartCoast(chrtStngs.Days, $("div.coast-select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"),value,chrt);
    });
    $.each(data.days.campaignsId, function (index, value) {
        removeChartCoast(chrtStngs.Days,$("div.coast-select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), chrt);
        addChartCoast(chrtStngs.Days, $("div.coast-select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), value, chrt);
    });
}
function handleCoastDateChange(s_date, e_date, chS, chDD, chDW){
    setTimeout(function() {
        var checkedIDs = getCoastCheckedIDs();
        var data = getCoastChartsData(checkedIDs, s_date, e_date);

        setCoastData(chS, chDD, data, window.myCoastLine);
    }, 100);
}

$(function () {
    START_DATE_COAST = -1;
    END_DATE_COAST = -1;
    $('#date_range_coast').datepicker({
        range: 'period', // select period
        numberOfMonths: 2,
        maxDate: '0',
        firstDay: 1,
        dateFormat:"yy-mm-dd",
        // direction: "up",
        onSelect: function (dateText, inst, extensionRange) {
            // extensionRange
            $('#startDayCoast').val(extensionRange.startDateText);
            $('#endDayCoast').val(extensionRange.endDateText);


            START_DATE_COAST = extensionRange.startDateText;

            if(extensionRange.startDateText !== extensionRange.endDateText) {
                END_DATE_COAST = extensionRange.endDateText;
                handleCoastDateChange(START_DATE_COAST, END_DATE_COAST, chartsCoastSettings, chartsCoastDataDays);
            }
        }

    });
    $('#date_range_coast').datepicker('setDate', ['-6d', '+6d']);
    // Datapicker value
    var extensionRange = $('#date_range_coast').datepicker('widget').data('datepickerExtensionRange');
    if (extensionRange.startDateText) $('#startDayCoast').val(extensionRange.startDateText);
    if (extensionRange.endDateText) $('#endDayCoast').val(extensionRange.endDateText);
    START_DATE_COAST = extensionRange.startDateText;
    END_DATE_COAST = extensionRange.endDateText;
// vars init
    var ctx = document.getElementById('coast-chart').getContext('2d');
    var Checbox_element_coast =  $('.coast-select input[type="checkbox"]') ;
    var chartsCoastDataDays = {};

//Days chart

    var chartsCoastSettings = {};
    chartsCoastSettings.Days = {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            legend: {
                position: 'right',
                fontSize: 20,
                fullWidth: false,
                boxWidth: 10,
                usePointStyle: true
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                            return value + ' amount';
                        }
                    }
                }]
            },
        },

    };

    var CoastChartD = function (settings) {
        window.myCoastLine = new Chart(ctx, settings);
    };
    // SELECT CHECKBOX IN DROPDOWN
    $('.coast-select input[type="checkbox"]').on('click', function () {
        var title_cst = $(this).closest('.coast-select').find('input[type="checkbox"]').val(),
            title_cst = $(this).val() + ",";
        if ($(this).is(':checked')) {
            var html = '<span title_cst="' + title_cst + '">' + title_cst + '</span>';
            $('.coast-sel').append(html);
            $(".hida").hide();
        } else {
            $('span[title_cst="' + title_cst + '"]').remove();
            var ret = $(".hida");
            $('.coast-dropdown dt a').append(ret);
        }
    });




    //DRAWING
    CoastChartD(chartsCoastSettings.Days);
    ctx.clearRect(0, 0, 800, 400);

    Checbox_element_coast[0].checked = true;
    if (Checbox_element_coast[0].checked){
        ShowFirstCoastChecbox(Checbox_element_coast);
        // handleCoastDateChange(START_DATE_COAST, END_DATE_COAST, chartsCoastSettings, chartsCoastDataDays);
    }

    //Действие  после изменения чекбокса
    $('.coast-select input[type="checkbox"]').change(function () {
        var t = $(this);
        if(t[0].checked){
            var checkedInputID = t.attr("id");
            if(typeof chartsCoastDataDays[checkedInputID] === "undefined"){
                handleCoastDateChange(START_DATE_COAST, END_DATE_COAST, chartsCoastSettings, chartsCoastDataDays);
            }
            addChartCoast(chartsCoastSettings.Days, t, chartsCoastDataDays[checkedInputID], window.myCoastLine);
        } else {
            removeChartCoast(chartsCoastSettings.Days, t, window.myCoastLine);

        }
    });
  $("#cost-chart").click(function(){
    handleCoastDateChange(START_DATE_COAST, END_DATE_COAST, chartsCoastSettings, chartsCoastDataDays);
  });

});




