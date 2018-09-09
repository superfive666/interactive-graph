import {wixData} from 'wix-data';
let DBName = "GraphConfiguration";

function map(GraphID) {
	switch (GraphID) {
		case "GRAPH_1": return "2a193fa7-458e-4a62-8c80-8706bd28b197";
		case "GRAPH_2": return "b9e3408c-4255-4e58-8d35-d98039aae721";
		case "GRAPH_3": return "0c0273f5-5caf-45ac-b149-dc7c3e1cbb44";
		case "GRAPH_4": return "f64b76be-ed50-45df-9e36-942cf80219e7";
		case "GRAPH_5": return "e9ef9234-435d-426f-9ead-07379957b1bf";
		case "GRAPH_6": return "4d63b5c9-3128-4230-b2cf-5dacbfc6e2ea";
		case "GRAPH_8": return "0bd46e15-2a36-4909-a812-a0b40b309df3";
		default:
			console.error("DBConnection: Invalid graph ID");
			break;
	}
}

export function ReadGraphDataFromDB(GraphID) {
    var item = {};
	let options = {
  		"suppressAuth": true,
  		"suppressHooks": true
	};
	
	wixData.get(DBName, map(GraphID), options)
		.then(result => {
			item = result;
		}).catch(err => {
			console.error("DBConnection Error: ");
			console.error(err);
		});

	return item;
}