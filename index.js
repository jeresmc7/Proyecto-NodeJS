'use strict'

//Pide toda la informacion
//const dotenv = require('dotenv').config() // Variables de entorno
const mongoose = require('mongoose') //Driver de Conexion, para conectarse y modelar datos
const app = require('./src/server/app')
const config = require('./src/server/config')

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://jeresmc7:1234@cluster0.9xkjp.mongodb.net/Proyecto?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify: false
  }
  
  //Este tipo de codigo se llama codigo ASINCRONO... (err,res) se llama callback, es una funcion que se ejecuta luego de realizar la accion
  mongoose.connect(config.db, options, (err,res) => {
    if(err) {return console.log(`Error al conectar a la BD: ${err}`)}
    
    console.log(`Conexión a la base de datos establecida ${config.db}`)
  
    app.listen(config.port, () => {
      console.log(`API REST corriendo en http://localhost:${config.port}`)
    })
  })