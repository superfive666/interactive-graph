import {LogNormal} from 'public/StatsDistribution.js';
import {Normal} from 'public/StatsDistribution.js';
import {Parameters} from 'public/ComplianceBaseParameters.js';
import {compliance} from 'public/ChartStyling.js';
import {controllers} from 'public/ComplianceControl.js';

// ----------------------------------------------------------------------
// GLOBAL CONTROL VARIALBES
// ----------------------------------------------------------------------
let graphs = new Array(); // Fields to track: Tau, Dose, Max_Dose, DoseN, TimeN, 
let patients = new Array();
let curGraph = 0;
let timeInterval = 0.25;
let hMax = 300;
let message = {
    Data: {},
    Display: {
        FirstPopulation: true,
        ActivePatient: curGraph + 1,
        OnePopulation: true
    },
    ChartStyle: compliance(hMax)
}

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

// ----------------------------------------------------------------------
// PAGE EVENT EXPORT FUNCTIONS
// ----------------------------------------------------------------------
$w.onReady(function () {
    onLoad();
});

// ----------------------------------------------------------------------
// PAGE LOGIC FUNCTIONS BELOW
// ----------------------------------------------------------------------
function onLoad() {
    var base = Parameters;
    graphs.push(base);
    var patient = generatePatient(graphs[curGraph]);
    patients.push(patient);
    $w(controllers.DataTable).data(graphs);
    drawGraph(patient);
}

function slider(type, val) {
    message.Data.forEach(row => {
        if(type === 1) row[22] = val;
        else row[23] = val - row[22];
    });
    postMessage();
}

function randomize() {
    // Randomize F, Ka, Vd
    var f_mean = undefined;
    var f_std = undefined;
    

}

function addGraph() {

}

function removeGraph(ind) {

}

function switchGraph(ind) {

}

// ----------------------------------------------------------------------
// BASE FUNCTIONS BELOW
// ----------------------------------------------------------------------
function drawGraph(patient) {
    message.Data = getData(patient);
    console.log("Data calculated:");
    console.log(message.Data);
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
    var tt = t - patient.startTime[patient.dose_no];
	var a1 = patient.f * patient.dose * patient.ka;
	var a2 = patient.vd * (patient.ka - patient.ke);
	var a3 = Math.exp(-patient.ke * tt) - Math.exp(-patient.ka * tt);
	var res = patient.tauTime[patient.dose_no] === 0? 0 : a1 * a3 / a2;
	if(t > patient.startTime[patient.dose_no]) {
		patient.dose_no++;
		return res + calc(t, patient);
	}
	return res;
}

function generatePatient(condition) {
    var patient = {};
    patient["f"] = condition.f_mean;
    patient["dose"] = condition.dose;
    patient["tau_mean"] = condition.tau_mean;
    patient["vd"] = condition.vd_mean;
    patient["ka"] = condition.ka_mean;
    patient["max_dose"] = condition.max_dose;
    patient["thalf"] = Normal.inv(Math.random(), condition.thalf_mean, condition.thalf_std);
    patient["ke"] = Math.log(2)/patient.thalf;
    patient["cl"] = patient.ke * patient.vd;
    patient["dose_non_compliance"] = condition.dose_non_compliance;
    patient["time_non_compliance"] = condition.time_non_compliance;
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
            {prob: 0, val: 1},
            {prob: patient.dose_non_compliance * (24.0 / patient.tau_mean) / 100.0, val: 2}
        ]);
        tauTime.push(type === 1? 0.00 : Normal.inv(Math.random(), patient.tau_mean, patient.tau_std));
        startTime.push(type === 1? startTime[startTime.length-1] + patient.tau_mean 
            : startTime[startTime.length-1] + tauTime[tauTime.length-2]);
    }
    patient["start_time"] = startTime;
    return patient;
}

function postMessage() {
    $w(controllers.GraphArea).postMessage(message, "*");
}