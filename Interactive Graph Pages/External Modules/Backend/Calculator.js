let graphs = {
	Continuous_Intravenous_Analgesic: "GRAPH_1",
	Multiple_Dose_IV_Infusion: "GRAPH_2",
	Multiple_Oral_Dose_NSAID: "GRAPH_3",
	Multiple_Oral_Dose_Antithrombotic: "GRAPH_4",
	Multiple_Oral_Dose_Anticoagulant: "GRAPH_5",
	Multiple_Oral_Dose_Antibiotics: "GRAPH_6",
	Phenytoin_Formulation: "GRAPH_8"
}

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
	
}

function Graph_2(data) {

}


function Graph_3(data) {
	var maxHour = 100;
	var result = new Array();
	var calc = function (t, patient) {
		var a1 = (1 - patient.er) * patient.dose * patient.ka;
	    var a2 = patient.vd * (patient.ka - patient.ke);
		var a3 = Math.Exp(-patient.ke * t) - Math.Exp(-patient.ka * t);
		var result = a1 * a3 / a2;
	    return t < patient.tau? result : result + calc(t - patient.tau, patient);
	}
    var i;
	
	if(Array.isArray(data)) {
		for (i = 0; i < maxHour; i += 0.25) {
			var rowData = new Array();
			rowData.push(i);
			var ave = 0;
			data.forEach(function (val, index) {
				var conc = calc(i, val);
				ave += conc/20;
				rowData.push(conc);
			});	
			rowData.push(ave);
			rowData.push(data.low);
			rowData.push(data.ht);
			result.push(rowData);
		}
	} else {
		console.error("Calculation data is not an array: " + data);
	}
	return result;
}

function Graph_8(daa) {

}
