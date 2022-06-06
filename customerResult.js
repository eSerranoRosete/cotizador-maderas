function formatCurrency(number) {
    return `${new Intl.NumberFormat('en-US', {currency: 'USD', style: 'currency'}).format(number)}`;
}

function computeResult(data) {
    const lockedLandPrice = data.landPrice * data.squareMeters;
    
    let downPayment = lockedLandPrice * (data.downPayment / 100);

    if (downPayment < 5000) {
        downPayment = 5000;
    }

    const initialDebt = lockedLandPrice - downPayment;

    let months = data.term * 12;

    let debt = initialDebt;

    const periodPayment1 = debt / months;
    months -= 36;
    debt -= periodPayment1 * 36;

    let periodPayment2 = (debt * 0.01) / (1 - Math.pow(1.01, - (months)));
    let periodTerm2 = 120 - 36;

    for (i = 0; i < periodTerm2; i++) {
        let interest = debt * 0.01;
        let capital = periodPayment2 - interest;
        debt -= capital;
        months--;
    }

    const periodPayment3 = (debt * 0.0125) / (1 - Math.pow(1.0125, - (months)));
    const periodTerm3 = months;

    const resultData = {
        lockedLandPrice: formatCurrency(lockedLandPrice),
        downPayment: formatCurrency(downPayment),
        initialDebt: formatCurrency(initialDebt),
        period1: {
            term: 36,
            amount: formatCurrency(periodPayment1)
        },
        period2: {
            term: (periodTerm2 > 0)?periodTerm2:null,
            amount: (periodTerm2 > 0)?formatCurrency(periodPayment2):null
        },
        period3: {
            term: (periodTerm3 > 0)?periodTerm3:null,
            amount: (periodTerm3 > 0)?formatCurrency(periodPayment3):null
        }
    }
    
    return resultData;
}

module.exports = computeResult;