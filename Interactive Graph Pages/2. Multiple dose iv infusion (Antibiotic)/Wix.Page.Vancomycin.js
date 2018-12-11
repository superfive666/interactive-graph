import {PageLogic} from 'public/PageLogic.js';
import {graphs} from 'public/BackendParameter.js';
import {controllers} from 'public/Controller.js';

$w.onReady(function () {
	$w(controllers.GraphArea).onMessage((event) => {
		if (event.data === "Ready") {
			PageLogic.PageLoad($w, graphs.Multiple_Dose_IV_Infusion);
		}
	});
	$w("#DosageInput").value = 500;
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

export function ChangePercentage_enter(event, $w) {
	PageLogic.ChangePercentage($w);
}

export function AdjustPercentage1_change(event) {
	PageLogic.AdjustPercentage($w, 0);
}

export function AdjustPercentage2_change(event) {
	PageLogic.AdjustPercentage($w, 1);
}

export function AdjustPercentage4_change(event) {
	PageLogic.AdjustPercentage($w, 2);
}

export function DrawGraphButton_click(event) {
	PageLogic.ChangePercentage($w);
}

export function ResetButton_click(event) {
	PageLogic.ResetGraph($w);
}

export function button1_click(event) {
	PageLogic.FilterGraph(event.target);
}

export function button2_click(event) {
	PageLogic.FilterGraph(event.target);
}

export function button3_click(event) {
	PageLogic.FilterGraph(event.target);
}

export function button4_click(event) {
	PageLogic.FilterGraph(event.target); 
}