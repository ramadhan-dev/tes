const express = require("express");

const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const cors = require("./src/utility/cors");
const helmetConfig = require("./src/utility/helmet");
const routes = require('./src/routes');
const app = express();

app.use(cors.create())
app.use(helmetConfig)

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

//Request Rate Limit Implementation
const Limiter = rateLimit({
    windowMs:  60 * 1000,
    max: 100,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Rate limit exceeded. Please try again later."
        });
    }
});
app.use(Limiter);


app.use(routes);


app.use('*', (req, res) => {
    res.status(404).json({ message: "Fail", data: "Route Not Found" });
});

module.exports = app;
