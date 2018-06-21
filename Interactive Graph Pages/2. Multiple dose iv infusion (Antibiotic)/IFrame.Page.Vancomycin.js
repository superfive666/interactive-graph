//Global parameters defined here
var BodyWeight = 65;
var VolumnDistribution = {mean: 1.1, std: 0.4};
var Tau = 8;
var Infusion = 2;
var Dose = 500;
var Clearance = {mean: 100, std: 16};
var MIC = 1;
var hMax = 60;
var vMax = 0;
var onePopulation = true;
var firstPopulation = true;
var DefaultPatient, DefaultTau, DefaultDose, ActivePatient, Washout;

//Calculation parameters defined here
var clearance, actualKe;
var _K0, _Ke, _Vd;
var _First20Patients = {};

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

//Page Logic define here
$(document).ready(function () {							
    window.addEventListener("message", ReceiveMessage, false);
    Washout = Tau - Infusion;
    ActivePatient = Math.floor(Math.random() * 20);
    EmptyParameters();
    First20Patients();
    SaveDefault();
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(SetGraphData);
    SetGraphData();
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

//Behavior function define below
function ReceiveMessage(e) {
    if (e.data.Message == undefined) 
    {
        alert("Unrecognized message received.");
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
        case messageRepository.BackToFirstPatient: GoBackDefault(); break;
        case messageRepository.Yes: YesOnClick(); break;
        case messageRepository.OptimizeCondition: 
            var freq = e.data.Frequency;
            var dose = e.data.Dosage;
            if (freq == undefined || dose == undefined) 
            {
                alert("Incomplete input parameters!");
                return;
            }
            OptimizeCondition(dose, freq);
            break;
        default: alert("Invalid message posted!"); break;
    }
}

function YesOnClick() {
    onePopulation = !onePopulation;
    SetGraphData();
}

function OptimizeCondition (dose, freq) {
    RetrieveDefault();
    Dose = parseInt(dose);
    if (isNaN(Dose)) 
    {
        alert("Invalid dosage input!");
        return;
    }
    for(var i = 0; i < 20; i++)
    {
        _K0[i] = Dose;
    }
    Tau = parseInt(freq);
    Washout = Tau - Infusion;
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

function ShowPatientData () {
    var target = onePopulation? $("#SinglePatientData") : $("#PopulationModal");
    target.css("display", "block");
}

function GoBackDefault () {
    RetrieveDefault();
    firstPopulation = true;
    SetGraphData();
}	

function ChangePopulation () {
    firstPopulation = false;
    First20Patients();	
    SetGraphData();
}

function SaveDefault () {
    _First20Patients["clearance"] = clearance.slice();
    _First20Patients["actualKe"] = actualKe.slice();
    _First20Patients["_K0"] = _K0.slice();
    _First20Patients["_Ke"] = _Ke.slice();
    _First20Patients["_Vd"] = _Vd.slice();
    DefaultPatient = ActivePatient;
    DefaultDose = Dose;
    DefaultTau = Tau;
}

function RetrieveDefault () {
    EmptyParameters();
    clearance = _First20Patients.clearance.slice();
    actualKe = _First20Patients.actualKe.slice();
    _K0 = _First20Patients._K0.slice();
    _Ke = _First20Patients._Ke.slice();
    _Vd = _First20Patients._Vd.slice();
    ActivePatient = DefaultPatient;
    Dose = DefaultDose;
    Tau = DefaultTau;
}

//Calculation function define below		
function CalculateMean(m, s){
    var a1 = m * m;
    var a2 = Math.sqrt(m * m + s * s);
    return Math.log(a1/a2);
}
function CalculateStd(m, s){
    var a1 = m * m;
    var a2 = a1 + s * s;
    return Math.sqrt(Math.log(a2/a1));
}

function EmptyParameters() {
    _K0 = [];
    _Vd = [];
    clearance = [];
    actualKe = [];
    _Ke = [];
}

function PrepareParameters() {								
    _K0.push(Dose);
    _Vd.push(jStat.lognormal.inv(Math.random(), 
                              CalculateMean( VolumnDistribution.mean, VolumnDistribution.std),
                              CalculateStd( VolumnDistribution.mean, VolumnDistribution.std)) * BodyWeight);
                              
    clearance.push(jStat.lognormal.inv(Math.random(), 
                                    CalculateMean(Clearance.mean, Clearance.std),
                                    CalculateStd(Clearance.mean, Clearance.std)));
                                    
    actualKe.push(Math.min(0.9999, (clearance[clearance.length - 1]*60)/(_Vd[_Vd.length - 1]*1000)));
    _Ke.push(Math.log(1) - Math.log(1 - actualKe[actualKe.length - 1]));
}

function First20Patients() {
    EmptyParameters();
    for(var i = 0; i < 20; i++)
        PrepareParameters();
}

function SetGraphData() {
    var data;
    if (onePopulation)
    {
        data = OnePopulation();
    }
    else
    {
        data = AllPopulation();
    }
    DrawGraph(data);
}

function f1(t, i){
    var a1 = _K0[i];
    var a2 = _Ke[i] * _Vd[i];
    var a3 = 1 - Math.exp(-_Ke[i]*Infusion);
    var a4 = Math.exp(-_Ke[i]*(t-Infusion));
    return a1*a3*a4/a2;
}

function f2(t,i) {
    var a1 = _K0[i];
    var a2 = _Ke[i] * _Vd[i];
    var a3 = 1 - Math.exp(-_Ke[i]*t);
    return a1*a3/a2;
}

function CalculateAmount(t, i) {
    return t > Infusion? f1(t, i):f2(t, i);
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
    var cmin = 1000000, cmax = 0, cave = 0, auc = 0;
    var dataArray = new Array();
    var t = 0;
    while (t < 60)
    {
        var a = AmountAtTime(t, ActivePatient);
        dataArray.push([t, a]);
        t += 0.25;
        if (a > vMax) vMax = a;
        if (t >= 60 - Tau) 
        {	
            cave += a/24;
            if (a > cmax) cmax = a;
            if (a < cmin) cmin = a;
        }
    }				
    
    for(var i = 240 - 24*4; i < 240; i++) auc += dataArray[i][1];
    
    $("#SinglePatient_IfsRt").text(Round2Decimal(Dose).toString());
    $("#SinglePatient_Vd").text(Round2Decimal(_Vd[ActivePatient]).toString());
    $("#SinglePatient_Cl").text(Round2Decimal(clearance[ActivePatient]).toString());
    $("#SinglePatient_THalf").text(Round2Decimal((Math.log(2)/_Ke[ActivePatient])).toString());
    $("#SinglePatient_Ka").text(Round2Decimal(actualKe[ActivePatient]).toString());
    $("#SinglePatient_CMin").text(Round2Decimal(cmin).toString());
    $("#SinglePatient_CMax").text(Round2Decimal(cmax).toString());
    $("#SinglePatient_CAve").text(Round2Decimal(cave).toString());
    $("#SinglePatient_AUC24").text(Round2Decimal(auc).toString());
    $("#SinglePatient_AUC24_MIC").text(Round2Decimal(auc/MIC).toString());
    $("#SinglePatient_SteadyT").text(Round2Decimal((Math.log(2)/_Ke[ActivePatient])*4.5).toString());
    
    vMax = Math.round(vMax*10)/10;
    return dataArray;
}

function AllPopulation() {					
    var population = new Array(240);
    var vd = 0, cl = 0, thalf = 0, ke = 0, cmin = 1000000, cmax = 0, auc = 0;
    
    for(var i = 0; i < 240; i++)
    {
        population[i] = new Array(22);
        population[i][21] = 0;
    }
    for(var j = 0; j < 21; j++)
    {	
        var local_max = 0; 
        vd += (_Vd[j%20]/20)*(j<20);
        cl += clearance[j%20]/20*(j<20);
        thalf += Math.log(2)/_Ke[j%20]/20*(j<20);
        ke += actualKe[j%20]/20*(j<20);
        for(var i = 0; i < 240; i++)
        {
            var t = i * 0.25;
            if (j == 0) {
                population[i][j] = t;
            }
            else {
                population[i][j] = AmountAtTime(t,j-1);
                if (population[i][j] > vMax) vMax = population[i][j];
                if (population[i][j] > local_max) local_max = population[i][j];
                population[i][21] += population[i][j]/20;
            }
        }
        
        if (j == 0) continue;
        if (local_max < cmin && i >= 240 - Tau*4) cmin = local_max;
        if (local_max > cmax && i >= 240 - Tau*4) cmax = local_max;
    }
    
    for(var i = 240 - 24*4; i < 240; i++) auc += population[i][21];
    
    $("#AllPatient_IfsRt").text(Round2Decimal(Dose).toString());
    $("#AllPatient_Vd").text(Round2Decimal(vd).toString());
    $("#AllPatient_Cl").text(Round2Decimal(cl).toString());
    $("#AllPatient_Ka").text(Round2Decimal(ke).toString());
    $("#AllPatient_THalf").text(Round2Decimal(thalf).toString());
    $("#AllPatient_CMin").text(Round2Decimal(cmin).toString());
    $("#AllPatient_CMax").text(Round2Decimal(cmax).toString());
    $("#AllPatient_AUC24").text(Round2Decimal(auc).toString());
    $("#AllPatient_AUC24_MIC").text(Round2Decimal(auc/MIC).toString());
    $("#AllPatient_SteadyT").text(Round2Decimal(thalf*4.5).toString());
    
    vMax = Math.round(vMax*10)/10;
    return population;
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