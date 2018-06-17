let messageRepository = {
	SwitchPatient: {
		Message: "switch patient"
	},
	ChangePopulation: {
		Message: "change population"
	},
	ShowPatientData: {
		Message: "show patient data"
	},
	BackToFirstPatient: {
		Message: "back to first patient"
	},
	Yes: {
		Message: "yes button clicked"
	},
	FrequencySelection: {
		Message: "selected new frequency",
		Value: "8"
	},
	DosageInput: {
		Message: "user input new new dosage",
		Value: "500"
	},
	OptimizeCondition: {
		Message: "apply changes to dosage and frequency",
		Frequency: "8",
		Dosage: "500"
	}
};

let controllers = {
	SwitchPatient: "#SwitchPatientButton",
	ChangePopulation: "#ChangePopulationButton",
	ShowPatient: "#ShowPatientButton",
	BackToFirstPatient: "#FirstPatientButton",
	Yes: "#YesButton",
	AppyChange: "#ApplyChangeButton",
	GraphArea: "#GraphArea",
	QuestionText: "#QuestionText",
	Frequency: "#FrequencyGroup",
	DosageInput: "#DosageInput"
};

let textRepository = {
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

let Internal = {
	ToggleText: function (target, i) {
		var key = target.id;
		textRepository[key].TextIndex = i == undefined? 1 - textRepository[key].TextIndex : i;
		target.text = textRepository[key].TextItems[textRepository[key].TextIndex];
	},
	ToggleLabel: function (target, i) {
		var key = target.id;
		textRepository[key].TextIndex = i == undefined? 1 - textRepository[key].TextIndex : i;
		target.label = textRepository[key].TextItems[textRepository[key].TextIndex];
	}
};
$w.onReady(function () {
	$w(controllers.ChangePopulation).disable();
	textRepository.QuestionText.TextIndex = 0;
	$w(controllers.QuestionText).text = textRepository.QuestionText.TextItems[textRepository.QuestionText.TextIndex];
	textRepository.ShowPatientButton.TextIndex = 0;
	$w(controllers.ShowPatient).label = textRepository.ShowPatientButton.TextItems[textRepository.ShowPatientButton.TextIndex];
	textRepository.FirstPatientButton.TextIndex = 0;
	$w(controllers.BackToFirstPatient).label = textRepository.FirstPatientButton.TextItems[textRepository.FirstPatientButton.TextIndex];

	$w(controllers.GraphArea).onMessage((event) => {
		if (event.data === "Close") {
			$w(controllers.Yes).enable();
			$w(controllers.SwitchPatient).enable();
			if (textRepository[$w(controllers.QuestionText).id].TextIndex === 1)
			{
				$w(controllers.ChangePopulation).enable();
			}
			$w(controllers.ShowPatient).enable();
			$w(controllers.BackToFirstPatient).enable();
			$w(controllers.AppyChange).enable();
		}
	});
});

export function ResamplePatientButton_click(event, $w) {
	$w(controllers.GraphArea).postMessage(messageRepository.SwitchPatient, "*");
}

export function ChangePopulationButton_click(event, $w) {
    $w(controllers.SwitchPatient).disable();
    $w(controllers.Yes).disable();
	$w(controllers.GraphArea).postMessage(messageRepository.ChangePopulation, "*");
}

export function ShowPatientButton_click(event, $w) {
	$w(controllers.Yes).disable();
	$w(controllers.SwitchPatient).disable();
	$w(controllers.ChangePopulation).disable();
	$w(controllers.ShowPatient).disable();
	$w(controllers.BackToFirstPatient).disable();
	$w(controllers.AppyChange).disable();
	$w(controllers.GraphArea).postMessage(messageRepository.ShowPatientData, "*");
}

export function FirstPatientButton_click(event, $w) {
    $w(controllers.SwitchPatient).enable();
    $w(controllers.Yes).enable();
    $w(controllers.Frequency).value = "12";
    $w(controllers.DosageInput).value = "75";
	$w(controllers.GraphArea).postMessage(messageRepository.BackToFirstPatient, "*");
}

export function YesButton_click(event, $w) {
	Internal.ToggleText($w(controllers.QuestionText));
	Internal.ToggleLabel($w(controllers.BackToFirstPatient));
	Internal.ToggleLabel($w(controllers.ShowPatient));
	if (textRepository[$w(controllers.QuestionText).id].TextIndex === 0)
	{
		$w(controllers.ChangePopulation).disable();
	} else {
		$w(controllers.ChangePopulation).enable();
	}
	$w(controllers.GraphArea).postMessage(messageRepository.Yes, "*");
}

export function FrequencyGroup_change(event, $w) {
	//To-do: further enhancement if separate control...

}

export function ApplyChangesButton_click(event, $w) {
	if($w(controllers.DosageInput).value === "") return;
	var dose = $w(controllers.DosageInput).value;
	var freq = $w(controllers.Frequency).value;
	Internal.ToggleText($w(controllers.QuestionText), 0);
	Internal.ToggleLabel($w(controllers.ShowPatient), 0);
    Internal.ToggleLabel($w(controllers.BackToFirstPatient), 0);
	messageRepository.OptimizeCondition.Dosage = dose;
	messageRepository.OptimizeCondition.Frequency = freq;
	$w(controllers.GraphArea).postMessage(messageRepository.OptimizeCondition, "*");
}