function addTimeChart(chrtStngs, chkbxVl, chrtDataWeek, cnvs){
    var newTimeDataset = {
        label: chkbxVl.val(),
        borderColor: 'transparent',
        backgroundColor:rndColor() ,
        data: chrtDataWeek,
    };

    var tmp = chrtStngs.data.datasets;
    tmp[tmp.length] = newTimeDataset;
    cnvs.update();
}

function removeTimeChart(chrtStngs, chkbxVl, cnvs){
    chrtStngs.data.datasets.forEach(function (currentValue, i) {
        if (chrtStngs.data.datasets[i].label == chkbxVl.val()) {
            chrtStngs.data.datasets.splice(i, 1);
            cnvs.update();
        }
    });

}

function getCheckedTimeChIDs() {
    var res = {
        banners: [],
        channels: []
    };
    $.each($('.timeChart_select input[type="checkbox"]:checked'), function (i) {
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

function ShowFirstTimeChartChecbox(chkBx) {
    var title_t = chkBx.val() + ",";
    var t_show = '<span title_t="' + title_t + '">' + title_t + '</span>';
    $('.timeChart').append(t_show);
    $(".hida").hide();
}

// function div(val, by){
//     return (val - val % by) / by;
// }

function getChartsTimeData(checkboxesID, dateStart, dateEnd){
    var Id = checkboxesID;

    //на беке загнать данные в ассоциативный массив и перегнать его в json json_encode(); в таком виде:
    var resultTimeChart = {
        days: {
            labels: [],
            channelsId: {}
        },
        weeks: {
            labels: [],
            channelsId: {}
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
                ajaxUrl = "/Admin/ChartsAdvertiser/AmountOfTimeByChannels";
                ajaxData.channelsId = checkboxesID[key];
                arrKey = "channelsId";
                break;
            case "banners":
                ajaxUrl = "/Admin/ChartsAdvertiser/AmountOfTime";
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
                    resultTimeChart.days.labels = data.chartData.labels.slice(0);
                    var daysLabels = resultTimeChart.days.labels;
                    var daysLabelsLen = daysLabels.length;

                    for(i = 0; i < Math.ceil(daysLabelsLen/7); ++i){
                        var ind = i*7;
                        resultTimeChart.weeks.labels[i] = daysLabels[ind];
                    }

                    //Values for CHART
                    resultTimeChart.days[arrKey] = JSON.stringify(data.chartData.days[arrKey]);
                    resultTimeChart.days[arrKey] = JSON.parse( resultTimeChart.days[arrKey]);

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
    return  resultTimeChart;
}

function setTimeDaysData(chrtStngs, dataArr, data, chrt){
    chrtStngs.Days.data.labels = data.days.labels;

    $.each(data.days.channelsId, function (index, value) {
        removeTimeChart(chrtStngs.Days, $("div.timeChart_select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), chrt);
        addTimeChart(chrtStngs.Days, $("div.timeChart_select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), value, chrt);
    });

    $.each(data.days.campaignsId, function (index, value) {
        removeTimeChart(chrtStngs.Days,$("div.timeChart_select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), chrt);
        addTimeChart(chrtStngs.Days, $("div.timeChart_select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), value, chrt);
    });




}

function setTimeWeeksData(chrtStngs, dataArr, data, chrt){

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


        removeTimeChart(chrtStngs.Weeks, $("div.timeChart_select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), chrt);
        addTimeChart(chrtStngs.Weeks, $("div.timeChart_select input[type='checkbox'][data-type='channel'][data-obj-id='"+index+"']"), value, chrt);

    });

    $.each(data.days.campaignsId, function (index, value) {
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

        removeTimeChart(chrtStngs.Weeks, $("div.timeChart_select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), chrt);
        addTimeChart(chrtStngs.Weeks, $("div.timeChart_select input[type='checkbox'][data-type='banner'][data-obj-id='"+index+"']"), value, chrt);
    });

}

function handleDateTimeChange(s_date, e_date, chS, chDD, chDW){
    setTimeout(function() {
        var checkedIDs = getCheckedTimeChIDs();
        var data = getChartsTimeData(checkedIDs, s_date, e_date);

        setTimeDaysData(chS, chDD, data, window.myLineTime);
        setTimeWeeksData(chS, chDW, data, window.myLineTime2);

    }, 100);
}

$(function () {
    START_DATE_TIME = -1;
    END_DATE_TIME = -1;
    $('#date_range_time').datepicker({
        range: 'period', // select period
        numberOfMonths: 2,
        maxDate: '0',
        firstDay: 1,
        dateFormat:"yy-mm-dd",
        // direction: "up",
        onSelect: function (dateText, inst, extensionRange) {
            // extensionRange
            $('#startDayTime').val(extensionRange.startDateText);
            $('#endDayTime').val(extensionRange.endDateText);


            START_DATE_TIME = extensionRange.startDateText;

            if(extensionRange.startDateText !== extensionRange.endDateText) {
                END_DATE_TIME = extensionRange.endDateText;
                handleDateTimeChange(START_DATE_TIME, END_DATE_TIME, chartsTimeSettings, chartsDataTimeDays, chartsDataTimeWeeks);
            }
        }

    });
    $('#date_range_time').datepicker('setDate', ['-6d', '+6d']);
    // Datapicker value
    var extensionRange = $('#date_range_time').datepicker('widget').data('datepickerExtensionRange');
    if (extensionRange.startDateText) $('#startDayTime').val(extensionRange.startDateText);
    if (extensionRange.endDateText) $('#endDayTime').val(extensionRange.endDateText);
    START_DATE_TIME = extensionRange.startDateText;
    END_DATE_TIME = extensionRange.endDateText;
// vars init
    var ctx = document.getElementById('stream-time').getContext('2d');
    var ctx2 = document.getElementById('stream-time2').getContext('2d');
    var Checbox_element_time = $('.timeChart_select input[type="checkbox"]') ;
    var chartsDataTimeDays = {};
    var chartsDataTimeWeeks = {};
//Days chart

    var chartsTimeSettings = {};
    chartsTimeSettings.Days = {
        type: 'bar',
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
                            return  value + ' min';
                        }
                    }
                }]
            },
        },

    };
    chartsTimeSettings.Weeks = {
        type: 'bar',
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
                            return  value + ' min';
                        }
                    }
                }]
            },
        }
    };

    var DaysTimeChart = function (settings) {
        window.myLineTime = new Chart(ctx, settings);
    };
    var WeeksTimeChart = function (settings) {
        window.myLineTime2 = new Chart(ctx2, settings);
    };

    // SELECT CHECKBOX IN DROPDOWN
    $('.timeChart_select input[type="checkbox"]').on('click', function () {
      var title = $(this).closest('.timeChart_select').find('input[type="checkbox"]').val(),
          title = $(this).val() + ",";
        if ($(this).is(':checked')) {
            var t_show = '<span title_t="' + title + '">' + title + '</span>';
            $('.timeChart').append(t_show);
            $(".hida").hide();
        } else {
            $('span[title_t="' + title + '"]').remove();
            var ret = $(".hida");
            $('.timeChartIdsMenu dt a').append(ret);
        }
    });



    // Toggle chars DAYS || WEEKS
    $("input.time_chart").change(function () {
        $("#stream-time, #stream-time2").toggleClass("show");
    });

    //DRAWING
    WeeksTimeChart(chartsTimeSettings.Weeks);
    DaysTimeChart(chartsTimeSettings.Days);
    ctx.clearRect(0, 0, 800, 400);
    ctx2.clearRect(0, 0, 800, 400);

    Checbox_element_time[0].checked = true;
    if (Checbox_element_time[0].checked){
        ShowFirstTimeChartChecbox(Checbox_element_time);
        // handleDateTimeChange(START_DATE_TIME, END_DATE_TIME, chartsTimeSettings, chartsDataTimeDays, chartsDataTimeWeeks);
    }

    //Действие  после изменения чекбокса
    $('.timeChart_select input[type="checkbox"]').change(function () {
        var t = $(this);
        if(t[0].checked){
            var checkedInputID = t.attr("id");
            if(typeof chartsDataTimeDays[checkedInputID] === "undefined" && typeof chartsDataTimeWeeks[checkedInputID] === "undefined"){
                handleDateTimeChange(START_DATE_TIME, END_DATE_TIME, chartsTimeSettings, chartsDataTimeDays, chartsDataTimeWeeks);
            }

            addTimeChart(chartsTimeSettings.Days, t, chartsDataTimeDays[checkedInputID], window.myLineTime);
            addTimeChart(chartsTimeSettings.Weeks, t, chartsDataTimeWeeks[checkedInputID], window.myLineTime2);
        } else {
            removeTimeChart(chartsTimeSettings.Days, t, window.myLineTime);
            removeTimeChart(chartsTimeSettings.Weeks, t, window.myLineTime2);
        }
    });

    $("#time-chart-adv").click(function(){
        handleDateTimeChange(START_DATE_TIME, END_DATE_TIME, chartsTimeSettings, chartsDataTimeDays, chartsDataTimeWeeks);
    });

    $("#time-chart-adv").click();
});




