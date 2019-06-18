import {LogNormal} from 'public/StatsDistribution.js';
import {Normal} from 'public/StatsDistribution.js';
import {StepFunction} from 'public/StatsDistribution.js';
import {Parameters} from 'public/ComplianceBaseParameters.js';
import {compliance} from 'public/ChartStyling.js';
import {controllers} from 'public/ComplianceControl.js';
import {generateIdString} from 'public/IdGenerator.js';

import wixWindow from 'wix-window';

// ----------------------------------------------------------------------
// GLOBAL CONTROL VARIALBES
// ----------------------------------------------------------------------
let graphs = new Array();
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

const tauTitle = "Tau (hr)";
const doseTitle = "Dose (mg)";
const maxDoseTitle = "Max Dosage";
const doseNoneComplianceTitle = "Dose Non-compliance";
const timeNoneComplianceTitle = "Time Non-compliance"; 
const rowDescriptioon = "click view to view this graph, click delete to remove the graph from history";

const graphPrefix = "Graph #";

const ENABLE = "enable";
const DISABLE = "disable";
// ----------------------------------------------------------------------
// PAGE EVENT EXPORT FUNCTIONS
// ----------------------------------------------------------------------
$w.onReady(function () {
    initTable();
    $w(controllers.GraphArea).onMessage((event) => {
		if (event.data === "Ready") {
            onLoad();
            console.log("After On Load: ");
            console.log($w(controllers.GraphHistory).data);
		}
    });
});

export function RandomButton_click(event) {
    return; // Do nothing for now
	randomize();
}

export function AddGraphButton_click(event) {
	addGraph();
}

export function ViewGraphButton_click_1(event) {
    let $item = $w.at(event.context);
    let title = $item(controllers.RowTitle).text;
    let index = parseInt(title.substr(-(title.length - title.indexOf("#")-1)))-1;
    console.log("Index pressed: " + index);
    let graph = graphs[index];
    viewGraph($item, graph._id, index);
}

export function RemoveGraphButton_click(event) {
	console.log("Delete Graph Button Clicked.");
    let $item = $w.at(event.context);
    let title = $item(controllers.RowTitle).text;
    let index = parseInt(title.substr(-(title.length - title.indexOf("#")-1)))-1;
    console.log("Index pressed: " + index);
    let graph = graphs[index];
    removeGraph($item, graph._id, index);
}

export function MinRangeInput_change(event) {
	minInputChange();
}

export function MaxRangeInput_change(event) {
	maxInputChange();
}

export function MinRangeInput_click(event) {
	minInputChange();
}

export function MaxRangeInput_click(event) {
	maxInputChange();
}

// ----------------------------------------------------------------------
// PAGE LOGIC FUNCTIONS BELOW
// ----------------------------------------------------------------------
function initTable() {
    // Handle item addition, handle item view and delete event 
    $w(controllers.GraphHistory).onItemReady(($item, data, index) => {
        console.log("Item added, the id of the item is:" + data._id);
        $item(controllers.RowDescription).text = rowDescriptioon;
        $item(controllers.TauTitle).text = tauTitle;
        $item(controllers.DoseTitle).text = doseTitle;
        $item(controllers.MaxDoseTitle).text = maxDoseTitle;
        $item(controllers.DoseNoneComplyTitle).text = doseNoneComplianceTitle;
        $item(controllers.TimeNoneComplyTitle).text = timeNoneComplianceTitle;
        console.log("Constant values set.");

        console.log("index: " + index);
        console.log(graphPrefix + (index + 1));
        $item(controllers.RowTitle).text = graphPrefix + (index + 1);
        $item(controllers.TauValue).text = (formatNDecimal(parseFloat(data.tauValue), 2)).toString();
        var tab = formatNDecimal(data.doseValue/175, 0);
        $item(controllers.DoseValue).text = tab === 1? "1 tablet" : tab.toString() + "tablets";
        $item(controllers.MaxDoseValue).text = data.maxDoseValue.toString();
        $item(controllers.DoseNoneComplyValue).text = formatNDecimal(data.doseNoneComplianceValue*100, 0).toString() + "%";
        $item(controllers.TimeNoneComplyValue).text = formatNDecimal(data.timeNoneComplianceValue*100, 0).toString() + "%";
        console.log("Variable values set.");
        
        $item(controllers.ViewGraphButton).disable();
        $item(controllers.ViewGraphButton).label = "current";
    });

    // Handle item removal
    $w(controllers.GraphHistory).onItemRemoved((data) => {
        console.log("The following data removed from graph history: ");
        console.log(data);
    });
}

function onLoad() {
    $w(controllers.MaxDose).disable();
    var base = JSON.parse(JSON.stringify(Parameters));
    graphs = new Array();
    base._id = generateIdString();
    curGraphId = base._id;
    base.patient = generatePatient(base);
    graphs.push(base);
    $w(controllers.GraphHistory).data = graphs;
    drawGraph(base.patient);
}

function minInputChange() {
    var min = parseFloat($w(controllers.MinRangeInput).value);
    $w(controllers.MaxRangeInput).min = min;
    slider();    
}

function maxInputChange() {
    var max = parseFloat($w(controllers.MaxRangeInput).value);
    $w(controllers.MinRangeInput).max = max;
    slider();
}

function slider() {
    var min = parseFloat($w(controllers.MinRangeInput).value);
    var max = parseFloat($w(controllers.MaxRangeInput).value);
    graphs[curGraph].patient.low = min;
    graphs[curGraph].patient.ht = max - min;
    message.Data.forEach(row => {
        row[22] = min;
        row[23] = max - min;
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
    $w(controllers.FCurrentValue).text = graphs[curGraph].f_mean.toString();
    $w(controllers.KaCurrentValue).text = graphs[curGraph].ka_mean.toString();
    $w(controllers.VdCurrentValue).text = graphs[curGraph].vd_mean.toString();
    drawGraph(graphs[curGraph].patient);
}

function addGraph() {
    var graph = JSON.parse(JSON.stringify(Parameters));
    $w(controllers.FCurrentValue).text = formatNDecimal(graph.f_mean, 3).toString();
    $w(controllers.KaCurrentValue).text = formatNDecimal(graph.ka_mean, 3).toString();
    $w(controllers.VdCurrentValue).text = formatNDecimal(graph.vd_mean, 3).toString();

    graph.tauValue = parseFloat($w(controllers.Tau).value);
    graph.doseValue = parseFloat($w(controllers.Dose).value);
    graph.maxDoseValue = 23 /*$w(controllers.MaxDose).value*/;
    graph.doseNoneComplianceValue = parseFloat($w(controllers.DoseNoneComply).value);
    graph.timeNoneComplianceValue = parseFloat($w(controllers.TimeNoneComply).value);

    graph.patient = generatePatient(graph);
    graph._id = generateIdString();

    $w(controllers.MinRangeInput).value = graph.patient.low;
    $w(controllers.MaxRangeInput).value = graph.patient.low + graph.patient.ht;

    changeGraphButton(curGraphId, ENABLE);

    curGraphId = graph._id;
    curGraph = graphs.length;
    graphs.push(graph);

    $w(controllers.GraphHistory).data = graphs;
    drawGraph(graph.patient);
}

function removeGraph($item, id, index) {
    if(graphs.length === 1) {
        //let target = "LAST_GRAPH_WARNING";
        //wixWindow.openLightbox(target, {});
        return;
    }
    graphs = graphs.filter(function(val, idx) {return idx !== index;});
    if(curGraph === index) {
        curGraph = (index) % graphs.length;
        curGraphId = graphs[curGraph]._id;
        changeGraphButton(curGraphId, DISABLE);
        drawGraph(graphs[curGraph].patient);
        console.log("After removing, showing graph #" + (curGraph+1));
    }
    $w(controllers.GraphHistory).data = graphs;
    $w(controllers.GraphHistory).forEachItem(($cur, itemData, idx) => {
        $cur(controllers.RowTitle).text = graphPrefix + (idx + 1);
    })
    console.log("Graph removed");
}

function viewGraph($item, id, index) {
    console.log("Previous graph id: " + curGraphId);
    console.log("Current graph id: " + id);

    changeGraphButton(curGraphId, ENABLE);
    $item(controllers.ViewGraphButton).disable();
    $item(controllers.ViewGraphButton).label = "current";
    $w(controllers.FCurrentValue).text = graphs[index].f_mean.toString();
    $w(controllers.KaCurrentValue).text = graphs[index].ka_mean.toString();
    $w(controllers.VdCurrentValue).text = graphs[index].vd_mean.toString();

    $w(controllers.MinRangeInput).value = graphs[index].patient.low;
    $w(controllers.MaxRangeInput).value = graphs[index].patient.low + graphs[index].patient.ht;

    drawGraph(graphs[index].patient);
    curGraphId = id;
    curGraph = index;
}

// ----------------------------------------------------------------------
// BASE FUNCTIONS BELOW
// ----------------------------------------------------------------------
function drawGraph(patient) {
    message.Data = getData(patient);
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
        rowData[22] = patient.low;
        rowData[23] = patient.ht;
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
    patient["tau_std"] = patient.tau_mean * patient.time_non_compliance /* 0.03*/;
    patient["low"] = condition.low;
    patient["ht"] = condition.ht;
    patient["dose_no"] = 0;
    patient["h_max"] = condition.horizontal_max;
    patient["cmin"] = 0;
    return updatePatientStartTime(patient, patient.max_dose);
}

function updatePatientStartTime(patient, n) {
    var tauTime = new Array(1);
    tauTime[0] = patient.tau_mean;
    var startTime = new Array(1);
    startTime[0] = 0; n--;
    while(n--) {
        var type = StepFunction.inv(Math.random(), [
            {prob: patient.dose_non_compliance /* (24.0 / patient.tau_mean) / 100.0*/, val: 1},
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
    console.log("Message posted.");
    console.log(message.Data);
    $w(controllers.GraphArea).postMessage(message, "*");
}

function formatNDecimal(val, n) {
    n = Math.pow(10, n);
    return Math.round(val * n) / n;
}

function changeGraphButton(graphId, type) {
    $w(controllers.GraphHistory).forItems([graphId], ($item) => {
        if(type === ENABLE) {
            $item(controllers.ViewGraphButton).enable();
            $item(controllers.ViewGraphButton).label = "view";
        } else if (type === DISABLE) {
            $item(controllers.ViewGraphButton).disable();
            $item(controllers.ViewGraphButton).label = "current";
        }
    });
}