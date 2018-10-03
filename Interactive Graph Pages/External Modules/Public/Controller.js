export let controllers = {
	SwitchPatient: "#SwitchPatientButton",
	ChangePopulation: "#ChangePopulationButton",
	ShowPatient: "#ShowPatientButton",
	BackToFirstPatient: "#FirstPatientButton",
	Yes: "#YesButton",
	AppyChange: "#ApplyChangeButton",
	GraphArea: "#GraphArea",
	QuestionText: "#QuestionText",
	Frequency: "#FrequencyGroup",
	DosageInput: "#DosageInput",
	InfusionRate: "#InfusionRate",
	Hint: "#HintText",
	AdjustPercentage_box1: "#AdjustPercentage1",
	AdjustPercentage_box2: "#AdjustPercentage2",
	AdjustPercentage_box3: "#AdjustPercentage3",
	AdjustPercentage_box4: "#AdjustPercentage4",
	AdjustPercentage_section: "#AdjustPercentageSection"
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
};

export let GraphBinding = {
	SinglePatient: [
		{id: "#SinglePatientF", key: "_f"},
		{id: "#SinglePatientKa", key: "ka"},
		{id: "#SinglePatientDose", key: "dose"},
		{id: "#SinglePatientCl", key: "cl"},
		{id: "#SinglePatientThalf", key: "thalf"},
		{id: "#SinglePatientCmax", key: "cmax"},
		{id: "#SinglePatientCmin", key: "cmin"}
	],
	Population: [
		{id: "#PopulationPatientF", key: "_f"},
		{id: "#PopulationPatientKa", key: "ka"},
		{id: "#PopulationPatientDose", key: "dose"},
		{id: "#PopulationPatientVd", key: "vd"},
		{id: "#PopulationPatientCl", key: "cl"},
		{id: "#PopulationPatientThalf", key: "thalf"},
		{id: "#PopulationPatientCmax", key: "cmax"},
		{id: "#PopulationPatientCmin", key: "cmin"}
	]
}