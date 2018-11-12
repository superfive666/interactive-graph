import {Lognormal} from 'backend/LognormalDistribution.js';
import {ReadGraphDataFromDB} from 'backend/DBConnection.js';
import {graphs} from 'public/BackendParameter.js';

let Calculate = {
    AdjustedMean: function AdjustedMean(m, s) {
        var a1 = m * m;
        var a2 = Math.sqrt(a1 + s * s);
        return Math.log(a1 / a2);
    },
    AdjustedStd: function AdjustedStd(m, s) {
        var a1 = m * m;
        var a2 = a1 + s * s;
        return Math.sqrt(Math.log(a2 / a1));
    }
}

function GenerateVariable(m, s) {
    var adjustM = Calculate.AdjustedMean(m, s);
    var adjustS = Calculate.AdjustedStd(m, s);
    return Lognormal.inv(Math.random(), adjustM, adjustS);
}

function GenerateOnePatient(condition, adj) {
    var patient = { };
    patient["patient_name"] = condition.patient_name;
    patient["patient_race"] = condition.patient_race;
    patient["patient_age"] = condition.patient_age;
    patient["patient_bodyweight"] = condition.patient_bodyweight;
    patient["patient_height"] = condition.patient_height;
    patient["vmax"] = condition.vmax;
    patient["km"] = condition.km;
    patient["infusion_rate"] = condition.infusion_rate;
    patient["wash_out"] = condition.wash_out;
    patient["mic"] = condition.mic;
    patient["dose"] = condition.dose;
    patient["tau"] = condition.tau;
    patient["vd"] = GenerateVariable(condition.vd_mean, condition.vd_std);
    patient["er"] = GenerateVariable(condition.er_mean, condition.er_std);
    patient["ka"] = GenerateVariable(condition.ka_mean, condition.ka_std);
    patient["cl"] = GenerateVariable(condition.cl_mean * adj,condition.cl_std);
    patient["f"] = GenerateVariable(condition.f_mean, condition.f_std);
    patient["h_max"] = condition.horizontal_max;
    patient["low"] = condition.low;
    patient["ht"] = condition.ht;
    patient["actualKe"] = Math.min(0.9999, patient.cl * 60 / patient.vd / 1000);
    patient["cmin"] = 0;
    patient["cmax"] = 0;
    return patient;
}

export async function GeneratePopulation(GraphId) {
	var patients = new Array();
	var condition = await ReadGraphDataFromDB(GraphId);
    for (var i = 0; i < 20; i++) {
        var patient = GenerateOnePatient(condition, 1);
        var temp = GraphId === graphs.Continuous_Intravenous_Analgesic? 
        patient.actualKe * patient.patient_bodyweight : 
        patient.actualKe;
        patient["ke"] = Math.log(1) - Math.log(1 - temp);
        patient["thalf"] = Math.log(2)/patient.ke;
        patients.push(patient); 
    }
    console.log("PopulationGenerator Generate Population: ");
    console.log(patients);
    return patients;
}

export async function UpdatePopulationCondition(GraphId, Percentage) {
    var patients = new Array();
    var condition = await ReadGraphDataFromDB(GraphId);
 
    var strata = new Array();
    strata.push(Math.ceil(20 * Percentage.Poor));
    strata.push(Math.ceil(20 * Percentage.Intermediate) + strata[0]);
    strata.push(Math.ceil(20 * Percentage.Extensive) + strata[1]);
    strata.push(20);
    var adj = 0.5;
    var i = 0, j = -1;
    while(++j < strata.length) 
    { 
        while(i++ < strata[j]) 
        {
            var patient = GenerateOnePatient(condition, adj);
            var temp = GraphId === graphs.Continuous_Intravenous_Analgesic? 
            patient.actualKe * patient.patient_bodyweight : 
            patient.actualKe;
            patient["ke"] = Math.log(1) - Math.log(1 - temp);
            patient["thalf"] = Math.log(2)/patient.ke;
            patient["last"] = j;
            patients.push(patient); 
        }
        adj += 0.25; i--; 
    }
    
    console.log("PopulationGenerator Update Population Condition: ");
    console.log(patients);
    return patients;  
}