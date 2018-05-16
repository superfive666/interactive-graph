var messageRepository = {
    SwitchPatient: {Message: "switch patient"},
    ChangePopulation: {Message: "change population"},
    ShowPatientData: {Message: "show patient data"},
    BackToFirstPatient: {Message: "back to first patient"},
    Yes: {Message: "yes button clicked"},
    FrequencySelection: {Message: "selected new frequency", Value: "6"},
	DosageInput: {Message: "user input new new dosage", Value: "1000"},
	OptimizeCondition: {
		Message: "apply changes to dosage and frequency",
		Frequency: "6",
		Dosage: "500"
	}
}

var controllers = {
    SwitchPatient: "#SwitchPatientButton",
    ChangePopulation: "#ChangePopulationButton",
    ShowPatient: "#ShowPatientButton",
    BackToFirstPatient: "#FirstPatientButton",
    Yes: "#YesButton",
    AppyChange: "#ApplyChangeButton",
    GraphArea: "#GraphArea",
    QuestionText: "#QuestionText",
    Frequecny: "#FrequencyGroup",
}

var questionText = [
    "Would you like to see all the 20 patients in the population?",
    "Would you like to go back to singple patient view?"
];
var textIndex = 0;

$w.onReady(function () {
    //To-do: update the window on ready behaviour..  
    $w(controllers.QuestionText).text = questionText[textIndex];
})

//Internal function here
var ToggleText = function () {
    textIndex = 1 - textIndex;
    $w(controllers.QuestionText).text = questionText[textIndex];
    if (textIndex == 0)
    {
        $w(controllers.ChangePopulation).disable();
    }
    else 
    {
        $w(controllers.ChangePopulation).enable();
    }
}

export function SwitchPatientButton_click(event, $w) {
    //Switch another patient
    $w(controllers.GraphArea).postMessage(messageRepository.SwitchPatient, "*");
}

export function ChangePopulationButton_click(event, $w) {
    //Change another 20 populations
    $w(controllers.Yes).disable();
    $w(controllers.SwitchPatient).disable();
    $w(controllers.GraphArea).postMessage(messageRepository.ChangePopulation, "*");
}

export function ShowPatientButton_click(event, $w) {
    //Display the patient data
    $w(controllers.GraphArea).postMessage(messageRepository.ShowPatientData, "*");
}

export function FirstPatientButton_click(event, $w) {
    //Restore default patient and default setup
    $w(controllers.GraphArea).postMessage(messageRepository.BackToFirstPatient, "*")
}

export function YesButton_click(event, $w) {
    //Change the prompting question and display different graphs
    ToggleText();
    $w(controllers.GraphArea).postMessage(messageRepository.Yes, "*");
}

export function ApplyChangeButton_click(event, $w) {
    //Obtain the new frequency and dosage to be passed to the graph
    var frequency = "";
    var dosage = "";
    messageRepository.OptimizeCondition.Frequency = frequency;
    messageRepository.OptimizeCondition.Dosage = dosage;

    textIndex = 0;
    $w(controllers.QuestionText).text = questionText[textIndex];
    $w(controllers.ChangePopulation).disable();
    $w(controllers.Yes).enable();
    $w(controllers.SwitchPatient).enable();
    $w(controllers.GraphArea).postMessage(messageRepository.OptimizeCondition, "*");
}