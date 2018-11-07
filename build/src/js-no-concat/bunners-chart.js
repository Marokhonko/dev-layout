function addChartBunners(chrtStngs, chkbxVl, chrtData, cnvs){
    var newDataset = {
        label: chkbxVl.val(),
        borderColor:'transparent' ,
        backgroundColor:rndColor(),
        data: chrtData,
    };

    var tmp = chrtStngs.data.datasets;
    tmp[tmp.length] = newDataset;
    cnvs.update();


}

function removeChartBunners(chrtStngs, chkbxVl, cnvs){

    chrtStngs.data.datasets.forEach(function (currentValue, i) {
        if (chrtStngs.data.datasets[i].label == chkbxVl.val()) {
            chrtStngs.data.datasets.splice(i, 1);
            cnvs.update();
        }
    });
}

function getBunnerCheckedIDs() {
    var res = [];
    $.each($('.bunners-select input[type="checkbox"]:checked'), function (i) {
        var id = parseInt($(this).attr("id").split("_")[1]);
        res.push(id);
    });

    return res;
}



function rndColor() {
    return '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6);
}

function ShowFirstBunnersChecbox(chkBx) {
    var title_b = chkBx.val() + ",";
    var html = '<span title_b="' + title_b + '">' + title_b + '</span>';
    $('.bunners-sel').append(html);
    $(".hida").hide();
}

function div(val, by){
    return (val - val % by) / by;
}

function getBunnerChartsData(checkboxesID, dateStart, dateEnd){
    var bannerss = checkboxesID;

    //на беке загнать данные в ассоциативный массив и перегнать его в json json_encode(); в таком виде:
    var resultBunners = {
        days: {
            labels: [],
            banners: {}
        }
    };
    // $(".loading-overlay").addClass('hide');
    console.log('Loading');
    $.ajax({
        url: "/Admin/ChartsAdvertiser/Banners",
        type: "POST",
        data: {startDate: dateStart, endDate:  dateEnd, bannersId: bannerss},
        dataType: "json",
        async: false,
        success: function (data) {
            if(!data.error){
                //Labels for CHART
                resultBunners = data.chartData;
                //Values for CHART
                resultBunners.days.banners = JSON.stringify(data.chartData.days.banners);
                resultBunners.days.banners = JSON.parse(resultBunners.days.banners);
                console.log(data);

            } else {
                console.log(data)
                 alert('The chosen period must not exceed 30 (31) days')
            }
        }, error: function (data) {
        }

    });
    // $(".loading-overlay").removeClass('hide');
    console.log('Ready');
    return resultBunners;
}

function setBunnersData(chrtStngs, dataArr, data, chrt){
    chrtStngs.Bunners.data.labels = data.days.labels;

    $.each(data.days.banners, function (index, arr) {
        var tmp = {
            values: [],
            tooltips: []
        };

        $.each(arr,function (i, a) {
            tmp.values.push(a.value);
            tmp.tooltips.push(a.tooltip) ;
        });

        // dataArr[index] =  tmp.values;
        VALUE[index] = dataArr[index] =  tmp.values ;
        TOOLTIPS[index] = tmp.tooltips;


        removeChartBunners(chrtStngs.Bunners,  $("div.bunners-select input[type='checkbox'][data-obj-id='"+index+"']"), chrt);
        addChartBunners(chrtStngs.Bunners, $("div.bunners-select input[type='checkbox'][data-obj-id='"+index+"']"), dataArr[index], chrt);
    });

    console.log(TOOLTIPS);
}
function handleBunnersDateChange(s_date, e_date, chS, chDD){
    setTimeout(function() {
        var checkedIDs = getBunnerCheckedIDs();
        var data = getBunnerChartsData(checkedIDs, s_date, e_date);
        setBunnersData(chS, chDD, data, window.myBunnersLine);
    }, 100);
}



$(function () {
    START_DATE_Bunners = -1;
    END_DATE_Bunners = -1;
    $('#date_range_bunners').datepicker({
        range: 'period', // select period
        numberOfMonths: 2,
        maxDate: '0',
        firstDay: 1,
        dateFormat:"yy-mm-dd",
        // direction: "up",
        onSelect: function (dateText, inst, extensionRange) {
            // extensionRange
            $('#startDayBunners').val(extensionRange.startDateText);
            $('#endDayBunners').val(extensionRange.endDateText);


            START_DATE_Bunners = extensionRange.startDateText;

            if(extensionRange.startDateText !== extensionRange.endDateText) {
                END_DATE_Bunners = extensionRange.endDateText;
                handleBunnersDateChange(START_DATE_Bunners, END_DATE_Bunners, chartsBunnersSettings, chartsBunnersDataDays);
            }
        }

    });
    $('#date_range_bunners').datepicker('setDate',  ['-6d', '+6d']);
    // Datapicker value
    var extensionRange = $('#date_range_bunners').datepicker('widget').data('datepickerExtensionRange');
    if (extensionRange.startDateText) $('#startDayBunners').val(extensionRange.startDateText);
    if (extensionRange.endDateText) $('#endDayBunners').val(extensionRange.endDateText);
    START_DATE_Bunners = extensionRange.startDateText;
    END_DATE_Bunners = extensionRange.endDateText;
// vars init
    var ctx = document.getElementById('adv-bunners').getContext('2d');
    var Checbox_element_b =  $('.bunners-select input[type="checkbox"]') ;
    var chartsBunnersDataDays = {};
    TOOLTIPS = {};
    VALUE = {};


//Days chart

    var chartsBunnersSettings = {};
    chartsBunnersSettings.Bunners = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            legend: {
                position: 'right',
                fontSize: 20,
                fullWidth: false,
                boxWidth: 10,
                usePointStyle: true,
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function (tooltipItem,data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += '';
                        }

                        return [label, 'total h ' + VALUE[getBunnerCheckedIDs()[tooltipItem.datasetIndex]][tooltipItem.index], 'periods p.d. ' +  TOOLTIPS[getBunnerCheckedIDs()[tooltipItem.datasetIndex]][tooltipItem.index]];
                    }
                },
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20,
                },
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                            return value + ' h';
                        }

                    }
                }]
            },
        },

    };
    var BunnersChartD = function (settings) {
        window.myBunnersLine = new Chart(ctx, settings);
    };
    // SELECT CHECKBOX IN DROPDOWN
    $('.bunners-select input[type="checkbox"]').on('click', function () {
        var title_b = $(this).closest('.bunners-select').find('input[type="checkbox"]').val(),
            title_b = $(this).val() + ",";
        if ($(this).is(':checked')) {
            var html = '<span title_b="' + title_b + '">' + title_b + '</span>';
            $('.bunners-sel').append(html);
            $(".hida").hide();
        } else {
            $('span[title_b="' + title_b + '"]').remove();
            var ret = $(".hida");
            $('.bunnersMenu dt a').append(ret);
        }
    });




    //DRAWING
    BunnersChartD(chartsBunnersSettings.Bunners);
    ctx.clearRect(0, 0, 800, 400);

    Checbox_element_b[0].checked = true;
    if (Checbox_element_b[0].checked){
        ShowFirstBunnersChecbox(Checbox_element_b);
        // handleBunnersDateChange(START_DATE_Bunners, END_DATE_Bunners, chartsBunnersSettings, chartsBunnersDataDays);
    }

    //Действие  после изменения чекбокса
    $('.bunners-select input[type="checkbox"]').change(function () {
        var t = $(this);
        if(t[0].checked){
            var checkedInputID = t.attr("id");
            if(typeof chartsBunnersDataDays[checkedInputID] === "undefined"){
                handleBunnersDateChange(START_DATE_Bunners, END_DATE_Bunners, chartsBunnersSettings, chartsBunnersDataDays);
            }
            addChartBunners(chartsBunnersSettings.Bunners, t, chartsBunnersDataDays[checkedInputID], window.myBunnersLine);
        } else {
            removeChartBunners(chartsBunnersSettings.Bunners, t, window.myBunnersLine);
        }
    });
    $("#banner-chart").click(function(){
        handleBunnersDateChange(START_DATE_Bunners, END_DATE_Bunners, chartsBunnersSettings, chartsBunnersDataDays);
    });
});




