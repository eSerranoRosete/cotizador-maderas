const express = require("express");
const cors = require('cors');
const request = require('request');
const nodemailer = require('nodemailer');

const locations = require('./location.model');
const customerLocations = require('./customerLocations');
const computeResult = require('./result.controller');
const customerResult = require('./customerResult');

require('dotenv/config');

const PORT = process.env.PORT;

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cors());
app.use('/static', express.static(__dirname + '/public'));

app.get('/cotizador/asesor/api', (req, res) => {
    res.json(locations);
})

app.get('/cotizador/cliente/api', (req, res) => {
    res.json(customerLocations);
})

app.get('/asesor/resultado', (req, res) => {
    const result = computeResult(req.query);
    res.render('result', { result: result, query: req.query });
})

app.get('/cliente/resultado', (req, res) => {
    const result = customerResult(req.query);
    res.render('customerResult', { result: result, query: req.query });
})

app.get('/sendmail', (req, res) => {

    const result = customerResult(req.query);

    async function main() {

        let transporter = nodemailer.createTransport({
            host: "mail.inteminer.com",
            port: 26,
            secure: false,
            auth: {
                user: "cotizador@inteminer.com",
                pass: "xKQSt3@!Ex*",
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let info = await transporter.sendMail({
            from: 'cotizador@inteminer.com',
            to: req.query.sendEmail,
            subject: `Cotización de Terreno en ${req.query.location}`,
            html: `
                <h2>Cotización de Terreno en ${req.query.location}</h2>
                <strong>Un nuevo lead utilizó tu cotizador</strong>
                <p>Información de contacto: </p>
                <div>Nombre: ${req.query.name}</div>
                <div>Email: ${req.query.email}</div>
                <div>Teléfono: ${req.query.tel}</div>
                <p>Detalles de la cotización</p>
                <div>Desarrollo: ${req.query.location}</div>
                <div>Tamaño del lote:  ${req.query.squareMeters} m2</div>
                <div>Plazo de financiamiento:  ${req.query.term} años</div>
                <div>Porcentaje de enganche:  ${req.query.downPayment}%</div>
                <br>
                <div>Valor del terreno: ${result.lockedLandPrice}</div>
                <div>Enganche de: ${result.downPayment}</div>
                <div>Saldo Inicial: ${result.initialDebt}</div>
                <br>
            ` ,
        });

        res.json({ message: `Message sent. ID: ${info.messageId}` });
    }
    main().catch(console.error);
})

app.get('/asesor/:id', (req, res) => {
    request(`${process.env.API}/users/${req.params.id}?api_key=${process.env.API_KEY}`, { json: true }, (err, body) => {
        if (err) return console.log(err);

        const user = body.body;

        if (user.role == 'coordinador' || user.role == 'gerente' && user.salesQuoter == true) {
            res.render('index', { title: `Coordinación ${user.first_name} ${user.last_name}`, plaza: user.group });
        } else {
            res.status(405).send('Unauthorized to use this feature');
        }
    })
})

app.get('/cliente/:id', (req, res) => {
    request(`${process.env.API}/users/${req.params.id}?api_key=${process.env.API_KEY}`, { json: true }, (err, body) => {
        if (err) return console.log(err);

        const user = body.body;

        if (user.customerQuoter) {
            res.render('cliente', { user: user });
        } else {
            res.json({ message: 'You do not have access to this feature' });
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
})