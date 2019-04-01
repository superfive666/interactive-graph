import {controllers} from 'public/Controller.js';
import {Internal} from 'public/Controller.js';
import {textRepository} from 'public/Controller.js';
import {chart} from 'public/ChartStyling.js';
import {displayData} from 'public/DisplayCalculator.js';
import {Calculate} from 'backend/Calculator.jsw';
import {GeneratePopulation} from 'backend/PopulationGenerator.jsw';
import {UpdatePopulationCondition} from 'backend/PopulationGenerator.jsw';

import wixWindow from 'wix-window';

let Population = {
	OnLoad: {},
	Adjusted: {},
	Others: {},
	DefaultPatient: {
		OnLoad: undefined,
		Adjusted: undefined
    },
    DefaultParameters: {
        Frequency: undefined,
        DosageInput: undefined,
        InfusionRate: undefined
    },
    Filter: {
        0: true,
        1: true,
        2: true,
        3: true
    },
    ActivePatient: 0,
    State: "OnLoad",
    GraphId: "",
    Adjust: false,
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
        Population.DefaultPatient.Adjusted = Math.floor(Math.random()*20);
        Population.ActivePatient = Population.DefaultPatient.OnLoad;
        $w(controllers.Yes).label = textRepository.ButtonText.Single;
        $w(controllers.ChangePopulation).disable();
        DefaultText();     
        GeneratePopulation(Population.GraphId).then(result =>{
            Population.State = "OnLoad";
            Population[Population.State] = result;
            SaveDefaultCondition();
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                GraphData.Data = res;
                SetGraphConfig(true, true, Population.Filter);
                $w(controllers.GraphArea).postMessage(GraphData, "*");
            }).catch(err =>{
                console.error("Error calling calculating graph data.");
                console.error(err);
                return;
            });
        }).catch(err=>{
            console.error("Error calling generating population.");
            console.error(err);
            return;
        });
    },
    ResamplePatient: function($w) {
        Population.ActivePatient = (Population.ActivePatient + 1) % 20;
        if(Population.Adjust && !Population.OnePopulation) {
            while(!Population.Filter[GraphData.ChartStyle.series[Population.ActivePatient].phenotype]) {
                Population.ActivePatient = (Population.ActivePatient + 1) % 20;
            }
        }
        SetGraphConfig(true, GraphData.Display.OnePopulation, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    ChangePopulation:  async function($w) {
        $w(controllers.SwitchPatient).disable();
        $w(controllers.Yes).disable();
        $w(controllers.AppyChange).disable();
        Population.State = "Others";
        Population[Population.State] = Population.Adjust?
            await UpdatePopulationCondition(Population.GraphId, Pecentage, GetCondition()) : 
            await GeneratePopulation(Population.GraphId, GetCondition());
        Calculate(Population.GraphId, Population[Population.State]).then(res =>{
            GraphData.Data = res;
            SetGraphConfig(false, false, Population.Filter);
            $w(controllers.GraphArea).postMessage(GraphData, "*");
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
    },
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
        var target = Population.Adjust? "Adjusted" : "OnLoad";
        ResetFilter();
        $w(controllers.SwitchPatient).enable();
        $w(controllers.AppyChange).enable();
        $w(controllers.Yes).enable();
        if(Population.State === "Others") {
            GraphData.Data = await Calculate(Population.GraphId, Population[target]);
        }
        Population.State = target;
        Population.ActivePatient = Population.DefaultPatient[target];
        SetGraphConfig(true, GraphData.Display.OnePopulation, Population.Filter);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    ChangeViewType: function($w) {
        Internal.ToggleLabel($w(controllers.BackToFirstPatient));
        Internal.ToggleLabel($w(controllers.ShowPatient));
        if (textRepository.ShowPatientButton.TextIndex === 0)
        {
            $w(controllers.ChangePopulation).disable();
            ResetFilter();
            $w(controllers.DisplayLegend_section).hide("fade");
        } else {
            $w(controllers.ChangePopulation).enable();
            if(Population.Adjust) $w(controllers.DisplayLegend_section).show("fade");
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
        var infusion = $w(controllers.InfusionRate);
        if (infusion.length === 0) infusion = undefined;
        GraphData.Display.OnePopulation = true;
        Population.Others = Population[Population.State].slice();
        Population.Others.forEach((val)=>{
            val.infusion_rate = infusion === undefined? val.infusion_rate : parseFloat(infusion.value);
            val.dose = dose === undefined? val.dose : parseFloat(dose.value);
            val.tau = freq === undefined? val.tau : parseFloat(freq.value);
        });
        Population.State = "Others";
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            GraphData.Data = result;
            SetGraphConfig(true, true, Population.Filter);
            $w(controllers.GraphArea).postMessage(GraphData, "*");
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
        $w(controllers.Yes).label = GraphData.Display.OnePopulation? 
            textRepository.ButtonText.Single : textRepository.ButtonText.Population;
    },
    ChangePercentage: function($w) {
        Pecentage = {
            Poor: $w(controllers.AdjustPercentage_box1).value/100.0,
            Intermediate: $w(controllers.AdjustPercentage_box2).value/100.0, 
            Extensive: $w(controllers.AdjustPercentage_box3).value/100.0
        }
        Population.ActivePatient = Population.DefaultPatient.Adjusted;
        $w(controllers.AdjustPercentage_section).hide("fade");
        if(!GraphData.Display.OnePopulation) $w(controllers.DisplayLegend_section).show("fade");
        AfterChangePercent();
        UpdatePopulationCondition(Population.GraphId, Pecentage, GetCondition()).then(result =>{
            Population.Adjusted = result;
            Population.State = "Adjusted";
            Population.Adjust = true;
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                GraphData.Data = res;
                SetGraphConfig(true, GraphData.Display.OnePopulation, Population.Filter);
                $w(controllers.GraphArea).postMessage(GraphData, "*");
            }).catch(err =>{
                console.error("Error calling calculating graph data.");
                console.error(err);
                return;
            });
        }).catch(err=>{
            console.error("Error calling generating population.");
            console.error(err);
            return;
        });
    },
    AdjustPercentage: function($w, cur) {
        var sliders = [ 
            $w(controllers.AdjustPercentage_box1),
            $w(controllers.AdjustPercentage_box2),
            $w(controllers.AdjustPercentage_box4)
        ]
        var a = sliders[(cur++)%3];
        var b = sliders[(cur++)%3];
        var c = sliders[(cur++)%3];
        var d = $w(controllers.AdjustPercentage_box3);
        var previous = 100 - b.value - c.value - d.value;
        var current = a.value;
        if (current < previous){
            d.value += (previous - current);
        } else {
            var difference = current - previous;
            if(d.value > difference) {
                d.value -= difference 
            } else {
                difference -= d.value;
                d.value = 0;
                if (b.value > difference) {
                    b.value -= difference;
                } else {
                    difference -= b.value;
                    b.value = 0;
                    c.value -= difference;
                }
            }
        }
    },
    ResetGraph: function($w) {
        $w(controllers.AdjustPercentage_section).show("fade");
        BeforeChangePercent();
        ResetFilter();
        DefaultText();
        $w(controllers.ChangePopulation).disable();
        $w(controllers.Yes).enable();
        $w(controllers.AppyChange).enable();
        $w(controllers.SwitchPatient).enable();
        $w(controllers.DisplayLegend_section).hide("fade");
        Population.State = "OnLoad";
        Population.Adjust = false;
        Population.ActivePatient = Population.DefaultPatient[Population.State];
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            GraphData.Data = result;
            SetGraphConfig(true, true, Population.Filter);    
            $w(controllers.GraphArea).postMessage(GraphData, "*");
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
        $w(controllers.Yes).label = GraphData.Display.OnePopulation? 
            textRepository.ButtonText.Single : textRepository.ButtonText.Population;
    },
    FilterGraph: function(target) {
        Internal.ToggleButton(target);
        var i = target.id.slice(-1)-1;
        Population.Filter[i] = !Population.Filter[i];
        if(!Population.Filter[0]&&!Population.Filter[1]&&!Population.Filter[2]&&!Population.Filter[3]) {
            $w(controllers.SwitchPatient).disable();
        } else {
            if (Population.State !== "Others") $w(controllers.SwitchPatient).enable();
            while(!Population.Filter[GraphData.ChartStyle.series[Population.ActivePatient].phenotype]) {
                Population.ActivePatient = (Population.ActivePatient + 1) % 20;
            }
        }
        SetGraphConfig(Population.State !== "Others", false, Population.Filter);
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
            single: textRepository.ShowPatientButton.TextIndex === 0,
            adjusted: Population.Adjust,
            firstPopulation: first,
            activePatient: Population.ActivePatient,
            filter: filter
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

function SetChangePercentText() {
    $w(controllers.DisplayPercentage_text1).text = ($w(controllers.AdjustPercentage_box1).value * 20 / 100).toString();
    $w(controllers.DisplayPercentage_text2).text = ($w(controllers.AdjustPercentage_box2).value * 20 / 100).toString();
    $w(controllers.DisplayPercentage_text3).text = ($w(controllers.AdjustPercentage_box3).value * 20 / 100).toString();
    $w(controllers.DisplayPercentage_text4).text = ($w(controllers.AdjustPercentage_box4).value * 20 / 100).toString();
}

function AfterChangePercent() {
    SetChangePercentText();
    $w(controllers.AdjustPercentage_section).hide("fade");
    $w(controllers.DisplayPercentage_section).show("fade");
}

function BeforeChangePercent() {
    $w(controllers.DisplayPercentage_section).hide("fade");
    $w(controllers.AdjustPercentage_section).show("fade");
}

function GetCondition() {    
    if(($w(controllers.InfusionRate).length !== 0 && $w(controllers.InfusionRate).value === '')||
       ($w(controllers.Frequency).length !== 0 && $w(controllers.Frequency).value === ''))
        return undefined;
    return {
        Frequency: $w(controllers.Frequency).length !== 0? $w(controllers.Frequency).value : Population.DefaultParameters.Frequency,
        DosageInput: $w(controllers.DosageInput).value,
        InfusionRate: $w(controllers.InfusionRate).length !== 0? $w(controllers.InfusionRate).value : Population.DefaultParameters.InfusionRate
    }
}

function SaveDefaultCondition() {
    Population.DefaultParameters.DosageInput = $w(controllers.DosageInput).value;
    Population.DefaultParameters.Frequency = $w(controllers.Frequency).length !== 0?$w(controllers.Frequency).value:Population[Population.State][0].tau;
    Population.DefaultParameters.InfusionRate = $w(controllers.InfusionRate).length !== 0?$w(controllers.InfusionRate).value:Population[Population.State][0].infusion_rate;
}

function ResetFilter() {
    for(var i = 0; i < 4; i++) {
        Population.Filter[i] = true;
    }
    Internal.ToggleButton($w(controllers.Legend1), true);
    Internal.ToggleButton($w(controllers.Legend2), true);
    Internal.ToggleButton($w(controllers.Legend3), true);
    Internal.ToggleButton($w(controllers.Legend4), true);
}