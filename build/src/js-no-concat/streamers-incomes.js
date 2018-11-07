function addChart(chrtStngs, chkbxVl, chrtDataWeek, cnvs){
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

function removeChart(chrtStngs, chkbxVl, cnvs){
    chrtStngs.data.datasets.forEach(function (currentValue, i) {
        if (chrtStngs.data.datasets[i].label == chkbxVl.val()) {
            chrtStngs.data.datasets.splice(i, 1);
            cnvs.update();
        }
    });

}

function getCheckedIDs() {
    var res = {
        orders: [],
        layers: [],
        channels: []
    };
    $.each($('.mutliSelect input[type="checkbox"]:checked'), function (i) {
        var id = $(this).attr("data-obj-id");
        switch ($(this).attr("data-type")){
            case "order":
                res.orders.push(id);
                break;
            case "layer":
                res.layers.push(id);
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

function ShowFirstChecbox(chkBx) {
    var title = chkBx.val() + ",";
    var html = '<span title="' + title + '">' + title + '</span>';
    $('.multiSel').append(html);
    $(".hida").hide();
}

function div(val, by){
    return (val - val % by) / by;
}

function getChartsData(checkboxesID, dateStart, dateEnd){
    var colors = ['#D36969','#8F9BFF','#B76298','#56A555','#DEAC17','#FD72FE','#7278FE','#fe98e5','#2C1395','#DA70D6','#E9967A','#64078D','#00E62C','#E60091','#007069','#700400'];
    var ordID = checkboxesID;

    //на беке загнать данные в ассоциативный массив и перегнать его в json json_encode(); в таком виде:
    var result = {
        days: {
            labels: [],
            ordersId: {}
        },
        weeks: {
            labels: [],
            ordersId: {}
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
                ajaxUrl = "/Admin/ChartsStreamer/IncomeByChannels";
                ajaxData.channelsId = checkboxesID[key];
                arrKey = "channelsId";
                break;
            case "layers":
                ajaxUrl = "/Admin/ChartsStreamer/IncomeByLayers";
                ajaxData.layersId = checkboxesID[key];
                arrKey = "layersId";
                break;
            case "orders":
                ajaxUrl = "/Admin/ChartsStreamer/Income";
                ajaxData.ordersId = checkboxesID[key];
                arrKey = "ordersId";
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
                result.days.labels = data.chartData.days.labels.slice(0);
                var daysLabels = result.days.labels;
                var daysLabelsLen = daysLabels.length;

                for(i = 0; i < Math.ceil(daysLabelsLen/7); ++i){
                    var ind = i*7;
                    result.weeks.labels[i] = daysLabels[ind];
                }

                //Values for CHART
                result.days[arrKey] = JSON.stringify(data.chartData.days[arrKey]);
                result.days[arrKey] = JSON.parse( result.days[arrKey]);

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
    return  result;
}

function setDaysData(chrtStngs, dataArr, data, chrt){
    chrtStngs.Days.data.labels = data.days.labels;

    $.each(data.days.channelsId, function (index, value) {
        removeChart(chrtStngs.Days, $("div.mutliSelect input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Days, $("div.mutliSelect input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), value, chrt);
    });

    $.each(data.days.layersId, function (index, value) {
        removeChart(chrtStngs.Days,$("div.mutliSelect input[type='checkbox'][data-type='layer'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Days, $("div.mutliSelect input[type='checkbox'][data-type='layer'][data-obj-id='"+index+"']"), value, chrt);
    });

    $.each(data.days.ordersId, function (index, value) {
        removeChart(chrtStngs.Days, $("div.mutliSelect input[type='checkbox'][data-type='order'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Days, $("div.mutliSelect input[type='checkbox'][data-type='order'][data-obj-id='"+index+"']"), value, chrt);
    });
}

function setWeeksData(chrtStngs, dataArr, data, chrt){

    $.each(data.days.channelsId, function (index, value) {
        var tmp = [],
            i = 0,
            k = 0;

        for(i = 0; i < Math.ceil(value.length/7); ++i){
            tmp[i] = 0;
        }

        for (i = 0, k = 0; i < value.length; ++i, k=div(i,7)){
            tmp[k] += value[i];
        }

        dataArr[index] = tmp;


        chrtStngs.Weeks.data.labels = data.weeks.labels;


        removeChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), value, chrt);

    });

    $.each(data.days.layersId, function (index, value) {
        var tmp = [],
            i = 0,
            k = 0;

        for(i = 0; i < Math.ceil(value.length/7); ++i){
            tmp[i] = 0;
        }

        for (i = 0, k = 0; i < value.length; ++i, k=div(i,7)){
            tmp[k] += value[i];
        }

        dataArr[index] = tmp;


        chrtStngs.Weeks.data.labels = data.weeks.labels;

        removeChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='layer'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='layer'][data-obj-id='"+index+"']"), value, chrt);
    });
    $.each(data.days.ordersId, function (index, value) {
        var tmp = [],
            i = 0,
            k = 0;

        for(i = 0; i < Math.ceil(value.length/7); ++i){
            tmp[i] = 0;
        }

        for (i = 0, k = 0; i < value.length; ++i, k=div(i,7)){
            tmp[k] += value[i];
        }

        dataArr[index] = tmp;


        chrtStngs.Weeks.data.labels = data.weeks.labels;

        removeChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='order'][data-obj-id='"+index+"']"), chrt);
        addChart(chrtStngs.Weeks, $("div.mutliSelect input[type='checkbox'][data-type='order'][data-obj-id='"+index+"']"), value, chrt);
    });
}



function handleDateChange(s_date, e_date, chS, chDD, chDW){
    setTimeout(function() {
        var checkedIDs = getCheckedIDs();
        var data = getChartsData(checkedIDs, s_date, e_date);

        setDaysData(chS, chDD, data, window.myLine);
        setWeeksData(chS, chDW, data, window.myLine2);
    }, 100);
}

$(function () {
    START_DATE = -1;
    END_DATE = -1;
    $('#date_range').datepicker({
        range: 'period', // select period
        numberOfMonths: 2,
        maxDate: '0',
        firstDay: 1,
        dateFormat:"yy-mm-dd",
        // direction: "up",
        onSelect: function (dateText, inst, extensionRange) {
            // extensionRange
            $('#startDay').val(extensionRange.startDateText);
            $('#endDay').val(extensionRange.endDateText);


            START_DATE = extensionRange.startDateText;

            if(extensionRange.startDateText !== extensionRange.endDateText) {
                END_DATE = extensionRange.endDateText;
                handleDateChange(START_DATE, END_DATE, chartsSettings, chartsDataDays, chartsDataWeeks);
            }
        }

    });
    $('#date_range').datepicker('setDate', ['-6d', '+6d']);
    // Datapicker value
    var extensionRange = $('#date_range').datepicker('widget').data('datepickerExtensionRange');
    if (extensionRange.startDateText) $('#startDay').val(extensionRange.startDateText);
    if (extensionRange.endDateText) $('#endDay').val(extensionRange.endDateText);
    START_DATE = extensionRange.startDateText;
    END_DATE = extensionRange.endDateText;
// vars init
    var ctx = document.getElementById('stream-incoms').getContext('2d');
    var ctx2 = document.getElementById('stream-incoms2').getContext('2d');
    var Checbox_element =  $('.mutliSelect input[type="checkbox"]') ;
    var chartsDataDays = {};
    var chartsDataWeeks = {};
//Days chart

    var chartsSettings = {};
    chartsSettings.Days = {
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
                            return value + ' USD';
                        }
                    }
                }]
            },
        },

    };
    chartsSettings.Weeks = {
        type: 'line',
        data: {
            labels: [],

        },
        options: {
            legend: {
                position: 'right',
                fontSize: 20,

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
                            return value + ' USD';
                        }
                    }
                }]
            },
        }
    };

    var incomsDays = function (settings) {
        window.myLine = new Chart(ctx, settings);
    };
    var incomsWeeks = function (settings) {
        window.myLine2 = new Chart(ctx2, settings);
    };

    // SELECT CHECKBOX IN DROPDOWN
    $('.mutliSelect input[type="checkbox"]').on('click', function () {
        var title = $(this).closest('.mutliSelect').find('input[type="checkbox"]').val(),
            title = $(this).val() + ",";
        if ($(this).is(':checked')) {
            var html = '<span title="' + title + '">' + title + '</span>';
            $('.multiSel').append(html);
            $(".hida").hide();
        } else {
            $('span[title="' + title + '"]').remove();
            var ret = $(".hida");
            $('.dropdown dt a').append(ret);
        }
    });


    // Toggle chars DAYS || WEEKS
    $("input.income_chart").change(function () {
        $("#stream-incoms, #stream-incoms2").toggleClass("show");
    });

    //DRAWING
    incomsWeeks(chartsSettings.Weeks);
    incomsDays(chartsSettings.Days);
    ctx.clearRect(0, 0, 800, 400);
    ctx2.clearRect(0, 0, 800, 400);

    Checbox_element[0].checked = true;
    if (Checbox_element[0].checked){
        ShowFirstChecbox(Checbox_element);
        // handleDateChange(START_DATE, END_DATE, chartsSettings, chartsDataDays, chartsDataWeeks);
    }

    //Действие  после изменения чекбокса
    $('.mutliSelect input[type="checkbox"]').change(function () {
        var t = $(this);
        if(t[0].checked){
            var checkedInputID = t.attr("id");
            if(typeof chartsDataDays[checkedInputID] === "undefined" && typeof chartsDataWeeks[checkedInputID] === "undefined"){
                handleDateChange(START_DATE, END_DATE, chartsSettings, chartsDataDays, chartsDataWeeks);
            }

            addChart(chartsSettings.Days, t, chartsDataDays[checkedInputID], window.myLine);
            addChart(chartsSettings.Weeks, t, chartsDataWeeks[checkedInputID], window.myLine2);
        } else {
            removeChart(chartsSettings.Days, t, window.myLine);
            removeChart(chartsSettings.Weeks, t, window.myLine2);
        }
    });
    $("#income-chart").click(function(){
        handleDateChange(START_DATE, END_DATE, chartsSettings, chartsDataDays, chartsDataWeeks);
    });
});




