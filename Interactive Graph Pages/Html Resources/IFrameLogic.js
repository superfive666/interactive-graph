$(document).ready(function () {
    window.addEventListener("message", ReceiveMessage, false);
    google.charts.load('current', {'packages':['corechart']});  
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

    console.log("Data received: --->");
    console.log(message);
    DrawGraph(message.Data, message.Display, message.ChartStyle);
}

function DrawGraph(Data, Display, GraphStyle) {
    var table = new google.visualization.DataTable();
    table.addColumn("number", "Time");

    if (Display.OnePopulation) {
        table.addColumn("number", "Patient-"+(Display.ActivePatient+1).toString());
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        var singleData = new Array();
        Data.foeEach((val)=>{
            singleData.push([val[0], val[ActivePatient], val[22], val[23]])
        });
    } else {
        for (var i = 1; i <= 20; i++)
        {
            table.addColumn("number", "Patient-"+i);
        }
        table.addColumn("number", "Average");
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        table.addRows(Data);
    }

    console.log("Start to draw graph:  table --->");
    console.log(table);
    console.log("Start to draw graph: GraphStyle --->");
    console.log(GraphStyle);
    var chart = new google.visualization.ComboChart(document.getElementById("ChartArea"));
    chart.draw(table, GraphStyle);
}