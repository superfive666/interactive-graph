export let controllers = {
	SwitchPatient: "#SwitchPatientButton",
	ChangePopulation: "#ChangePopulationButton",
	ShowPatient: "#ShowPatientButton",
	BackToFirstPatient: "#FirstPatientButton",
	Yes: "#YesButton",
	AppyChange: "#ApplyChangeButton",
	GraphArea: "#GraphArea",
	Frequency: "#FrequencyGroup",
	DosageInput: "#DosageInput",
	InfusionRate: "#InfusionRate",
	AdjustPercentage_box1: "#AdjustPercentage1",
	AdjustPercentage_box2: "#AdjustPercentage2",
	AdjustPercentage_box3: "#AdjustPercentage3",
	AdjustPercentage_box4: "#AdjustPercentage4",
	AdjustPercentage_section: "#AdjustPercentageSection",
	DisplayPercentage_text1: "#DisplayPercentage1",
	DisplayPercentage_text2: "#DisplayPercentage2",
	DisplayPercentage_text3: "#DisplayPercentage3",
	DisplayPercentage_text4: "#DisplayPercentage4",
	DisplayPercentage_section: "#DisplayPercentageSection",
	DisplayLegend_section: "#DisplayLegendSection",
	Optimization_section: "#OptimizationSection",
	Legend1: "#button1",
	Legend2: "#button2",
	Legend3: "#button3",
	Legend4: "#button4",
	TimeNoneComply: "#TimeNoneComply",
	DoseNoneComply: "#DoseNoneComply",
	MinSlider: "#MinSlider",
	MaxSlider: "#MaxSlider"
}

export let textRepository = {
	QuestionText: {
		TextItems: [
			"Would you like to see all the 20 patients in the population?",
			"Would you like to go back to single patient view?"
		],
		TextIndex: 0
	},
	ShowPatientButton: {
		TextItems: [
			"Show patient data",
			"Show population data"
		],
		TextIndex: 0
	},
	FirstPatientButton: {
		TextItems: [
			"Back to first patient",
			"Back to first population"
		],
		TextIndex: 0
	},
	ButtonText: {
		Single: "Population view",
		Population: "Single patient view"
	}
};

export let Internal = {
	ToggleText: function (target, i) {
		var key = target.id;
		textRepository[key].TextIndex = i === undefined? 1 - textRepository[key].TextIndex : i;
		target.text = textRepository[key].TextItems[textRepository[key].TextIndex];
	},
	ToggleLabel: function (target, i) {
		var key = target.id;
		textRepository[key].TextIndex = i === undefined? 1 - textRepository[key].TextIndex : i;
		target.label = textRepository[key].TextItems[textRepository[key].TextIndex];
	}, 
	ToggleButton: function (target, reset) {
		var colors = {
            selected: "#00BFFF",
            unselected: "#808080"
        };
		target.style.color = target.style.color === colors.selected? colors.unselected : colors.selected;
		if(reset) target.style.color = colors.selected;
	}
};

export let GraphBinding = {
	SinglePatient: [
		{id: "#SinglePatientF", key: "_f"},
		{id: "#SinglePatientKa", key: "ka"},
		{id: "#SinglePatientDose", key: "dose"},
		{id: "#SinglePatientVd", key: "vd"},
		{id: "#SinglePatientCl", key: "cl"},
		{id: "#SinglePatientThalf", key: "thalf"},
		{id: "#SinglePatientCmax", key: "cmax"},
		{id: "#SinglePatientCmin", key: "cmin"},
		{id: "#SinglePatientCave", key: "cave"},
		{id: "#SinglePatientCss", key: "css"},
		{id: "#SinglePatientTcss", key: "tcss"},
		{id: "#SinglePatientIfsRt", key: "infusion_rate"},
		{id: "#SinglePatientAuc24", key: "auc24"},
		{id: "#SinglePatientAuc24mic", key: "auc24mic"},
		{id: "#SinglePatientFF", key: "f"}
	],
	Population: [
		{id: "#PopulationPatientF", key: "_f"},
		{id: "#PopulationPatientKa", key: "ka"},
		{id: "#PopulationPatientDose", key: "dose"},
		{id: "#PopulationPatientVd", key: "vd"},
		{id: "#PopulationPatientCl", key: "cl"},
		{id: "#PopulationPatientThalf", key: "thalf"},
		{id: "#PopulationPatientCmax", key: "cmax"},
		{id: "#PopulationPatientCmin", key: "cmin"},
		{id: "#PopulationPatientCave", key: "cave"},
		{id: "#PopulationPatientCss", key: "css"},
		{id: "#PopulationPatientTcss", key: "tcss"},
		{id: "#PopulationPatientIfsRt", key: "infusion_rate"},
		{id: "#PopulationPatientAuc24", key: "auc24"},
		{id: "#PopulationPatientAuc24mic", key: "auc24mic"},
		{id: "#PopulationPatientFF", key: "f"}
	]
}