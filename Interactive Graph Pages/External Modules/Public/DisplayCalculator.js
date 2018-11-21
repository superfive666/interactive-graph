export let displayData = {
	Population: function(patients, data) {
        var patient = patients[0];
        var ave = patients.reduce((a, b, index, self) => {
            const keys = Object.keys(a)
            let c = {};
            keys.map((key) => {
                c[key] = a[key] + b[key]
                if (index + 1 === self.length) {
                    c[key] = c[key] / self.length
                }
            })
            return c;
        });
        var cmin = 10000000;
        var cmax = 0;
        for(var j = 1; j <= 20; j++) {
            var localmax = 0;
            for(var i = 0; i < data.length; i++) {
                localmax = Math.max(localmax, data[i][j]);
            }
            cmin = Math.min(localmax, cmin);
            cmax = Math.max(localmax, cmax);
        }
        var result = {
            vmax: patient.vmax,
            km: patient.km,
            infusion_rate: patient.infusion_rate,
            wash_out: patient.wash_out,
            mic: patient.mic,
            dose: patient.dose,
            tau: patient.tau,
            vd: RoundNDecimal(ave.vd,2),
            er: RoundNDecimal(ave.er,2),
            ka: RoundNDecimal(ave.actualKe,2),
            cl: RoundNDecimal(ave.cl,2),
            f: RoundNDecimal(ave.f,2),
            thalf: RoundNDecimal(ave.thalf,2),
            cmin: RoundNDecimal(cmin,2),
            cmax: RoundNDecimal(cmax,2),
            _f: 1 - RoundNDecimal(ave.er,2),
            css: RoundNDecimal(data[data.length-1][21],2),
            tcss: RoundNDecimal(ave.thalf,2)
        }
        console.log("DisplayCalculator: Population result --->");
        console.log(result);
        return result;
	},
	SinglePatient: function(patients, j , data) {
        var patient = patients[j];
        var cmax = 0;
        for (var i = 0; i < data.length; i++) {
            cmax = Math.max(cmax, data[i][j+1]);
        }
        var result = {
            vmax: patient.vmax,
            km: patient.km,
            infusion_rate: patient.infusion_rate,
            wash_out: patient.wash_out,
            mic: patient.mic,
            dose: patient.dose,
            tau: patient.tau,
            vd: RoundNDecimal(patient.vd,2),
            er: RoundNDecimal(patient.er,2),
            ka: RoundNDecimal(patient.actualKe,2),
            cl: RoundNDecimal(patient.cl,2),
            f: RoundNDecimal(patient.f,2),
            thalf: RoundNDecimal(patient.thalf,2),
            cmin: patient.cmin,
            cmax: RoundNDecimal(cmax,2),
            _f: RoundNDecimal(1 - patient.er,2),
            css: RoundNDecimal(data[data.length-1][1],2),
            tcss: RoundNDecimal(patient.thalf*4.5,2)
        };
        console.log("DisplayCalculator: Single Patient result --->");
        console.log(result);
        return result;
	}
}

function RoundNDecimal(val, n) {
    n = Math.pow(10, n);
    return Math.round(val*n)/n;
}