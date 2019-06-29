import {Lognormal} from 'public/StatsDistribution.js';
import {Normal} from 'public/StatsDistribution.js';
import {StepFunction} from 'public/StatsDistribution.js';
import {Parameters} from 'public/ComplianceBaseParameters.js';
import {compliance} from 'public/ChartStyling.js';
import {controllers} from 'public/ComplianceControl.js';

// ----------------------------------------------------------------------
// GLOBAL CONTROL VARIALBES
// ----------------------------------------------------------------------
let currentPatient = {};
let timeInterval = 0.25;
let message = {
    Data: {},
    Display: {
        FirstPopulation: true,
        ActivePatient: 0,
        OnePopulation: true
    },
    ChartStyle: compliance(240)
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

// ----------------------------------------------------------------------
// PAGE EVENT EXPORT FUNCTIONS
// ----------------------------------------------------------------------
$w.onReady(function () {
    $w(controllers.GraphArea).onMessage((event) => {
		if (event.data === "Ready") {
            onLoad();
		}
    });
});

export function RandomButton_click(event) {
	randomize();
}

export function TimeNonComplianceControl_change(event) {
	changeCondition();
}

export function DoseNonComplianceControl_change(event) {
	changeCondition();
}

export function TauControl_change(event) {
	changeCondition();
}

export function DoseControl_change(event) {
	changeCondition();
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
function onLoad() {
    currentPatient = JSON.parse(JSON.stringify(Parameters));
    currentPatient = generatePatient(currentPatient);
    drawGraph(currentPatient);
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
    currentPatient.low = min;
    currentPatient.ht = max - min;
    message.Data.forEach(row => {
        row[22] = min;
        row[23] = max - min;
    });
    postMessage();
}

function changeCondition() {
    currentPatient["f_mean"] = currentPatient.f;
    currentPatient["vd_mean"] = currentPatient.vd;
    currentPatient["ka_mean"] = currentPatient.ka;
    currentPatient["cl_mean"] = currentPatient.cl;
    currentPatient["tauValue"] = parseFloat($w(controllers.TauControl).value);
    currentPatient["doseValue"] = parseFloat($w(controllers.DoseControl).value);
    currentPatient["doseNoneComplianceValue"] = parseFloat($w(controllers.DoseNonComplianceControl).value);
    currentPatient["timeNoneComplianceValue"] = parseFloat($w(controllers.TimeNonComplianceControl).value);
    currentPatient["horizontal_max"] = currentPatient.h_max;
    currentPatient["maxDoseValue"] = currentPatient.max_dose;
    currentPatient = generatePatient(currentPatient);
    drawGraph(currentPatient);
}

function randomize() {
    // Randomize F, Ka, Vd, Cl
    var f_mean = Parameters.f_mean;
    var f_std = f_mean * 0.2;
    currentPatient.f = Lognormal.inv(Math.random(), 
        Calculate.AdjustedMean(f_mean, f_std), Calculate.AdjustedStd(f_mean, f_std));
    var ka_mean = Parameters.ka_mean;
    var ka_std = ka_mean * 0.2;
    currentPatient.ka = Lognormal.inv(Math.random(), 
        Calculate.AdjustedMean(ka_mean, ka_std), Calculate.AdjustedStd(ka_mean, ka_std));
    var vd_mean = Parameters.vd_mean;
    var vd_std = vd_mean * 0.2;
    currentPatient.vd = Lognormal.inv(Math.random(), 
        Calculate.AdjustedMean(vd_mean, vd_std), Calculate.AdjustedStd(vd_mean, vd_std));
    var cl_mean = Parameters.cl_mean;
    var cl_std = cl_mean * 0.2;
    currentPatient.cl = Lognormal.inv(Math.random(), 
        Calculate.AdjustedMean(cl_mean, cl_std), Calculate.AdjustedStd(cl_mean, cl_std));
    currentPatient.ke = currentPatient.cl / currentPatient.vd;
    currentPatient.thalf = Math.log(2) / currentPatient.ke;
    
    drawGraph(currentPatient);
}

// ----------------------------------------------------------------------
// BASE FUNCTIONS BELOW
// ----------------------------------------------------------------------
function drawGraph(patient) {
    message.Data = getData(patient);
    updateDisplay();
    postMessage();
}

function updateDisplay() {
    $w(controllers.VdDisplay).text = formatNDecimal(currentPatient.vd, 3).toString();
    $w(controllers.FDisplay).text = formatNDecimal(currentPatient.f, 2).toString();
    $w(controllers.KaDisplay).text = formatNDecimal(currentPatient.ka, 2).toString();
    $w(controllers.HalfLifeDisplay).text = formatNDecimal(currentPatient.thalf, 2).toString();
    $w(controllers.ClDisplay).text = formatNDecimal(currentPatient.cl, 2).toString();
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
    patient["cl"] = condition.cl_mean;
    patient["max_dose"] = condition.maxDoseValue;
    patient["ke"] = patient.cl / patient.vd;
    patient["thalf"] = Math.log(2) / patient.ke;
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