import {PageLogic} from 'public/PageLogic.js';
import {graphs} from 'public/BackendParameter.js';

$w.onReady(function () {
	PageLogic.PageLoad($w, graphs.Multiple_Dose_IV_Infusion);
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