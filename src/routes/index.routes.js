'use strict'

const express = require('express')
const IndexCtrl = require('../controllers/index.controller')
const auth = require('../middlewares/auth')
const app = express.Router() //Enrutador

//Escuchas o peticiones
app.get('/', IndexCtrl.renderIndex)  

app.get('/about', IndexCtrl.renderAbout)  //Cuando entres a la ruta /about, renderiza about.hbs

app.get('/test', IndexCtrl.renderTests)

app.get('/private', auth.isAuthenticated, (req, res) => {
    res.status(200).redirect('/activities')
})

module.exports = app


//jwt.io json web TOKEN