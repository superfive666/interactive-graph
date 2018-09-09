//Global parameters definition
var F = {mean: 0.9, std: 0.15};
var Dose = 250;
var Ka = {mean: 1, std: 1/6.0};
var Vd = {mean: 50000, std: 50000/6.0};
var VMAX = 0.03;
var Km = 0.009;
var TimeInterval = 0.1;
var Tau = 12;
var MaxTime = 300;
var T = 0;
var low = 0.01;
var ht = 0.01;

//Current or active patient indicators
var onePopulation = true;
var firstPopulation = true;
var ActivePatient;

//Message repository parameters
var messageRepository = {
    SwitchPatient: "switch patient",
    ChangePopulation: "change population",
    ShowPatientData: "show patient data",
    BackToFirstPatient: "back to first patient",
    Yes: "yes button clicked",
    FrequencySelection: "selected new frequency",
    DosageInput: "user input new new dosage",
    OptimizeCondition: "apply changes to dosage and frequency"
}

//Calculation parameters definition
var _F, _Vd, _Ka;

//Default value store here
var _First20Patients = {};
var DefaultDose, DefaultTau, DefaultPatient;

//Document functions
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

//Document init
$(document).ready(function () {
    window.addEventListener("message", ReceiveMessage, false);
    InitVariables();
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(SetGraphData);    
});

//Behavioural functions
function ReceiveMessage(e) {
    if (e.data == undefined)
    {
        alert("No object posted!");
        return;
    }
    if (e.data.Message == undefined)
    {
        alert("No message posted!");
        return;
    }

    var single = document.getElementById("SinglePatientData").style.display == "block";
    var all = document.getElementById("PopulationModal").style.display == "block";
    if (single || all) return;

    switch(e.data.Message)
    {
        case messageRepository.SwitchPatient: SwitchPatient(); break;
        case messageRepository.ChangePopulation: ChangePopulation(); break;
        case messageRepository.ShowPatientData: ShowPatientData(); break;
        case messageRepository.OptimizeCondition: OptimizeCondition(e.data.Frequency, e.data.Dosage); break;
        case messageRepository.BackToFirstPatient: BackToFirstPatient(); break;
        case messageRepository.Yes: YesButton(); break;
        default: 
            alert("Invalid message posted, I am not reacting to it!");
            break;
    }
}

function InitVariables() {
    ActivePatient = Math.floor(Math.random()*20);
    _F = new Array(20);
    _Ka = new Array(20);
    _Vd = new Array(20);

    Generate20();
    SaveDefault();
}

function SaveDefault() {
    DefaultPatient = ActivePatient;
    _First20Patients["_F"] = _F.slice();
    _First20Patients["_Ka"] = _Ka.slice();
    _First20Patients["_Vd"] = _Vd.slice();
    DefaultDose = Dose;
    DefaultTau = Tau;
}

function RetrieveDefault(){
    ActivePatient = DefaultPatient;
    _F = _First20Patients._F.slice();
    _Ka = _First20Patients._Ka.slice();
    _Vd = _First20Patients._Vd.slice();
    Dose = DefaultDose;
    Tau = DefaultTau;    
}

function OptimizeCondition(freq, dose) {
    RetrieveDefault();
    if(freq == undefined)
    {
        alert("No frequency passed by the page!");
        return;
    }
    if(dose == undefined)
    {
        alert("No dosage passed by the page!");
        return;
    }
    
    Dose = parseInt(dose);
    Tau = parseInt(freq);

    onePopulation = true;
    firstPopulation = true;
    SetGraphData();
}

function SwitchPatient () {
    if (!firstPopulation) return;
    
    ActivePatient++;
    ActivePatient %= 20;
    SetGraphData();					
}

function BackToFirstPatient() {
    RetrieveDefault();
    firstPopulation = true;
    SetGraphData();
}

function ShowPatientData() {
    var target = onePopulation? $("#SinglePatientData") : $("#PopulationModal");
    target.css("display", "block");
}

function ChangePopulation(){
    firstPopulation = false;
    Generate20();	
    SetGraphData();
}

function YesButton() {
    onePopulation = !onePopulation;
    SetGraphData();
}

function Generate20() {
    for (var i = 0; i < 20; i++) {
        PrepareParameters(i);            
    }
}

//Calculators
function CalculateMean(m, s) {
    var a1 = m * m;
    var a2 = Math.sqrt(m * m + s * s);
    return Math.log(a1/a2);
}

function CalculateStd(m, s) {
    var a1 = m * m;
    var a2 = a1 + s * s;
    return Math.sqrt(Math.log(a2/a1));
}

function PrepareParameters(i) {
    _F[i] = jStat.lognormal.inv(Math.random(),
            CalculateMean(F.mean, F.std),
            CalculateStd(F.mean, F.std));
    _Ka[i] = jStat.lognormal.inv(Math.random(),
            CalculateMean(Ka.mean, Ka.std),
            CalculateStd(Ka.mean, Ka.std));
    _Vd[i] = jStat.lognormal.inv(Math.random(),
            CalculateMean(Vd.mean, Vd.std),
            CalculateStd(Vd.mean, Vd.std));
}

function CalculateABS(t, i) {
    var a1 = _F[i] * Dose;
    var a2 = 1 - Math.exp(-_Ka[i]*t);
    return a1*a2/_Vd[i];
}

function CalculateELI(i, p) {
    var a1 = VMAX * p * 1000;
    var a2 = (Km + p) * _Vd[i];
    return TimeInterval*a1/a2;
}

function CumulativeABS(t, i) {
    return t < Tau? CalculateABS(t, i) : CalculateABS(t, i) + CumulativeABS(t - Tau, i);
}

function AmountAtTime(t, i, j) {
    var abs = CumulativeABS(t,i);
    T += t%Tau==0? CalculateELI(i, abs):CalculateELI(i, j);
    return abs - T;
}

function RoundNDecimal(val, n) {
    n = Math.pow(10, n);
    return Math.round(val*n)/n;
}

function OnePopulation() {
    T = 0; var t = 0; var cmax = 0;
    var dataArray = new Array();
    while(t <= MaxTime)
    {
        var a = AmountAtTime(t, ActivePatient, t==0? 0:dataArray[dataArray.length-1][1]);
        cmax = a>cmax? a:cmax;
        dataArray.push([t,a,low,ht]);
        t += TimeInterval;
    }

    $("#SinglePatient_Dose").text(Dose.toString());
    $("#SinglePatient_F").text(RoundNDecimal(_F[ActivePatient], 2).toString());
    $("#SinglePatient_Vd").text(RoundNDecimal(_Vd[ActivePatient]/1000, 2).toString());
    $("#SinglePatient_Cmax").text(RoundNDecimal(cmax, 5).toString());

    return dataArray;
}

function AllPopulation() {
    var population = new Array(Math.ceil(MaxTime/TimeInterval));
    var f = 0, vd = 0, cmax = 0, t;

    for(var i = 0; i < population.length; i++)
    {
        population[i] = new Array(22);
        population[i][21] = 0;
    }

    for(var j = 0; j < 24; j++)
    {
        T = 0; t = 0;
        var local_max = 0;
        f += _F[j%20]/20*(j<20);
        vd += _Vd[j%20]/20*(j<20);
        for(var i = 0; i < population.length; i++)
        {
            if (j == 0) {
                population[i][j] = t;
            } else if (j < 21){
                population[i][j] = AmountAtTime(t, j-1, i==0? 0:population[i-1][j]);
                local_max = population[i][j]>local_max? population[i][j]:local_max;
                population[i][21] += population[i][j]/20;
            } else if (j > 21) {
                population[i][j] = j == 22? low : ht;
            }
            t += TimeInterval;
        }
        if (j == 0) continue;
        cmax += local_max/20;
    }

    $("#AllPatient_Dose").text(Dose.toString());
    $("#AllPatient_F").text(RoundNDecimal(f, 2).toString());
    $("#AllPatient_Vd").text(RoundNDecimal(vd/1000, 2).toString());
    $("#AllPatient_Cmax").text(RoundNDecimal(cmax, 5).toString());
    return population;
}

//Draw graph
function SetGraphData() {
    var data = onePopulation? OnePopulation() : AllPopulation();
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
            ticks:[0, 50, 100, 150, 200, 250, 300]
        },
        vAxis: {
            title: "Concentration (mg/L)",
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
            ticks: [0.005, 0.01, 0.015, 0.02, 0.025, 0.03]
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
        isStacked: true,
        series: {}
    }
    var table = new google.visualization.DataTable();
    table.addColumn("number", "Time");
    if (onePopulation) {
        table.addColumn("number", "Patient-"+(ActivePatient+1).toString());
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        chart_styling.series = {
            0: {color: '#00FF00', type: 'line'},
            1: {color: 'transparent', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0},
            2: {color: '#666600', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0}
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
                    visibleInLegend: false,
                    type: 'line'
                };
            else
                chart_styling.series[i-1] = {
                    lineWidth: 3,
                    color: "#00FF00",
                    visibleInLegend: true,
                    type: 'line'
                };
        }
        table.addColumn("number", "Average");
        table.addColumn("number", "low");
        table.addColumn("number", "high");
        chart_styling.series["20"] = {
            lineWidth: 3,
            color: "#FF0000",
            visibleInLegend: true,
            type: 'line'
        };
        chart_styling.series["21"] = {
            color: 'transparent', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0
        };
        chart_styling.series["22"] = {
            color: '#666600', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0
        };
    }
    table.addRows(data);
    var chart = new google.visualization.ComboChart(document.getElementById("ChartArea"));
    chart.draw(table, chart_styling);
}