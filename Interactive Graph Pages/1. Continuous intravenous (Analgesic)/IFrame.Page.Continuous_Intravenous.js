//Global parameters defined here
var BodyWeight = 47;
var VolumnDistribution = {mean: 4, std: 1};
var Dose = 1.5;
var Clearance = {mean: 40, std: 6};
var hMax = 20;
var vMax = 0;
var clearance, actualKe;

//Calculation parameters defined here
var _K0, _Ke, _Vd;

//Page Logic define here
$(document).ready(function () {
    RestoreDefault();
    PrepareParameters();
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(SetGraphData);
    
    $("#ChangeSample").hide();
});

$("#AllPopulation").on("click", function () {
    if ($(this).text() == "Yes")
    {
        $(this).text("No");
        $("#ShowPatientData").attr("all-population", "true");
        $("#AllPopulationData").show();
        $("#ChangeSample").show();
    }
    else
    {
        $(this).text("Yes");
        $("#ShowPatientData").attr("all-population", "false");
        $("#AllPopulationData").hide();
        $("#ChangeSample").hide();
    }
    
    UpdateParameters();
    PrepareParameters();
    SetGraphData();
});

$("#ChangeSample").on("click", OnePopulation);

$("#ShowPatientData").on("click", function () {
    if ($(this).text().trim() == "Show Patient Data") 
    {
        $("#PatientData").show();
        $(this).text("Hide Patient Data");
    }
    else 
    {
        $("#PatientData").hide();
        $(this).text("Show Patient Data");
    }
});

$("#ChangePopulation").on("click", function() {
    UpdateParameters();
    PrepareParameters();
    SetGraphData();
});

$("#ResetButton").on("click", function() {
    RestoreDefault();
})

$(document).find("input").each(function () {
    $(this).on("change", function() {
        if (parseFloat($(this).val()) === NaN)
        {
            alert("Invalid input parameters, must be a number!");
            $(this).val("");
        }
    });
});

//Behavioural functions define below
function RestoreDefault(){
    $(document).find("input").each(function() {
        if($(this).attr("default-value") != undefined)
        {
            $(this).val($(this).attr("default-value"));
        }
    });
}

function UpdateParameters(){
    BodyWeight = $("#BWValue").val();
    Dose = $("#DoseValue").val();
    VolumnDistribution.mean = $("#VdMeanValue").val();
    VolumnDistribution.std = $("#VdStdValue").val();
    Clearance.mean = $("#CLMeanValue").val();
    Clearance.std = $("#CLStdValue").val();
    hMax = $("#HMAXValue").val();
}

//Calculation function define below		
function CalculateMean(m, s)
{
    var a1 = m * m;
    var a2 = Math.sqrt(m * m + s * s);
    return Math.log(a1/a2);
}

function CalculateStd(m, s)
{
    var a1 = m * m;
    var a2 = a1 + s * s;
    return Math.sqrt(Math.log(a2/a1));
}

function PrepareParameters() {
    vMax = 0.00;
    
    _K0 = Dose;
    _Vd = jStat.lognormal.inv(Math.random(), 
                              CalculateMean( VolumnDistribution.mean, VolumnDistribution.std),
                              CalculateStd( VolumnDistribution.mean, VolumnDistribution.std)) * BodyWeight;
                              
    clearance = jStat.lognormal.inv(Math.random(), 
                                    CalculateMean(Clearance.mean, Clearance.std),
                                    CalculateStd(Clearance.mean, Clearance.std));
                                    
    actualKe = Math.min(0.9999, (clearance*60)/(_Vd*1000)*BodyWeight);
    _Ke = Math.log(1) - Math.log(1 - actualKe);
}

function AmountAtTime(t) {
    var a1 = _K0;
    var a2 = _Ke * _Vd;
    var a3 = 1 - Math.exp(-_Ke*t);
    return a1*a3/a2;
}

function Round2Decimal(val) {
    return Math.round(val*100)/100;
}

function Round4Decimal(val) {
    return Math.round(val*10000)/10000;
}

function OnePopulation() {
    PrepareParameters();
    var dataArray = new Array();
    var t = 0;
    while (t <= hMax)
    {
        var a = AmountAtTime(t)
        dataArray.push([t, a]);
        t += 0.25;

        if (a > vMax) vMax = a;
    }
                            
    $("#SinglePatient_Vd").text(Round2Decimal(_Vd).toString());
    $("#SinglePatient_Cl").text(Round2Decimal(clearance).toString());
    $("#SinglePatient_THalf").text(Round2Decimal((Math.log(2)/_Ke)).toString());
    $("#SinglePatient_Ka").text(Round2Decimal(actualKe).toString());
    $("#SinglePatient_CSS").text(Round4Decimal(dataArray[dataArray.length - 1][1]).toString());
    $("#SinglePatient_SteadyT").text(Round2Decimal((Math.log(2)/_Ke)*4.5).toString());
    
    vMax = Math.round(vMax*10000)/10000;
    return dataArray;
}

function AllPopulation() {
    OnePopulation();							
    var population = new Array(hMax*4);
    var vd = 0, cl = 0, thalf = 0, ke = 0, cmin = 1000000, cmax = 0;
    
    for(var i = 0; i < hMax*4; i++)
    {
        population[i] = new Array(22);
        population[i][21] = 0;
    }

    for(var j = 0; j < 21; j++)
    {	
        PrepareParameters();
        vd += _Vd/20;
        cl += clearance/20;
        thalf += Math.log(2)/_Ke/20;
        ke += actualKe/20;
        for(var i = 0; i < hMax*4; i++)
        {
            var t = i * 0.25;
            if (j == 0) {
                population[i][j] = t;
            }
            else {
                population[i][j] = AmountAtTime(t);
                population[i][21] += population[i][j]/20;
            }
        }
        
        if (j == 0) continue;
    }

    $("#AllPatient_Vd").text(Round2Decimal(vd).toString());
    $("#AllPatient_Cl").text(Round2Decimal(cl).toString());
    $("#AllPatient_Ka").text(Round2Decimal(ke).toString());
    $("#AllPatient_THalf").text(Round2Decimal(thalf).toString());
    $("#AllPatient_CSS").text(Round4Decimal(population[population.length-1][21]).toString());
    $("#AllPatient_SteadyT").text(Round2Decimal(thalf*4.5).toString());
    
    
    vMax = Math.round(vMax*10)/10;
    return population;
}

function SetGraphData() {
    var data;
    if ($("#ShowPatientData").attr("all-population") == "false")
    {
        data = OnePopulation();
    }
    else
    {
        data = AllPopulation();
    }

    DrawGraph(data);
}

function DrawGraph(data) {
    var chart_styling = 
    chart_styling = 
    {
        legend: {
            textStyle: {
                color: "#14b4e0",
                fontSize: 12,
                bold: true
            }
        },
        hAxis: {
            title: "Hours",
            gridlines: {
                color: "#3a3a3a"
            },
            textStyle: {
                color: '#14b4e0',
                fontSize: 16,
                fontName: 'Arial',
                bold: true,
                italic: true
            },
            titleTextStyle: {
                color: '#14b4e0',
                fontSize: 16,
                fontName: 'Arial',
                bold: false,
                italic: true
            },
            ticks:[0, 15, 30, 45, 60]
        },
        vAxis: {
            title: "Antibiotic Concentration (mg/L)",
            gridlines: {
                color: "#3a3a3a"
            },
            textStyle: {
                color: '#14b4e0',
                fontSize: 16,
                fontName: 'Arial',
                bold: true,
                italic: true
            },
            titleTextStyle: {
                color: '#14b4e0',
                fontSize: 16,
                fontName: 'Arial',
                bold: false,
                italic: true
            },
            ticks: [20, 40, 60, 80, 100]
        },
        chartArea: {
            top: 30,
            left: 80,
            width: '76%',
            height: '80%'
        },
        width: 890,
        height: 500,
        backgroundColor: '#000000',
        series: {}
    }
    var table = new google.visualization.DataTable();
    table.addColumn("number", "Time");
    if (onePopulation) {
        table.addColumn("number", "Patient-"+(ActivePatient+1).toString());
        chart_styling.series = {
            0: {color: '#00FF00'}
        }
    }
    else {
        for (var i = 1; i <= 20; i++)
        {
            table.addColumn("number", "Patient-"+i);
            if (!firstPopulation || i != ActivePatient+1) 
                chart_styling.series[i-1] = {
                    lineWidth: 1,
                    lineDashStyle: [4, 4],
                    color: "#1EB1EE",
                    visibleInLegend: false
                };
            else
                chart_styling.series[i-1] = {
                    lineWidth: 3,
                    color: "#00FF00",
                    visibleInLegend: true
                };
        }
        table.addColumn("number", "Average");
        chart_styling.series["20"] = {
            lineWidth: 3,
            color: "#FF0000",
            visibleInLegend: true
        }
    }
    table.addRows(data);
    var chart = new google.visualization.LineChart(document.getElementById("ChartArea"));
    chart.draw(table, chart_styling);
}