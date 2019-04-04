import {LogNormal} from 'public/StatsDistribution.js';
import {Normal} from 'public/StatsDistribution.js';
import {StepFunction} from 'public/StatsDistribution.js';
import {Parameters} from 'public/ComplianceBaseParameters.js';
import {compliance} from 'public/ChartStyling.js';
import {controllers} from 'public/ComplianceControl.js';
import {generateIdString} from 'public/IdGenerator.js';

// ----------------------------------------------------------------------
// GLOBAL CONTROL VARIALBES
// ----------------------------------------------------------------------
let graphs = new Array(); // Fields to track: Tau, Dose, Max_Dose, DoseN, TimeN, 
let curGraph = 0;
let curGraphId = "";
let timeInterval = 0.25;
let hMax = 250;
let message = {
    Data: {},
    Display: {
        FirstPopulation: true,
        ActivePatient: curGraph,
        OnePopulation: true
    },
    ChartStyle: compliance(hMax)
};
let Calculate = {
    AdjustedMean: function AdjustedMean(m, s) {
        var a1 = m * m;
        var a2 = Math.sqrt(a1 + s * s);
        return Math.log(a1 / a2);
    },
    AdjustedStd: function AdjustedStd(m, s) {
        var a1 = m * m;
        var a2 = a1 + s * s;
        return Math.sqrt(Math.log(a2 / a1));
    }
}

const tauTitle = "Tau (hours)";
const doseTitle = "Dose (mg)";
const maxDoseTitle = "Max Dosage";
const doseNoneComplianceTitle = "Dose Non-compliance";
const timeNoneComplianceTitle = "Time Non-compliance"; 
const rowDescriptioon = "click view to view this graph, click delete to remove the graph from history";
const lastGraphWarning = "You are not allowed to remove the last graph from history";

const graphPrefix = "Graph-";
// ----------------------------------------------------------------------
// PAGE EVENT EXPORT FUNCTIONS
// ----------------------------------------------------------------------
$w.onReady(function () {
    initTable();
    initControl();
    onLoad();
});

// ----------------------------------------------------------------------
// PAGE LOGIC FUNCTIONS BELOW
// ----------------------------------------------------------------------
function initControl() {
    // Handle Add Graph Button Click
    $w(controllers.AddGraphButton).onClick(() => {addGraph();});

    // Handle Randomize Button Click
    $w(controllers.RandomButton).onClick(() => {randomize();});

    // Handle Min Slider Change
    $w(controllers.MinSlider).onChange(() => {slider();});

    // Handle Max Slider Change
    $w(controllers.MaxSlider).onChange(() => {slider();});
}

function initTable() {
    // Handle item addition, handle item view and delete event 
    $w(controllers.GraphHistory).onItemReady(($item, data, index) => {
        $item(controllers.RowDescription).text = rowDescriptioon;
        $item(controllers.TauTitle).text = tauTitle;
        $item(controllers.DoseTitle).text = doseTitle;
        $item(controllers.MaxDoseTitle).text = maxDoseTitle;
        $item(controllers.DoseNoneComplianceTitle).text = doseNoneComplianceTitle;
        $item(controllers.TimeNoneComplianceTitle).text = timeNoneComplianceTitle;

        $item(controllers.RowTitle).text = graphPrefix + index;
        $item(controllers.TauValue).text = (formatNDecimal(parseFloat(data.tauValue))).toString();
        $item(controllers.DoseValue).text = data.doseValues.toString();
        $item(controllers.maxDoseValue).text = data.maxDoseValue.toString();
        $item(controllers.DoseNoneComplianceValue).text = data.doseNoneComplianceValue.toString();
        $item(controllers.TimeNoneComplianceValue).text = data.timeNoneComplianceValue.toString();

        $item(controllers.ViewGraphButton).onClick(()=>{removeGraph($item, data._id, index);});
        $item(controllers.RemoveGraphButton).onClick(()=>{viewGraph($item, data._id, index);});
    });

    // Handle item removal
    $w(controllers.GraphHistory).onItemRemoved((data) => {
        console.log("The following data removed from graph history: ");
        console.log(data);
    });
}


function onLoad() {
    var base = Parameters;
    base._id = generateIdString();
    curGraphId = base._id;
    base.patient = generatePatient(base);
    graphs.push(base);
    $w(controllers.GraphHistory).data = graphs;
    drawGraph(base.patient);
}

function slider() {
    var min = $w(controllers.MinSlider).value;
    var max = $w(controllers.MaxSlider).value;
    message.Data.forEach(row => {
        row[22] = Math.min(min, max);
        row[23] = Math.abs(max - min);
    });
    postMessage();
}

function randomize() {
    // Randomize F, Ka, Vd
    var f_mean = parseFloat($w(controllers.FSelector).value);
    var f_std = f_mean * 0.2;
    graphs[curGraph].f_mean = LogNormal.inv(Math.random(), 
        Calculate.AdjustedMean(f_mean, f_std), Calculate.AdjustedStd(f_mean, f_std));
    var ka_mean = parseFloat($w(controllers.KaSelector).value);
    var ka_std = ka_mean * 0.2;
    graphs[curGraph].ka_mean = LogNormal.inv(Math.random(), 
        Calculate.AdjustedMean(ka_mean, ka_std), Calculate.AdjustedStd(ka_mean, ka_std));
    var vd_mean = parseFloat($w(controllers.VdSelector).value);
    var vd_std = vd_mean * 0.2;
    graphs[curGraph].vd_mean = LogNormal.inv(Math.random(), 
        Calculate.AdjustedMean(vd_mean, vd_std), Calculate.AdjustedStd(vd_mean, vd_std));
    graphs[curGraph].patient = generatePatient(graphs[curGraph]);
    drawGraph(graphs[curGraph].patient);
}

function addGraph() {
    var graph = Parameters;
    $w(controllers.FCurrentValue).text = graph.f_mean;
    $w(controllers.KaCurrentValue).text = graph.ka_mean;
    $w(controllers.VdCurrentValue).text = graph.vd_mean;
    graph.patient = generatePatient(graph);
    graph._id = generateIdString();
    curGraphId = graph._id;
    graphs.push(graph);
    $w(controllers.GraphHistory).data = graphs;
    drawGraph(graph.patient);
}

function removeGraph($item, id, index) {
    if(graphs.length === 1) {
        //window.alert(lastGraphWarning);
        return;
    }
    curGraph = (index + 1) % graphs.length;
    curGraphId = graphs[curGraph]._id;
    console.log("After removing, showing graph #" + curGraph);
    console.log("After removing, showing graph id: " + curGraphId);
    $w(controllers.GraphHistory).forItems([curGraphId], ($current) => {
        $current(controllers.ViewGraphButton).disable();
    });
    drawGraph(graphs[curGraph].patient);
}

function viewGraph($item, id, index) {
    console.log("Previous graph id: " + curGraphId);
    console.log("Current graph id: " + id);
    $w(controllers.GraphHistory).forItems([curGraphId], ($current) => {
        $current(controllers.ViewGraphButton).enable();
    });
    $item(controllers.ViewGraphButton).disable();
    drawGraph(graphs[index].patient);
    curGraphId = id;
    curGraph = index;
}

// ----------------------------------------------------------------------
// BASE FUNCTIONS BELOW
// ----------------------------------------------------------------------
function drawGraph(patient) {
    message.Data = getData(patient);
    console.log("Data calculated:");
    console.log(message.Data);
    console.log("Display calculated:");
    console.log(message.Display);
    console.log("ChartStyle calculated:");
    console.log(message.ChartStyle);
    postMessage();
}

function getData(patient) {
    patient.dose_no = 0;
    console.log("Patient to be calculated:");
    console.log(patient);
    var data = new Array();
    for(var i = 0; i < patient.h_max; i += timeInterval) {
        var rowData = new Array();
        rowData.push(i);
        rowData.push(calc(i, patient));
        rowData.push(patient.low);
        rowData.push(patient.ht);
        data.push(rowData);
    }
    return data;
}

function calc(t, patient) {
    var res = 0, i = 0;
    while(t > patient.start_time[i]) {
        var tt = t - patient.start_time[i];
	    var a1 = patient.f * patient.dose * patient.ka;
	    var a2 = patient.vd * (patient.ka - patient.ke);
        var a3 = Math.exp(-patient.ke * tt) - Math.exp(-patient.ka * tt);
        res += (patient.tau_time[i] === 0? 0 : a1 * a3 / a2);
        i++;
    }
	return res;
}

function generatePatient(condition) {
    var patient = {};
    patient["f"] = condition.f_mean;
    patient["dose"] = condition.doseValue;
    patient["tau_mean"] = condition.tauValue;
    patient["vd"] = condition.vd_mean;
    patient["ka"] = condition.ka_mean;
    patient["max_dose"] = condition.maxDoseValue;
    patient["thalf"] = Normal.inv(Math.random(), condition.thalf_mean, condition.thalf_std);
    patient["ke"] = Math.log(2)/patient.thalf;
    patient["cl"] = patient.ke * patient.vd;
    patient["dose_non_compliance"] = condition.doseNoneComplianceValue;
    patient["time_non_compliance"] = condition.timeNoneComplianceValue;
    patient["tau_std"] = patient.tau_mean * patient.time_non_compliance * 0.03;
    patient["low"] = condition.low;
    patient["ht"] = condition.ht;
    patient["dose_no"] = 0;
    patient["h_max"] = condition.horizontal_max;
    patient["cmin"] = 0;
    return updatePatientStartTime(patient, patient.max_dose);
}

function updatePatientStartTime(patient, n) {
    var tauTime = new Array(1);
    tauTime[0] = 8;
    var startTime = new Array(1);
    startTime[0] = 0; n--;
    while(n--) {
        var type = StepFunction.inv(Math.random(), [
            {prob: patient.dose_non_compliance * (24.0 / patient.tau_mean) / 100.0, val: 1},
            {prob: 1, val: 2}
        ]);
        tauTime.push(type === 1? 0.00 : Normal.inv(Math.random(), patient.tau_mean, patient.tau_std));
        startTime.push(tauTime[tauTime.length-2] === 0? startTime[startTime.length-1] + patient.tau_mean 
            : startTime[startTime.length-1] + tauTime[tauTime.length-2]);
    }
    patient["start_time"] = startTime;
    patient["tau_time"] = tauTime;
    return patient;
}

function postMessage() {
    // Update the graph legend to the graph title

    $w(controllers.GraphArea).postMessage(message, "*");
}

function formatNDecimal(val, n) {
    n = Math.pow(10, n);
    return Math.round(val * n) / n;
}