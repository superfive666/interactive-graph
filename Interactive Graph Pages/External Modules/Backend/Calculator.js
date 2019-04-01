import {graphs} from 'public/BackendParameter.js';
import {graphs_phase2} from 'public/BackendParameter.js';

const TimeInterval = 0.25;
let T = new Array(20);

export function Calculate(graphID, data) {
	var result;
	switch (graphID) {
		case graphs.Continuous_Intravenous_Analgesic:
			result = Graph_1(data);
			break;
		case graphs.Multiple_Dose_IV_Infusion:
			result = Graph_2(data);
			break;
		case graphs.Multiple_Oral_Dose_Antibiotics:
		case graphs.Multiple_Oral_Dose_Anticoagulant:
		case graphs.Multiple_Oral_Dose_Antithrombotic:
		case graphs.Multiple_Oral_Dose_NSAID:
			result = Graph_3(data);
			break;
		case graphs.Phenytoin_Formulation:
			result = Graph_8(data);
			break;
		case graphs_phase2.Multiple_Oral_Dose_Compliance:
			result = Graph_9(data);
			break;
		default:
			console.error("Calculator: Invalid graph ID");
			break;
	}

	return result;
}

function Graph_1(data) {
	return getResult(data, function(t, patient) {
		var a1 = patient.dose * patient.infusion_rate;
		var a2 = patient.ke * patient.vd;
		var a3 = 1 - Math.exp(-patient.ke * t);
		return a1 * a3 / a2;
	});
}

function Graph_2(data) {
	return getResult(data, function calc(t, patient) {
		var a1 = patient.dose;
		var a2 = patient.ke * patient.vd;
		var a3 = 1 - Math.exp(-patient.ke * (t > patient.infusion_rate? patient.infusion_rate : t));
		var a4 = t > patient.infusion_rate? Math.exp(-patient.ke * (t - patient.infusion_rate)) : 1.0;
		var res = a1 * a3 * a4 / a2; 
		return t < patient.tau? res : res + calc(t - patient.tau, patient);
	});
}


function Graph_3(data) {
	return getResult(data, function calc(t, patient) {
		var a1 = (1 - patient.er) * patient.dose * patient.ka;
	    var a2 = patient.vd * (patient.ka - patient.ke);
		var a3 = Math.exp(-patient.ke * t) - Math.exp(-patient.ka * t);
		var res = a1 * a3 / a2;
	    return t < patient.tau? res : res + calc(t - patient.tau, patient);
	});
}

function Graph_9(data) {
	data.forEach(p => {
		p.dose_no = 0;
	});
	return getResult(data, function calc(t, patient) {
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
	});
}

function Graph_8(data) {
	return getResult(data, function(t, patient, prev, j) {
		var CalculateABS = function calculateABS(ti) {
			var a1 = patient.f * patient.dose;
			var a2 = 1 - Math.exp(-patient.ka * ti);
			var a3 = a1 * a2 / patient.vd;
			return ti < patient.tau? a3 : a3 + CalculateABS(ti - patient.tau);
		}
		var CalculateELI = function calculateELI(p) {
			var a1 = patient.vmax * p * 1000;
			var a2 = (patient.km + p) * patient.vd;
			return TimeInterval * a1 / a2;
		}
		var abs = CalculateABS(t);
		T[j] += t%patient.tau === 0? CalculateELI(abs) : CalculateELI(prev);
    	return abs - T[j];
	});
}

function getResult(data, calc) {
	var maxHour = data[0].h_max;
	var result = new Array();
	T.fill(0);
	if(Array.isArray(data)) {
		for (var i = 0; i <= maxHour; i += TimeInterval) {
			var rowData = new Array();
			rowData.push(i);
			var ave = 0;
			data.forEach((val, j) => {
				var conc = calc(i, val, i===0?0:result[result.length-1][j+1], j);
				ave += conc/20;
				rowData.push(conc);
			});	
			rowData.push(ave);
			rowData.push(data[0].low);
			rowData.push(data[0].ht);
			result.push(rowData);
		}
	} else {
		console.error("Calculation data is not an array: " + data);
	}
	return result;
}