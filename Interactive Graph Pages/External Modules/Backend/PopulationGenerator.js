import {Lognormal} from 'backend/LognormalDistribution';
import {ReadGraphDataFromDB} from 'backend/DBConnection';

let Calculate = {
    AdjustedMean: function AdjustedMean(m, s) {
        var a1 = m * m;
        var a2 = Math.Sqrt(a1 + s * s);
        return Math.Log(a1 / a2);
    },
    AdjustedStd: function AdjustedStd(m, s) {
        var a1 = m * m;
        var a2 = a1 + s * s;
        return Math.Sqrt(Math.Log(a2 / a1));
    }
}

function GenerateVariable(m, s) {
    var adjustM = Calculate.AdjustedMean(m, s);
    var adjustS = Calculate.AdjustedStd(m, s);
    Lognormal.inv(Math.random(), m, s).then(result =>{
        return result;
    }).catch(err => {
        console.error("Error in Calling Lognormal Statistic Function: ");
        console.error(err);
    });
}

export function GeneratePopulation(GraphId) {
	var patients = new Array();
	var condition;
	ReadGraphDataFromDB(GraphId).then(result =>{
		condition = result;
	}).catch(err =>{
		console.error("Error at PopulationGenerator: ");
		console.error(err);
        return patients;
	});
    
	for (var i = 0; i < 20; i++) {
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
        patient["cl"] = GenerateVariable(condition.cl_mean,condition.cl_std);
        patient["f"] = GenerateVariable(condition.f_mean, condition.f_std);
        patients.push(patient); 
    }

    return patients;
}