import {Normal} from 'backend/StatsDistribution.js';
import {StepFunction} from 'backend/StatsDistribution.js';

export function UpdatePatientStartTime(patient, n) {
    var tauTime = new Array(1);
    tauTime[0] = 8;
    var startTime = new Array(1);
    startTime[0] = 0; n--;
    while(n--) {
        var type = StepFunction.inv(Math.random(), [
            {prob: 0, val: 1},
            {prob: patient.dose_non_compliance * (24.0 / patient.tau_mean) / 100.0, val: 2}
        ]);
        tauTime.push(type === 1? 0.00 : Normal.inv(Math.random(), patient.tau_mean, patient.tau_std));
        startTime.push(type === 1? startTime[startTime.length-1] + patient.tau_mean 
            : startTime[startTime.length-1] + tauTime[tauTime.length-2]);
    }
    patient["start_time"] = startTime;
    return patient;
}