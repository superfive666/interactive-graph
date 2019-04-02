import {PageLogic} from 'public/PageLogicCompliance.js';
import {graphs_phase2} from 'public/BackendParameter.js';
import {controllers} from 'public/controller.js';

$w.onReady(function () {
    $w(controllers.GraphArea).onMessage((event) => {
		if (event.data === "Ready") {
			PageLogic.PageLoad($w, graphs_phase2.Multiple_Oral_Dose_Compliance);
		}
	});
});

export function ResamplePatientButton_click(event, $w) {
	PageLogic.ResamplePatient($w);
}

export function ChangePopulationButton_click(event, $w) {
    PageLogic.ChangePopulation($w);
}

export function ShowPatientButton_click(event, $w) {
	PageLogic.DisplayData($w);
}

export function FirstPatientButton_click(event, $w) {
   	PageLogic.BackToDefault($w);
}

export function YesButton_click(event, $w) {
	PageLogic.ChangeViewType($w);
}

export function ApplyChangesButton_click(event, $w) {
	PageLogic.OptimizeCondition($w);
}