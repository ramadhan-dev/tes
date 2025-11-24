const express = require('express');
const app = express();

const SpacesRoute = require('../modules/spaces/routes/SpacesRoute')



// const {verifyToken} = require('./../middleware/AuthMiddleware')
// app.use(verifyToken);

app.use('/api/v1/spaces', SpacesRoute);




module.exports = app;
