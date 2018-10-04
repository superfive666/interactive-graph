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
	top: 30,
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
		case 3: return [2, 4, 6, 8, 10, 12, 14];
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
		var colors = ["#3869FF", "#FFFB37", "#FF3200", "#FF00E1"];
		var ind = 0;
		patients.forEach(element => {
			res[i] = settings.firstPopulation && 
					 i === settings.activePatient? {
				lineWidth: 3,
				color: "#00FF00",
				visibleInLegend: true,
				type: 'line'
			} : {
				lineWidth: 1,
                   lineDashStyle: [4, 4],
                   color: colors[ind],
                   visibleInLegend: false,
                   type: 'line'
			}
			if (element.last) ind++;
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