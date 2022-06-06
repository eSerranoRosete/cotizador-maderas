let mainForm = document.forms.mainForm;

let today = new Date();
const date = `${today.getDate()}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

async function getLocationData() {
    const locationData = await fetch('/cotizador/asesor/api').then((result) => result.json());

    let currLocation = locationData[0];

    locationData.forEach(location => {
        let option = document.createElement('option');
        option.value= location.name;
        option.text= location.name;
        mainForm.locations.add(option);
    })

    currLocation.options.forEach(payOption => {
        let option = document.createElement('option');
        option.value = payOption;
        option.text = `${payOption}%`;
        mainForm.downPayment.add(option);
    })

    mainForm.landPrice.value = currLocation.landPrices[0];

    //LOCATION CHANGE HANDLER

    mainForm.locations.addEventListener('change', (e) => {
        mainForm.downPayment.innerHTML = null;

        currLocation = locationData[locationData.findIndex(location => location.name == e.target.value)];

        currLocation.options.forEach(payOption => {
            let option = document.createElement('option');
            option.value = payOption;
            option.text = `${payOption}%`;
            mainForm.downPayment.add(option);
        })

        mainForm.landPrice.value = currLocation.landPrices[0];
        mainForm.fastPay.disabled = false;

    })

    //DOWN PAYMENT CHANGE HANDLER

    mainForm.downPayment.addEventListener('change', (e) => {
        const downPaymentIndex = currLocation.options.findIndex(option => option == e.target.value);
        mainForm.landPrice.value = currLocation.landPrices[downPaymentIndex];

        if (e.target.value != 10) {
            mainForm.fastPay.checked = false;
            mainForm.fastPay.disabled = true;
        } else {
            mainForm.fastPay.disabled = false;
        }
    })
}

window.onload = () => {
    getLocationData();
    document.getElementById('termLabel').innerHTML = mainForm.term.value;
    document.getElementById('msiLabel').innerHTML = mainForm.msi.value;
}

// TERM RANGE SLIDER LABEL UPDATER

mainForm.term.addEventListener('mousemove', (e) => {
    document.getElementById('termLabel').innerHTML = e.target.value;
})
mainForm.term.addEventListener('touchmove', (e) => {
    document.getElementById('termLabel').innerHTML = e.target.value;
})

// MSI RANGE SLIDER LABEL UPDATER

mainForm.msi.addEventListener('mousemove', (e) => {
    document.getElementById('msiLabel').innerHTML = e.target.value;
})
mainForm.msi.addEventListener('touchmove', (e) => {
    document.getElementById('msiLabel').innerHTML = e.target.value;
})

function validateLandPrice() {
    if (mainForm.landPrice.value < 1000) {
        document.getElementById('landPriceMsg').innerHTML = "El valor no puede ser menor a 1000";
        return false;
    } else {
        document.getElementById('landPriceMsg').innerHTML = null;
        return true;
    }
}

function validateBaseDiscount() {
    if (!mainForm.baseDiscount.value || mainForm.baseDiscount.value < 0) {
        document.getElementById('baseDiscountMsg').innerHTML = "Introduce un valor valido";
        return false;
    } else {
        document.getElementById('baseDiscountMsg').innerHTML = null;
        return true;
    }
}

function validateAdditionalDiscount() {
    if (!mainForm.additionalDiscount.value || mainForm.additionalDiscount.value < 0) {
        document.getElementById('additionalDiscountMsg').innerHTML = "Introduce un valor valido";
        return false;
    } else {
        document.getElementById('additionalDiscountMsg').innerHTML = null;
        return true;
    }
}

function validateArea() {
    if (mainForm.squareMeters.value < 112) {
        document.getElementById('squareMetersMsg').innerHTML = "El valor debe ser mayor a 112";
        return false;
    } else {
        document.getElementById('squareMetersMsg').innerHTML = null;
        return true;
    }
}

function validateExtraDiscounts() {
    if (mainForm.extraDiscounts.value < 0) {
        document.getElementById('extraDiscountsMsg').innerHTML = "El valor no puede ser menor a 0";
        return false;
    } else {
        document.getElementById('extraDiscountsMsg').innerHTML = null;
        return true;
    }
}

mainForm.landPrice.addEventListener('blur', validateLandPrice);

mainForm.baseDiscount.addEventListener('blur', (e) => {
    validateBaseDiscount(e.target.value);
});
mainForm.additionalDiscount.addEventListener('blur', (e) => {
    validateAdditionalDiscount(e.target.value);
});

mainForm.extraDiscounts.addEventListener('blur', validateExtraDiscounts);

mainForm.squareMeters.addEventListener('blur', validateArea);

mainForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const title = document.getElementById('title').innerHTML;
    const plaza = document.getElementById('plaza').innerHTML;

    if (validateLandPrice() && validateBaseDiscount() && validateAdditionalDiscount() && validateArea() && validateExtraDiscounts()) {

        const data = {
            title: title,
            plaza: plaza,
            date: date,
            location: mainForm.locations.value,
            cluster: mainForm.cluster.value,
            landSection: mainForm.landSection.value,
            squareMeters: mainForm.squareMeters.value,
            downPayment: mainForm.downPayment.value,
            landPrice: mainForm.landPrice.value,
            term: mainForm.term.value,
            msi: mainForm.msi.value,
            baseDiscount: mainForm.baseDiscount.value,
            additionalDiscount: mainForm.additionalDiscount.value,
            extraDiscounts: mainForm.extraDiscounts.value,
            fastPayDiscount: mainForm.fastPay.checked
        }

        const params = new URLSearchParams(data).toString();
        window.location.href = `/asesor/resultado?${params}`;
    } else {
        console.log('Something is not right');
    }
})