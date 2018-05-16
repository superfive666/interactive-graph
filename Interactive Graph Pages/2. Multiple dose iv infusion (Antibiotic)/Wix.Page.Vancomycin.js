var messageRepository = {
    SwitchPatient: {Message: "switch patient"},
    ChangePopulation: {Message: "change population"},
    ShowPatientData: {Message: "show patient data"},
    BackToFirstPatient: {Message: "back to first patient"},
    Yes: {Message: "yes button clicked"},
    FrequencySelection: {Message: "selected new frequency", Value: "8"},
	DosageInput: {Message: "user input new new dosage", Value: "500"},
	OptimizeCondition: {
		Message: "apply changes to dosage and frequency",
		Frequency: "8",
		Dosage: "500"
	}
}

$w.onReady(function () {
	//TODO: write your page related code here...

});

export function ResamplePatientButton_click(event, $w) {
	//Add your code for this event here:
	$w("#GraphArea").postMessage({Message: "switch patient"}, "*");
}

export function ChangePopulationButton_click(event, $w) {
    //Add your code for this event here:
    $w("#ResamplePatientButton").disable();
    $w("#YesButton").disable();
	$w("#GraphArea").postMessage({Message: "change population"}, "*");
}

export function ShowPatientButton_click(event, $w) {
	//Add your code for this event here:
	$w("#GraphArea").postMessage({Message: "show patient data"}, "*");
}

export function FirstPatientButton_click(event, $w) {
    //Add your code for this event here:
    $w("#ResamplePatientButton").enable();
    $w("#YesButton").enable();
    $w("#FrequencyGroup").value = "8";
    $w("#DosageInput").value = "";
	$w("#GraphArea").postMessage({Message: "back to first patient"}, "*");
}

export function YesButton_click(event, $w) {
	//Add your code for this event here:
	if($w("#QuestionText").text == "Would you like to see all the 20 patients in the population?")
	{
        $w("#ChangePopulationButton").enable();
		$w("#QuestionText").text = "Would you like to go back to single patient view?";
	}
	else
	{
        $w("#ChangePopulationButton").disable();
		$w("#QuestionText").text = "Would you like to see all the 20 patients in the population?";
	}

	$w("#GraphArea").postMessage({Message: "yes button clicked"}, "*");
}

//export function FrequencyGroup_change(event, $w) {
	//Add your code for this event here:
//	var freq = $w("#FrequencyGroup").value;
//	$w("#QuestionText").text = "Would you like to see all the 20 patients in the population?";
//	$w("#GraphArea").postMessage({Message: "selected new frequency", Value: freq}, "*");
//}

export function ApplyChangesButton_click(event, $w) {
	//Add your code for this event here:
	if($w("#DosageInput").value == "") return;
	var dose = $w("#DosageInput").value;
	var freq = $w("#FrequencyGroup").value;
	$w("#QuestionText").text = "Would you like to see all the 20 patients in the population?";
	$w("#GraphArea").postMessage({
		Message: "apply changes to dosage and frequency",
		Frequency: freq,
		Dosage: dose
	}, "*");
}
