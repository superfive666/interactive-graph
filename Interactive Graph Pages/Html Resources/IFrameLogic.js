$(document).ready(function () {
    window.addEventListener("message", ReceiveMessage, false);
    InitVariables();
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(SetGraphData);    
});

document.getElementById("close_single").addEventListener("click", function() {
    $("#SinglePatientData")[0].classList.add('w3-animate-show');
    window.parent.postMessage("Close", "*");
});
document.getElementById("close_all_pop").addEventListener("click", function() {
    $("#PopulationModal")[0].classList.add('w3-animate-show');
    window.parent.postMessage("Close", "*");
});
document.getElementById("SinglePatientData").addEventListener('animationend', function() {
    if (this.classList.contains('w3-animate-show')) {
          this.style.display = 'none';
          this.classList.remove('w3-animate-show')
    }
});
document.getElementById("PopulationModal").addEventListener('animationend', function() {
    if (this.classList.contains('w3-animate-show')) {
          this.style.display = 'none';
          this.classList.remove('w3-animate-show')
    }
});

function ReceiveMessage(e) {
    if (e.data === undefined)
    {
        console.error("No object posted!");
        return;
    }
    var message = e.data;
    if (message.Data === undefined || 
        message.Display === undefined || 
        message.ChartStyle === undefined)
    {
        console.error("Invalid message");
        return;
    }

    DrawGraph(message.Data, message.Display, message.ChartStyle);
    ProcessBinding(message.Display);
}

function ProcessBinding(data) {
    $("[binding-key]").each(function() {
        $(this).text(data[$(this).attr("binding-key")]);
    });
}

function DrawGraph(Data, Display, GraphStyle) {
    var table = new google.visualization.DataTable();
    table.addColumn("number", "Time");

    if (Display.OnePopulation) {
        table.addColumn("number", "Patient-"+(Display.ActivePatient+1).toString());
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        GraphStyle.series = {
            0: {color: '#00FF00', type: 'line'},
            1: {color: 'transparent', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0},
            2: {color: '#666600', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0}
        }

        //To-do: prepare individual data:


    } else {
        for (var i = 1; i <= 20; i++)
        {
            //To-do: update the styling.
            table.addColumn("number", "Patient-"+i);
            if (!Display.FirstPopulation || i != Display.ActivePatient+1) 
                GraphStyle.series[i-1] = {
                    lineWidth: 1,
                    lineDashStyle: [4, 4],
                    color: "#1EB1EE",
                    visibleInLegend: false,
                    type: 'line'
                };
            else
                GraphStyle.series[i-1] = {
                    lineWidth: 3,
                    color: "#00FF00",
                    visibleInLegend: true,
                    type: 'line'
                };
        }
        table.addColumn("number", "Average");
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        GraphStyle.series["20"] = {
            lineWidth: 3,
            color: "#FF0000",
            visibleInLegend: true,
            type: 'line'
        };
        GraphStyle.series["21"] = {
            color: 'transparent', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0
        };
        GraphStyle.series["22"] = {
            color: '#666600', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0
        };
        table.addRows(Data);
    }

    var chart = new google.visualization.ComboChart(document.getElementById("ChartArea"));
    chart.draw(table, GraphStyle);
}