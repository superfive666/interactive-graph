//Global parameters defined here
var Gender = "Male";
var Race = "Chinese";
var Age = 30;
var BodyWeight = 65;
var Height = 1.8;
var Dose = 100;
var Dose = 75;
var Tau = 12;
var VolumnDistribution = {mean: 8, std: 1.6};
var ExtractionRate = {mean: 0.1, std: 0.02};
var Ka = {mean: 2, std: 0.4};
var Clearance = {mean: 15, std: 3};
var hMax = 100;
var vMax = 0;
var clearance, actualKe;
var onePopulation = true;
var firstPopulation = true;
var ActivePatient;

//Message repository variables
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

//Calculation parameters defined here
var _F, _D, _Ka, _Ke, _Vd;
var _First20Patients = {};

//Default values stored here
var DefaultDose, DefaultTau, DefaultPatient;

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

$(document).ready(function () {
    window.addEventListener("message", ReceiveMessage, false);
    InitVariables();
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(SetGraphData);    
});

//Behavioural functions define below
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
    _D = new Array(20);
    _Ka = new Array(20);
    _Ke = new Array(20);
    _Vd = new Array(20);

    clearance = new Array(20);
    actualKe = new Array(20);

    Generate20();
    SaveDefault();
}

function SaveDefault() {
    DefaultPatient = ActivePatient;
    _First20Patients["_F"] = _F.slice();
    _First20Patients["_D"] = _D.slice();
    _First20Patients["_Ka"] = _Ka.slice();
    _First20Patients["_Ke"] = _Ke.slice();
    _First20Patients["_Vd"] = _Vd.slice();
    _First20Patients["clearance"] = clearance.slice();
    _First20Patients["actualKe"] = actualKe.slice();
    DefaultDose = Dose;
    DefaultTau = Tau;
}

function RetrieveDefault(){
    ActivePatient = DefaultPatient;
    _F = _First20Patients._F.slice();
    _D = _First20Patients._D.slice();
    _Ka = _First20Patients._Ka.slice();
    _Ke = _First20Patients._Ke.slice();
    _Vd = _First20Patients._Vd.slice();
    clearance = _First20Patients.clearance.slice();
    actualKe = _First20Patients.actualKe.slice();
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

    for(var i = 0; i < 20; i++)
    {
        _D[i] = Dose;
    }
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

function PrepareParameters(i) {
    var f = jStat.lognormal.inv(Math.random(), 
                                CalculateMean(ExtractionRate.mean, ExtractionRate.std),
                                CalculateStd(ExtractionRate.mean, ExtractionRate.std));
    _F[i] = 1 - f;
    _D[i] = Dose;
    _Ka[i] = jStat.lognormal.inv(Math.random(), 
                              CalculateMean(Ka.mean, Ka.std),
                              CalculateStd(Ka.mean, Ka.std));
    _Vd[i] = _F[i] * jStat.lognormal.inv(Math.random(), 
                                   CalculateMean(VolumnDistribution.mean, VolumnDistribution.std),
                                   CalculateStd(VolumnDistribution.mean, VolumnDistribution.std));
    clearance[i] = jStat.lognormal.inv(Math.random(), 
                                        CalculateMean(Clearance.mean, Clearance.std),
                                        CalculateStd(Clearance.mean, Clearance.std)) * _F[i];
    actualKe[i] = Math.min((clearance[i]*60)/(_Vd[i]*1000), 0.9999);
    _Ke[i] = Math.log(1) - Math.log(1-actualKe[i]);
}

function CalculateAmount(t, i) {
    var a1 = _F[i] * _D[i] * _Ka[i];
    var a2 = _Vd[i] * (_Ka[i] - _Ke[i]);
    var a3 = Math.exp(-_Ke[i]*t) - Math.exp(-_Ka[i]*t);
    return a1*a3/a2;
}

function AmountAtTime(t, i) {
    if (t < Tau)
        return CalculateAmount(t, i);
    else
        return AmountAtTime(t - Tau, i) + CalculateAmount(t, i);
}

function Round2Decimal(val) {
    return Math.round(val*100)/100;
}

function OnePopulation() {
    var dataArray = new Array();
    var t = 0;
    while (t <= hMax)
    {
        var a = AmountAtTime(t, ActivePatient)
        dataArray.push([t, a]);
        t += 0.25;

        if (a > vMax) vMax = a;
    }
    
    $("#SinglePatient_Vd").text(Round2Decimal(_Vd[ActivePatient]).toString());
    $("#SinglePatient_Cl").text(Round2Decimal(clearance[ActivePatient]).toString());
    $("#SinglePatient_THalf").text(Round2Decimal((Math.log(2)/_Ke[ActivePatient])).toString());
    $("#SinglePatient_Ka").text(Round2Decimal(actualKe[ActivePatient]).toString());
    $("#SinglePatient_CMin").text("0.00");
    $("#SinglePatient_CMax").text(Round2Decimal(vMax).toString());
    
    vMax = Math.round(vMax*10)/10;
    return dataArray;
}

function AllPopulation() {						
    var population = new Array(hMax*4);
    var vd = 0, cl = 0, thalf = 0, ke = 0, cmin = 1000000, cmax = 0;
    
    for(var i = 0; i < hMax*4; i++)
    {
        population[i] = new Array(22);
        population[i][21] = 0;
    }

    for(var j = 0; j < 21; j++)
    {	
        var local_max = 0; 
        vd += _Vd[j%20]/20*(j<20);
        cl += clearance[j%20]/20*(j<20);
        thalf += Math.log(2)/_Ke[j%20]/20*(j<20);
        ke += actualKe[j%20]/20*(j<20);
        for(var i = 0; i < hMax*4; i++)
        {
            var t = i * 0.25;
            if (j == 0) {
                population[i][j] = t;
            }
            else {
                population[i][j] = AmountAtTime(t, j-1);
                if (population[i][j] > vMax) vMax = population[i][j];
                if (population[i][j] > local_max) local_max = population[i][j];
                population[i][21] += population[i][j]/20;
            }
        }
        
        if (j == 0) continue;
        if (local_max < cmin) cmin = local_max;
        if (local_max > cmax) cmax = local_max;
    }

    $("#AllPatient_Vd").text(Round2Decimal(vd).toString());
    $("#AllPatient_Cl").text(Round2Decimal(cl).toString());
    $("#AllPatient_Ka").text(Round2Decimal(ke).toString());
    $("#AllPatient_THalf").text(Round2Decimal(thalf).toString());
    $("#AllPatient_CMin").text(Round2Decimal(cmin).toString());
    $("#AllPatient_CMax").text(Round2Decimal(cmax).toString());
    
    vMax = Math.round(vMax*10)/10;
    return population;
}

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
            ticks:[0, 25, 50, 75, 100]
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
            ticks: [2, 4, 6, 8, 10, 12, 14]
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