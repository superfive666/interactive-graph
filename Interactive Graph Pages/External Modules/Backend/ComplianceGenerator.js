import {graphs_phase2} from 'public/BackendParameter.js';
import {ReadCompliance} from 'backend/DBConnection.js';
import {Normal} from 'backend/StatsDistribution.js';
import {UpdatePatientStartTime} from 'backend/UpdatePatient.js';

function GenerateOnePatient(condition, adj) {
    var patient = {};
    patient["f"] = condition.f;
    patient["dose"] = condition.dose;
    patient["tau_mean"] = condition.tau_mean;
    patient["tau_std"] = condition.tau_std;
    pateint["vd"] = condition.vd_mean;
    patient["ka"] = condition.ka_mean;
    patient["max_dose"] = condition.max_dose;
    patient["thalf"] = Normal.inv(Math.random(), condition.thalf_mean, condition.thalf_std);
    patient["ke"] = Math.log(2)/patient.thalf;
    patient["dose_non_compliance"] = condition.dose_non_compliance;
    patient["dose_no"] = 0; // Calculation parameter, to be reset upon each cycles
    return UpdatePatientStartTime(patient, patient.max_dose);
}

export async function GenerateCompliance(GraphId, Condition) {
    var patients = new Array();
    var condition = await ReadCompliance(GraphId);
    for(var i = 0; i < 20; i++) {
        patients.push(GenerateOnePatient(condition, 1));
    }
    return patients;
}

export async function UpdateCompliance(GraphId, Condition) {
    // To be updated when required.
    return null;
}