export function chart(h_max, patients, settings) {
	return {
		legend: _legend,
		hAxis: _hAxis(h_max),
		vAxis: _vAxis(settings.id),
		width: 890,
        height: 500,
        backgroundColor: '#000000',
		isStacked: true,
		chartArea: _chartArea,
		series: _series(patients, settings)
	}
}

let _legend = {
	textStyle: {
		color: "#14b4e0",
		fontSize: 12,
		bold: true
	}
}

let _chartArea = {
	top: 40,
	left: 80,
	width: '76%',
	height: '80%'	
}

function _hAxis(h_max) {
	return {
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
		ticks:[0, h_max*0.25, h_max*0.5, h_max*0.75, h_max]		
	}
}

function _vAxis(id) {
	return {
		title: "Concentration (mg/L)",
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
		ticks: v_ticks(id)		
	}
}

function v_ticks(id) {
	switch(id) {
		case 1: return [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07];
		case 2: return [10, 20, 30, 40, 50, 60];
		case 3: return [2, 4, 6, 8, 10, 12, 14];
		case 4: return [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];
		case 5: return [0.05, 0.1, 0.15, 0.2, 0.25];
		case 6: return [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6];
		case 8: return [0.005, 0.01, 0.015, 0.02, 0.025, 0.03];
		default: console.error("Invalid ID for graph: " + id);
	}	
}

function _series(patients, settings) {
	if (settings.single) {
		return {
			0: {color: '#00FF00', type: 'line'},
            1: {color: 'transparent', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0},
            2: {color: '#666600', type: 'area', areaOpacity: 0.5, visibleInLegend: false, lineWidth: 0}			
		}
	}
	var res = {
		20: {
			lineWidth: 3,
			color: "#FF0000",
			visibleInLegend: true,
			type: 'line'				
		},
		21: {
			color: 'transparent', 
			type: 'area', 
			areaOpacity: 0.5, 
			visibleInLegend: false, 
			lineWidth: 0
		},
		22: {
			color: '#666600', 
			type: 'area', 
			areaOpacity: 0.5, 
			visibleInLegend: false, 
			lineWidth: 0
		}
	};
	if (settings.adjusted) {
		var colors = new Map(); 
		colors.set(0, "#0000FF");
		colors.set(1, "#0080FF");
		colors.set(2, "#00BFFF");
		colors.set(3, "#2EFEF7");
		patients.forEach((element, i) => {
			res[i] = settings.firstPopulation && 
					 i === settings.activePatient? {
				lineWidth: 3,
				color: settings.filter[element.last]? "#00FF00" : "transparent",
				visibleInLegend: true && settings.filter[element.last],
				phenotype: element.last,
				type: 'line'
			} : {
				lineWidth: 1,
                lineDashStyle: [4, 4],
				color: settings.filter[element.last]? colors.get(element.last) : "transparent",
				phenotype: element.last,
                visibleInLegend: false,
                type: 'line'
			}
		});
	} else {
		for(var i = 0; i < patients.length; i++) {
			res[i] = settings.firstPopulation && 
			         i === settings.activePatient? {
				lineWidth: 3,
                color: "#00FF00",
                visibleInLegend: true,
                type: 'line'
			} : {
				lineWidth: 1,
                lineDashStyle: [4, 4],
				color: "#1EB1EE",
                visibleInLegend: false,
                type: 'line'
			}
		}
	}
	return res;
}