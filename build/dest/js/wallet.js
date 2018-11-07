$(function () {
    var walletStreamData = [12, 19, 3, 5, 2, 3,7];

    $.ajax({
        url: "/Admin/WalletStreamer/TotalIncome",
        type: "POST",
        // data: {ids: Id,  startDate: dateStart, endDate:  dateEnd},
        dataType: "json",
        async: false,
        success: function (data) {
            walletStreamData = data.totalIncome;
        }, error: function (data) {
            console.log(data);
        }

    });


    var date = new Date(), labels = [], daysOfTheWeek = ["MO", "TU", "WD", "TH", "FR", "SA", "SU"];
    labels = daysOfTheWeek.slice(date.getDay(), daysOfTheWeek.length);
    daysOfTheWeek.splice(date.getDay(), daysOfTheWeek.length);
    for (var i = 0; i < daysOfTheWeek.length; i++)
        labels.push(daysOfTheWeek[i]);

    var totalVal = 0;
    walletStreamData.forEach(function(item, i) {
        totalVal += parseInt(item, 10);
    });

    totalVal += " $";

    var ctx = document.getElementById("wallet").getContext('2d');
    var WalletChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels:labels,
            datasets: [{
                label: '',
                data: walletStreamData,
                backgroundColor: 'transparent',
                borderColor: "#976fcf",
                pointBackgroundColor:"#976fcf",
                borderWidth: 2
            }]
        },
        options: {
            title: {
                display: true,
                text: totalVal,
                fontSize: 20,
                position: 'top',
                fontFamily: "Noto Sans",
                fontColor: "#34474f"
            },
            legend: false,
            layout: {
                padding: {
                    left: 5,
                    right: 20,
                    top: 5,
                    bottom: 5
                }
            },

            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                            return value + '';
                        }
                    }
                }]
            },

        },
    });
});

