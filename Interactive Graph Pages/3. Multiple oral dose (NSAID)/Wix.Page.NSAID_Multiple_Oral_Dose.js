import {controllers} from 'public/Controller.js';
import {Internal} from 'public/Controller.js';
import {messageRepository} from 'public/Message.js';
import {textRepository} from 'public/Controller.js';
import {graphs} from 'public/BackendParameter.js';
import {chart} from 'public/ChartStyling.js';
import {displayData} from 'public/DisplayCalculator.js';

import {Calculate} from 'backend/Calculator.jsw';
import {GeneratePopulation} from 'backend/PopulationGenerator.jsw';
import {UpdatePopulationCondition} from 'backend/PopulationGenerator.jsw';

let Population = {
	OnLoad: {},
	Adjusted: {},
	Others: {},
	DefaultPatient: {
		OnLoad: {},
		Adjusted: {}
	},
	ActivePatient: 0
}

let GraphData = messageRepository.DrawGraph;

$w.onReady(function () {
	Population.ActivePatient = Math.floor(Math.random()*20);
	Population.DefaultPatient.OnLoad = Population.ActivePatient;
	GeneratePopulation(graphs.Continuous_Intravenous_Analgesic).then(result =>{
		console.info("Population generated (Population.OnLoad):" + result);
		Population.OnLoad = result;
	}).catch(err=>{
		console.error("Error calling generating population.");
		console.error(err);
		return;
	});
	
	Calculate(graphs.Continuous_Intravenous_Analgesic, Population.OnLoad).then(result =>{
		console.info("Graph data calculated:" + result);
		GraphData.Data = result;
	}).catch(err =>{
		console.error("Error calling calculating graph data.");
		console.error(err);
		return;
	})

	GraphData.Display = {
		FirstPopulation: true,
		ActivePatient: Population.ActivePatient,
		PopulationDisplay: displayData.PopulationDisplay(Population.OnLoad, GraphData.Data),
		SinglePatitentDisplay: displayData.SinglePatitentDisplay(Population.OnLoad, Population.ActivePatient, GraphData.Data)
	}

	GraphData.ChartStyle = chart.Multiple_Oral_Dose_NSAID;
	$w(controllers.GraphArea).postMessage(GraphData, "*");

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
	
}

export function ChangePopulationButton_click(event, $w) {
    $w(controllers.SwitchPatient).disable();
    $w(controllers.Yes).disable();
	$w(controllers.Hint).show();


}

export function ShowPatientButton_click(event, $w) {
	$w(controllers.Yes).disable();
	$w(controllers.SwitchPatient).disable();
	$w(controllers.ChangePopulation).disable();
	$w(controllers.ShowPatient).disable();
	$w(controllers.BackToFirstPatient).disable();
	$w(controllers.AppyChange).disable();
	
	
}

export function FirstPatientButton_click(event, $w) {
    $w(controllers.SwitchPatient).enable();
    $w(controllers.Yes).enable();
    $w(controllers.Frequency).value = "12";
    $w(controllers.DosageInput).value = "75";
	$w(controllers.Hint).hide();


	
}

export function YesButton_click(event, $w) {
	Internal.ToggleText($w(controllers.QuestionText));
	Internal.ToggleLabel($w(controllers.BackToFirstPatient));
	Internal.ToggleLabel($w(controllers.ShowPatient));
	if (textRepository[$w(controllers.QuestionText).id].TextIndex === 0)
	{
		$w(controllers.ChangePopulation).disable();
		$w(controllers.AdjustPercentage_section).hide();
	} else {
		$w(controllers.ChangePopulation).enable();
		$w(controllers.AdjustPercentage_section).show();
	}
	
	
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
	
	

}

export function ChangePercentage_enter(event, $w) {
	messageRepository.AdjustPercentage.Poor = parseFloat($w(controllers.AdjustPercentage_box1).value);
	messageRepository.AdjustPercentage.Intermediate = parseFloat($w(controllers.AdjustPercentage_box2).value);
	messageRepository.AdjustPercentage.Extensive = parseFloat($w(controllers.AdjustPercentage_box3).value);
	messageRepository.AdjustPercentage.UltraRapid = parseFloat($w(controllers.AdjustPercentage_box4).value);
	
	

}

export function AdjustPercentage1_change(event) {
	var previous = 100 - parseFloat($w(controllers.AdjustPercentage_box2).value)
					   - parseFloat($w(controllers.AdjustPercentage_box3).value)
					   - parseFloat($w(controllers.AdjustPercentage_box4).value);
	var current = parseFloat($w(controllers.AdjustPercentage_box1).value);
	if (current < previous) {
		$w(controllers.AdjustPercentage_box3).value += (previous - current);
	}
	else {
		var difference = current - previous;
		if (parseFloat($w(controllers.AdjustPercentage_box2).value) > difference) {
			$w(controllers.AdjustPercentage_box2).value = parseFloat($w(controllers.AdjustPercentage_box2).value) - difference;
		} else {
			difference -= parseFloat($w(controllers.AdjustPercentage_box2).value);
			$w(controllers.AdjustPercentage_box2).value = 0;
			if (parseFloat($w(controllers.AdjustPercentage_box4).value) > difference) {
				$w(controllers.AdjustPercentage_box4).value = parseFloat($w(controllers.AdjustPercentage_box4).value) - difference;
			} else {
				difference -= parseFloat($w(controllers.AdjustPercentage_box4).value);
				$w(controllers.AdjustPercentage_box4).value = 0;
				$w(controllers.AdjustPercentage_box3).value = parseFloat($w(controllers.AdjustPercentage_box3).value) - difference;
			}
		}
	}
}

export function AdjustPercentage2_change(event) {
	var previous = 100 - parseFloat($w(controllers.AdjustPercentage_box1).value)
					   - parseFloat($w(controllers.AdjustPercentage_box3).value)
					   - parseFloat($w(controllers.AdjustPercentage_box4).value);
	var current = parseFloat($w(controllers.AdjustPercentage_box2).value);
	if (current < previous) {
		$w(controllers.AdjustPercentage_box3).value += (previous - current);
	}
	else {
		var difference = current - previous;
		if (parseFloat($w(controllers.AdjustPercentage_box1).value) > difference) {
			$w(controllers.AdjustPercentage_box1).value = parseFloat($w(controllers.AdjustPercentage_box1).value) - difference;
		} else {
			difference -= parseFloat($w(controllers.AdjustPercentage_box1).value);
			$w(controllers.AdjustPercentage_box1).value = 0;
			if (parseFloat($w(controllers.AdjustPercentage_box4).value) > difference) {
				$w(controllers.AdjustPercentage_box4).value = parseFloat($w(controllers.AdjustPercentage_box4).value) - difference;
			} else {
				difference -= parseFloat($w(controllers.AdjustPercentage_box4).value);
				$w(controllers.AdjustPercentage_box4).value = 0;
				$w(controllers.AdjustPercentage_box3).value = parseFloat($w(controllers.AdjustPercentage_box3).value) - difference;
			}
		}
	}
}

export function AdjustPercentage3_change(event) {
	var previous = 100 - parseFloat($w(controllers.AdjustPercentage_box2).value)
					   - parseFloat($w(controllers.AdjustPercentage_box1).value)
					   - parseFloat($w(controllers.AdjustPercentage_box4).value);
	var current = parseFloat($w(controllers.AdjustPercentage_box3).value);
	if (current < previous) {
		$w(controllers.AdjustPercentage_box2).value += (previous - current);
	}
	else {
		var difference = current - previous;
		if (parseFloat($w(controllers.AdjustPercentage_box2).value) > difference) {
			$w(controllers.AdjustPercentage_box2).value = parseFloat($w(controllers.AdjustPercentage_box2).value) - difference;
		} else {
			difference -= parseFloat($w(controllers.AdjustPercentage_box2).value);
			$w(controllers.AdjustPercentage_box2).value = 0;
			if (parseFloat($w(controllers.AdjustPercentage_box4).value) > difference) {
				$w(controllers.AdjustPercentage_box4).value = parseFloat($w(controllers.AdjustPercentage_box4).value) - difference;
			} else {
				difference -= parseFloat($w(controllers.AdjustPercentage_box4).value);
				$w(controllers.AdjustPercentage_box4).value = 0;
				$w(controllers.AdjustPercentage_box1).value = parseFloat($w(controllers.AdjustPercentage_box1).value) - difference;
			}
		}
	}
}

export function AdjustPercentage4_change(event) {
	var previous = 100 - parseFloat($w(controllers.AdjustPercentage_box2).value)
					   - parseFloat($w(controllers.AdjustPercentage_box3).value)
					   - parseFloat($w(controllers.AdjustPercentage_box1).value);
	var current = parseFloat($w(controllers.AdjustPercentage_box4).value);
	if (current < previous) {
		$w(controllers.AdjustPercentage_box3).value += (previous - current);
	}
	else {
		var difference = current - previous;
		if (parseFloat($w(controllers.AdjustPercentage_box2).value) > difference) {
			$w(controllers.AdjustPercentage_box2).value = parseFloat($w(controllers.AdjustPercentage_box2).value) - difference;
		} else {
			difference -= parseFloat($w(controllers.AdjustPercentage_box2).value);
			$w(controllers.AdjustPercentage_box2).value = 0;
			if (parseFloat($w(controllers.AdjustPercentage_box1).value) > difference) {
				$w(controllers.AdjustPercentage_box1).value = parseFloat($w(controllers.AdjustPercentage_box1).value) - difference;
			} else {
				difference -= parseFloat($w(controllers.AdjustPercentage_box1).value);
				$w(controllers.AdjustPercentage_box1).value = 0;
				$w(controllers.AdjustPercentage_box3).value = parseFloat($w(controllers.AdjustPercentage_box3).value) - difference;
			}
		}
	}
}

export function DrawGraphButton_click_1(event, $w) {
	
}