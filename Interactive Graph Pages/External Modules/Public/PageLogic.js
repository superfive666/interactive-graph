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
        $w(controllers.ChangePopulation).disable();
        DefaultText();     
        GeneratePopulation(Population.GraphId).then(result =>{
            console.log("Population generated (Population.OnLoad): --->");
            console.log(result);
            Population.State = "OnLoad";
            Population[Population.State] = result;
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                console.log("Graph data calculated: --->");
                console.log(res);
                GraphData.Data = res;
                SetGraphConfig(true, true);
                $w(controllers.GraphArea).postMessage(GraphData, "*");
                console.log("Graph data posted: All Data --->");
                console.log(GraphData);
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
        SetGraphConfig(true, GraphData.Display.OnePopulation);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
        console.log("Graph data posted: All Data --->");
        console.log(GraphData);
    },
    ChangePopulation:  async function($w) {
        $w(controllers.SwitchPatient).disable();
        $w(controllers.Yes).disable();
        Population.State = "Others";
        Population[Population.State] = Population.Adjust?
            await UpdatePopulationCondition(Population.GraphId, Pecentage) : 
            await GeneratePopulation(Population.GraphId);

        Calculate(Population.GraphId, Population[Population.State]).then(res =>{
            console.log("Graph data calculated: --->");
            console.log(res);
            GraphData.Data = res;
            SetGraphConfig(false, false);
            $w(controllers.GraphArea).postMessage(GraphData, "*");
            console.log("Graph data posted: All Data --->");
            console.log(GraphData);
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
        $w(controllers.SwitchPatient).enable();
        $w(controllers.Yes).enable();
        if(Population.State === "Others") {
            GraphData.Data = await Calculate(Population.GraphId, Population[target]);
            console.log("Graph data calculated: --->");
            console.log(GraphData.Data);
        }
        Population.State = target;
        Population.ActivePatient = Population.DefaultPatient[target];
        SetGraphConfig(true, GraphData.Display.OnePopulation);
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
            $w(controllers.AppyChange).disable();
        }
        SetGraphConfig(true, !GraphData.Display.OnePopulation);
        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    OptimizeCondition: function($w) {
	    Internal.ToggleLabel($w(controllers.ShowPatient), 0);
        Internal.ToggleLabel($w(controllers.BackToFirstPatient), 0);
        
        var freq = $w(controllers.Frequency);
        var dose = $w(controllers.DosageInput);
        var infusion = $w(controllers.InfusionRate);
        
        Population.Others = Population[Population.State].slice();
        Population.Others.forEach((val)=>{
            val.infusion_rate = infusion === undefined? val.infusion_rate : parseFloat(infusion.value);
            val.dose = dose === undefined? val.dose : parseFloat(dose.value);
            val.tau = freq === undefined? val.tau : parseFloat(freq.value);
        });
        Population.State = "Others";
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            console.info("Graph data calculated: --->");
            console.info(result)
            GraphData.Data = result;
            SetGraphConfig(true, true);
            $w(controllers.GraphArea).postMessage(GraphData, "*");
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
    },
    ChangePercentage: function($w) {
        Pecentage = {
            Poor: $w(controllers.AdjustPercentage_box1).value/100.0,
            Intermediate: $w(controllers.AdjustPercentage_box2).value/100.0, 
            Extensive: $w(controllers.AdjustPercentage_box3).value/100.0
        }
        Population.ActivePatient = Population.DefaultPatient.Adjusted;
        $w(controllers.AdjustPercentage_section).hide("fade");
        SetChangePercentText();
        AfterChangePercent();
        console.info("Adjusted Percentage: --->");
        console.info(Pecentage);
        UpdatePopulationCondition(Population.GraphId, Pecentage).then(result =>{
            console.info("Population generated (Population.Adjusted): --->");
            console.info(result);
            Population.Adjusted = result;
            Population.State = "Adjusted";
            Population.Adjust = true;
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                console.info("Graph data calculated: --->");
                console.info(res);
                GraphData.Data = res;
                SetGraphConfig(true, GraphData.Display.OnePopulation);
                console.info("Graph data posted: --->");
                console.info(GraphData);
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
                d.valaue = 0;
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
        $w(controllers.ChangePopulation).disable();
        $w(controllers.Yes).enable();
        $w(controllers.SwitchPatient).enable();
        DefaultText();
        Population.State = "OnLoad";
        Population.Adjust = false;
        Population.ActivePatient = Population.DefaultPatient[Population.State];
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            console.info("Graph data calculated: --->");
            console.info(result);
            GraphData.Data = result;
            SetGraphConfig(true, true);    
            $w(controllers.GraphArea).postMessage(GraphData, "*");
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
    }
}

function SetGraphConfig(first, one) {
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

function SetChangePercentText() {

}

function AfterChangePercent() {

}

function BeforeChangePercent() {

}