const TimeInterval = 0.25;
let graphs = {
	Continuous_Intravenous_Analgesic: "GRAPH_1",
	Multiple_Dose_IV_Infusion: "GRAPH_2",
	Multiple_Oral_Dose_NSAID: "GRAPH_3",
	Multiple_Oral_Dose_Antithrombotic: "GRAPH_4",
	Multiple_Oral_Dose_Anticoagulant: "GRAPH_5",
	Multiple_Oral_Dose_Antibiotics: "GRAPH_6",
	Phenytoin_Formulation: "GRAPH_8"
}
let T = 0;

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
	return getResult(data, function(t, patient) {
		var a1 = patient.dose;
		var a2 = patient.ke * patient.vd;
		var a3 = 1 - Math.exp(-patient.ke * patient.infusion_rate);
		var a4 = t > patient.infusion_rate? 
		         Math.exp(-patient.ke * (t - patient.infusion_rate)) : 1.0;
		return a1 * a3 * a4 / a2;
	});
}


function Graph_3(data) {
	return getResult(data, function(t, patient) {
		var a1 = (1 - patient.er) * patient.dose * patient.ka;
	    var a2 = patient.vd * (patient.ka - patient.ke);
		var a3 = Math.exp(-patient.ke * t) - Math.exp(-patient.ka * t);
		var res = a1 * a3 / a2;
	    return t < patient.tau? res : res + calc(t - patient.tau, patient);
	});
}

function Graph_8(data) {
	return getResult(data, function(t, patient, prev) {
		function calculateABS(ti) {
			var a1 = patient.f * patient.dose;
			var a2 = 1 - Math.exp(-patient.ka * ti);
			var a3 = a1 * a2 / patient.vd;
			return ti < patient.tau? a3 : a3 + CalculateABS(ti - patient.tau);
		}
		function calculateELI(p) {
			var a1 = patient.vmax * p * 1000;
			var a2 = (patient.km + p) * patient.vd;
			return TimeInterval * a1 / a2;
		}
		var abs = CalculateABS(t);
		T += t%patient.Tau == 0? CalculateELI(abs) : CalculateELI(prev);
    	return abs - T;
	});
}

function getResult(data, calc) {
	var maxHour = data[0].h_max;
	var result = new Array();
	var prev = 0; 
	T = 0;
	if(Array.isArray(data)) {
		for (var i = 0; i < maxHour; i += TimeInterval) {
			var rowData = new Array();
			rowData.push(i);
			var ave = 0;
			data.forEach((val) => {
				var conc = calc(i, val, prev);
				prev = conc;
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