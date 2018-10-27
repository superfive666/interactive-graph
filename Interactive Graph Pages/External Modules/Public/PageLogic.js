import {controllers} from 'public/Controller.js';
import {Internal} from 'public/Controller.js';
import {messageRepository} from 'public/Message.js';
import {textRepository} from 'public/Controller.js';
import {chart} from 'public/ChartStyling.js';
import {displayData} from 'public/DisplayCalculator.js';
import {GraphBinding} from 'public/Controller.js';

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
    Adjust: false
}

let GraphData = {
    Data: {},
    Display: {},
    ChartStyle: {}
};

export let PageLogic = {
    PageLoad: function($w, GraphId) {
        Population.GraphId = GraphId;
        Population.DefaultPatient.OnLoad = Math.floor(Math.random()*20);
        Population.DefaultPatient.Adjusted = Math.floor(Math.random()*20);
        Population.ActivePatient = Population.DefaultPatient.OnLoad;
        GeneratePopulation(Population.GraphId).then(result =>{
            console.log("Population generated (Population.OnLoad): --->");
            console.log(result);
            Population.State = "OnLoad";
            Population[Population.State] = result;
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                console.log("Graph data calculated: --->");
                console.log(res);
                GraphData.Data = res;
                GraphData.Display = {
                    FirstPopulation: true,
                    ActivePatient: Population.ActivePatient,
                    OnePopulation: true
                }
                GraphData.ChartStyle = chart(
                    Population[Population.State][0].h_max, 
                    Population[Population.State],
                    {
                        id: parseInt(Population.GraphId.slice(-1), 10),
                        single: true,
                        adjusted: false,
                        firstPopulation: true,
                        activePatient: Population.ActivePatient
                    }
                );           
                $w(controllers.ChangePopulation).disable();
                textRepository.QuestionText.TextIndex = 0;
                $w(controllers.QuestionText).text = textRepository.QuestionText.TextItems[
                                                    textRepository.QuestionText.TextIndex];
                textRepository.ShowPatientButton.TextIndex = 0;
                $w(controllers.ShowPatient).label = textRepository.ShowPatientButton.TextItems[
                                                    textRepository.ShowPatientButton.TextIndex];
                textRepository.FirstPatientButton.TextIndex = 0;
                $w(controllers.BackToFirstPatient).label = textRepository.FirstPatientButton.TextItems[
                                                           textRepository.FirstPatientButton.TextIndex];        
                
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
        GraphData.Display.ActivePatient = Population.ActivePatient;
        GraphData.ChartStyle = chart(
            Population[Population.State][0].h_max, 
            Population[Population.State],
            {
                id: parseInt(Population.GraphId.slice(-1), 10),
                single: textRepository.ShowPatientButton.TextIndex === 0,
                adjusted: Population.State === "Adjusted",
                firstPopulation: true,
                activePatient: Population.ActivePatient
            }
        );        

        $w(controllers.GraphArea).postMessage(GraphData, "*");
        console.log("Graph data posted: All Data --->");
        console.log(GraphData);
    },
    ChangePopulation: function($w) {
        $w(controllers.SwitchPatient).disable();


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
    BackToDefault: function($w) {
        var target = Population.Adjust? "OnLoad" : "Adjusted";
        if(Population.State === "Others") {
            Calculate(Population.GraphId, Population[target]).then(res=>{
                console.log("Graph data calculated: --->");
                console.log(res);
                GraphData.Data = res;
            }).catch(err =>{
                console.error("Error calling calculating graph data.");
                console.error(err);
                return;
            });
        }
        Population.State = target;
        Population.ActivePatient = Population.DefaultPatient[target];
        GraphData.Display.ActivePatient = Population.ActivePatient;
        GraphData.Display.FirstPopulation = true;
        GraphData.ChartStyle = chart(
            Population[Population.State][0].h_max, 
            Population[Population.State],
            {
                id: parseInt(Population.GraphId.slice(-1), 10),
                single: textRepository.ShowPatientButton.TextIndex === 0,
                adjusted: Population.State === "Adjusted",
                firstPopulation: true,
                activePatient: Population.ActivePatient
            }
        );
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
        GraphData.Display.OnePopulation = !GraphData.Display.OnePopulation;

        GraphData.ChartStyle = chart(
            Population[Population.State][0].h_max, 
            Population[Population.State],
            {
                id: parseInt(Population.GraphId.slice(-1), 10),
                single: textRepository.ShowPatientButton.TextIndex === 0,
                adjusted: Population.Adjusted === "Adjusted",
                firstPopulation: true,
                activePatient: Population.ActivePatient
            }
        );

        $w(controllers.GraphArea).postMessage(GraphData, "*");
    },
    OptimizeCondition: function($w) {
        Internal.ToggleText($w(controllers.QuestionText), 0);
	    Internal.ToggleLabel($w(controllers.ShowPatient), 0);
        Internal.ToggleLabel($w(controllers.BackToFirstPatient), 0);
        
        Population
        var freq = $w(controllers.Frequency);
        var dose = $w(controllers.DosageInput);
        var infusion = $w(controllers.InfusionRate);
        
        Population.Others = Population[Population.State].slice();
        Population.Others.forEach((val)=>{
            val.infusion_rate = infusion === undefined? val.infusion_rate : parseFloat(infusion.value);
            val.dose = dose === undefined? val.dose : parseFloat(dose.value);
            val.tau = freq === undefined? val.tau : parseFloat(freq.value);
        });
        var temp = Population.State;
        Population.State = "Others";
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            console.info("Graph data calculated:" + result);
            GraphData.Data = result;
            Population.State = temp;
            Population.ActivePatient = Population.DefaultPatient[Population.State];
            GraphData.Display = {
                ActivePatient: Population.ActivePatient,
                FirstPopulation: true,
                OnePopulation: true
            }
        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
    },
    ChangePercentage: function($w) {
        var Pecentage = {
            Poor: $w(controllers.AdjustPercentage_box1).value/100.0,
            Intermediate: $w(controllers.AdjustPercentage_box2).value/100.0, 
            Extensive: $w(controllers.AdjustPercentage_box3).value/100.0
        }
        Population.ActivePatient = Population.DefaultPatient.Adjusted;
        UpdatePopulationCondition(Population.GraphId, Pecentage).then(result =>{
            console.info("Population generated (Population.Adjusted):" + result);
            Population.Adjusted = result;

            Population.State = "Adjusted";
            Calculate(Population.GraphId, Population[Population.State]).then(res =>{
                console.info("Graph data calculated:" + res);
                GraphData.Data = res;
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
        Population.State = "OnLoad";
        Population.ActivePatient = Population.DefaultPatient[Population.State];
        Calculate(Population.GraphId, Population[Population.State]).then(result =>{
            console.info("Graph data calculated:" + result);
            GraphData.Data = result;

            GraphData.Display = {
                FirstPopulation: true,
                ActivePatient: Population.ActivePatient,
            }


        }).catch(err =>{
            console.error("Error calling calculating graph data.");
            console.error(err);
            return;
        });
    }
}