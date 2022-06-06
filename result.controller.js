function formatCurrency(number) {
    return `${new Intl.NumberFormat('en-US', {currency: 'USD', style: 'currency'}).format(number)}`;
}

function computeResult(data) {
    const lockedLandPrice = data.landPrice * data.squareMeters;

    let totalLandPrice = lockedLandPrice - (lockedLandPrice *(data.baseDiscount / 100));
    totalLandPrice -= totalLandPrice * (data.additionalDiscount / 100);
    totalLandPrice -= data.extraDiscounts;

    let savings = lockedLandPrice - totalLandPrice;
    
    let downPayment = totalLandPrice * (data.downPayment / 100);
    const lockedDownPayment = downPayment;
    if (data.fastPayDiscount == "true") {
        downPayment -= downPayment * 0.10;
    }

    if (downPayment < 5000) {
        downPayment = 5000;
    }

    if (data.downPayment == 1 && data.squareMeters >= 800 && downPayment < 25000) {
        downPayment = 25000;
    }


    savings += lockedDownPayment - downPayment;

    let months = data.term * 12;

    let debt = totalLandPrice - lockedDownPayment;

    const periodPayment1 = debt / months;
    months -= data.msi;
    debt -= periodPayment1 * data.msi;

    let periodPayment2 = (debt * 0.01) / (1 - Math.pow(1.01, - (months)));
    let periodTerm2 = 120 - data.msi;
    let months2= 0;

    for (i = 0; i < periodTerm2; i++) {
        if (months > 0) {
            let interest = debt * 0.01;
            let capital = periodPayment2 - interest;
            debt -= capital;
            months--;
            months2++;
        }
    }

    const periodPayment3 = (debt * 0.0125) / (1 - Math.pow(1.0125, - (months)));
    const periodTerm3 = months;

    const finalLandPrice = lockedLandPrice - savings;

    const resultData = {
        landPricem2: formatCurrency(data.landPrice),
        lockedLandPrice: formatCurrency(lockedLandPrice),
        totalLandPrice: formatCurrency(totalLandPrice),
        downPayment: formatCurrency(downPayment),
        extraDiscounts: formatCurrency(data.extraDiscounts),
        savings: formatCurrency(savings),
        finalLandPrice: formatCurrency(finalLandPrice),
        finalSquareMeterPrice: formatCurrency(finalLandPrice / data.squareMeters),
        period1: {
            term: data.msi,
            amount: formatCurrency(periodPayment1)
        },
        period2: {
            term: (months2 > 0)?months2:null,
            amount: (months2 > 0)?formatCurrency(periodPayment2):null
        },
        period3: {
            term: (periodTerm3 > 0)?periodTerm3:null,
            amount: (periodTerm3 > 0)?formatCurrency(periodPayment3):null
        }
    }
    
    return resultData;
}

module.exports = computeResult;