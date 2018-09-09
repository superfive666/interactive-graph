import {ReadGraphDataFromDB} from 'backend/DBConnection';

let graphs = {
	Continuous_Intravenous_Analgesic: "GRAPH_1",
	Multiple_Dose_IV_Infusion: "GRAPH_2",
	Multiple_Oral_Dose_NSAID: "GRAPH_3",
	Multiple_Oral_Dose_Antithrombotic: "GRAPH_4",
	Multiple_Oral_Dose_Anticoagulant: "GRAPH_5",
	Multiple_Oral_Dose_Antibiotics: "GRAPH_6",
	Phenytoin_Formulation: "GRAPH_8"
}

export function Calculate(graphID) {
	var result;
	
	ReadGraphDataFromDB(graphID).then(data => {
		console.group("Calculation Data");
		console.info("Graph attempting to draw: " + graphID);
		console.info(data);
		console.groupEnd();
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
	}).catch(err => {
		console.error(err);
	});

	return result
}

function Graph_1(data) {
	var result = new Array();
	function Calc(t, i) {
		var a1 = data[i].Dose * data[i].InfusionRate;
        var a2 = data[i].Ke * data[i].VolumeDistribution;
        var a3 = 1 - Math.Exp(-data[i].Ke * t);
        return a1 * a3 / a2;
	}

}

function Graph_2(data) {

}

function Graph_3(data) {

}

function Graph_8(daa) {

}
