let mainForm = document.forms.mainForm;

async function getLocationData() {
    const locationData = await fetch('/cotizador/cliente/api').then((result) => result.json());

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
    })

    //DOWN PAYMENT CHANGE HANDLER

    mainForm.downPayment.addEventListener('change', (e) => {
        const downPaymentIndex = currLocation.options.findIndex(option => option == e.target.value);
        mainForm.landPrice.value = currLocation.landPrices[downPaymentIndex];
    })
}

window.onload = () => {
    getLocationData();
    document.getElementById('termLabel').innerHTML = mainForm.term.value;
    document.getElementById('squareMetersLabel').innerHTML = mainForm.squareMeters.value;
}

// TERM RANGE SLIDER LABEL UPDATER

mainForm.term.addEventListener('mousemove', (e) => {
    document.getElementById('termLabel').innerHTML = e.target.value;
})
mainForm.term.addEventListener('touchmove', (e) => {
    document.getElementById('termLabel').innerHTML = e.target.value;
})

// MSI RANGE SLIDER LABEL UPDATER

mainForm.squareMeters.addEventListener('mousemove', (e) => {
    document.getElementById('squareMetersLabel').innerHTML = e.target.value;
})
mainForm.squareMeters.addEventListener('touchmove', (e) => {
    document.getElementById('squareMetersLabel').innerHTML = e.target.value;
})

mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = {
        location: mainForm.locations.value,
        squareMeters: mainForm.squareMeters.value,
        downPayment: mainForm.downPayment.value,
        landPrice: mainForm.landPrice.value,
        term: mainForm.term.value,
        sendEmail: mainForm.sendEmail.value,
        name: mainForm.name.value,
        email: mainForm.email.value,
        tel: mainForm.tel.value
    };

    const params = new URLSearchParams(payload).toString();

    fetch(`/sendmail?${params}`);

    window.location.href = `/cliente/resultado?${params}`;
})