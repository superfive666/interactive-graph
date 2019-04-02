import {controllers} from 'public/Controller.js';
import {Internal} from 'public/Controller.js';
import {textRepository} from 'public/Controller.js';
import {chart} from 'public/ChartStyling.js';
import {displayData} from 'public/DisplayCalculator.js';
import {Calculate} from 'backend/Calculator.jsw';
import {GenerateCompliance} from 'backend/ComplianceGenerator.jsw';
import {UpdatePatientStartTime} from 'backend/UpdatePatient.js';

import wixWindow from 'wix-window';

let Population = {
	OnLoad: {},
	Others: {},
	DefaultPatient: {
		OnLoad: undefined
    },
    DefaultParameters: {
        Frequency: undefined,
        DosageInput: undefined
    },
    ActivePatient: 0,
    State: "OnLoad",
    GraphId: "",
    OnePopulation: true
}

let GraphData = {
    Data: {},
    Display: {},
    ChartStyle: {}
};

let Pecentage = {};

export let PageLogic = {
    PageLoad: function($w, GraphId) {
        Population.GraphId = GraphId;
        Population.DefaultPatient.OnLoad = Math.floor(Math.random()*20);
        //Population.DefaultPatient.Adjusted = Math.floor(Math.random()*20);
        Population.ActivePatient = Population.DefaultPatient.OnLoad;
        $w(controllers.Yes).label = textRepository.ButtonText.Single;
        $w(controllers.ChangePopulation).disable();
        DefaultText();
        Population.State = "OnLoad";
        Population[Population.State] = await GenerateCompliance(Population.GraphId);
        GraphData.Data = await Calculate(Population.GraphId, Population[Population.State]);
        SetGraphConfig(true, true, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    ResamplePatient: function($w) {
        Population.ActivePatient = (Population.ActivePatient + 1) % 20;
        SetGraphConfig(true, GraphData.Display.OnePopulation, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    ChangePopulation:  async function($w) {
        $w(controllers.SwitchPatient).disable();
        $w(controllers.Yes).disable();
        $w(controllers.AppyChange).disable();
        Population.State = "Others";
        Population[Population.State] = await GenerateCompliance(Population.GraphId, GetCondition());
        GraphData.Data = await  Calculate(Population.GraphId, Population[Population.State]);
    },
    // update
    DisplayData: function($w) {
        var type = textRepository.ShowPatientButton.TextIndex === 0? "Single":"Population";
        var target = Population.GraphId + type;
        var data = type === "Single"? 
            displayData.SinglePatient(
                Population[Population.State],
                Population.ActivePatient,
                GraphData.Data
            ) : 
            displayData.Population(
                Population[Population.State],
                GraphData.Data
            )
        wixWindow.openLightbox(target, data);
    },
    BackToDefault: async function($w) {
        Population.State = "OnLoad";
        $w(controllers.SwitchPatient).enable();
        $w(controllers.AppyChange).enable();
        $w(controllers.Yes).enable();
        if(Population.State === "Others") {
            GraphData.Data = await Calculate(Population.GraphId, Population[Population.State]);
        }
        Population.ActivePatient = Population.DefaultPatient[Population.State];
        SetGraphConfig(true, GraphData.Display.OnePopulation, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    ChangeViewType: function($w) {
        Internal.ToggleLabel($w(controllers.BackToFirstPatient));
        Internal.ToggleLabel($w(controllers.ShowPatient));
        if (textRepository.ShowPatientButton.TextIndex === 0)
        {
            $w(controllers.ChangePopulation).disable();
        } else {
            $w(controllers.ChangePopulation).enable();
        }
        SetGraphConfig(true, !GraphData.Display.OnePopulation, Population.Filter);
        $w(controllers.Yes).label = GraphData.Display.OnePopulation? 
            textRepository.ButtonText.Single : textRepository.ButtonText.Population;
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    OptimizeCondition: function($w) {
        $w(controllers.ChangePopulation).disable();
	    Internal.ToggleLabel($w(controllers.ShowPatient), 0);
        Internal.ToggleLabel($w(controllers.BackToFirstPatient), 0);
        var freq = $w(controllers.Frequency);
        var dose = $w(controllers.DosageInput);
        var timeN = $w(controllers.TimeNoneComply);
        var doseN = $w(controllers.DoseNoneComply);
        GraphData.Display.OnePopulation = true;
        Population.Others = Population[Population.State].slice();
        Population.Others.forEach((val)=>{
            val.dose = parseFloat(dose.value);
            val.tau = parseFloat(freq.value);
            val.dose_non_compliance = doseN.value;
            val.time_non_compliance = timeN.value;
            val.tau_std = val.tau_mean * val.time_non_compliance * 0.03;
            val = UpdatePatientStartTime(val, val.max_dose);
        })
        Population.State = "Others";
        GraphData.Data = await Calculate(Population.GraphId, Population[Population.State]);
        SetGraphConfig(true, true, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
        $w(controllers.Yes).label = GraphData.Display.OnePopulation? 
            textRepository.ButtonText.Single : textRepository.ButtonText.Population;
    },
    MinMaxSliderChange: function($w, type, val) {
        GraphData.Data.forEach( row => {
            if(type === 1) row[22] = val;
            else row[23] = val;
        });
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    }
}

function SetGraphConfig(first, one, filter) {
    GraphData.Display = {
        FirstPopulation: first,
        ActivePatient: Population.ActivePatient,
        OnePopulation: one
    }
    GraphData.ChartStyle = chart(
        Population[Population.State][0].h_max, 
        Population[Population.State],
        {
            id: parseInt(Population.GraphId.slice(-1), 10),
            single: one,
            firstPopulation: first,
            activePatient: Population.ActivePatient
        }
    );
}

function DefaultText() {
    textRepository.ShowPatientButton.TextIndex = 0;
    $w(controllers.ShowPatient).label = textRepository.ShowPatientButton.TextItems[
                                        textRepository.ShowPatientButton.TextIndex];
    textRepository.FirstPatientButton.TextIndex = 0;
    $w(controllers.BackToFirstPatient).label = textRepository.FirstPatientButton.TextItems[
                                               textRepository.FirstPatientButton.TextIndex];     
}

function GetCondition() {
    return {
        Frequency: Population.DefaultParameters.Frequency,
        DosageInput: $w(controllers.DosageInput).value
    }
}