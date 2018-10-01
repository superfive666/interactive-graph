let displayData = {
	Population: function(patients, data) {
        var patient = patients[0];
        var map = data.map(function(row){ return Math.max(...row)});
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
        var result = {
            vmax: patient.vmax,
            km: patient.km,
            infusion_rate: patient.infusion_rate,
            wash_out: patient.wash_out,
            mic: patient.mic,
            dose: patient.dose,
            tau: patient.tau,
            vd: ave.vd,
            er: ave.er,
            ka: ave.ka,
            cl: ave.cl,
            f: ave.f,
            thalf: ave.thalf,
            cmin: Math.min(...map),
            cmax: Math.max(...map),
            _f: 1 - this.er
        }
        return result;
	},
	SinglePatient: function(patients, i , data) {
        var patient = patients[i];
        var result = {
            vmax: patient.vmax,
            km: patient.km,
            infusion_rate: patient.infusion_rate,
            wash_out: patient.wash_out,
            mic: patient.mic,
            dose: patient.dose,
            tau: patient.tau,
            vd: patient.vd,
            er: patient.er,
            ka: patient.ka,
            cl: patient.cl,
            f: patient.f,
            thalf: patient.thalf,
            cmin: patient.cmin,
            cmax: Math.max(...data[i+1]),
            _f: 1 - this.er
        };
        return result;
	}
}

function RoundNDecimal(val, n) {
    n = Math.pow(10, n);
    return Math.round(val*n)/n;
}