'use strict'

//Funcionalidad de express

const methodOverride = require('method-override') //Para poner el metodo en el HTML
const express = require('express')  // Framework de NodeJS que permite crear servidores
                                    // Ayuda a escribir JS del lado del servidor
const hbs = require('express-handlebars') //Vincula express con el motor de plantillas
const flash = require('connect-flash') // Para mostrar mensajes de OK y Error
const session = require('express-session') // Mensajes entre paginas
const path = require('path')
const passport = require('passport') //Para mantener la sesion iniciada
const multer = require('multer') // Para subir imagenes
//const { helpers } = require('handlebars')

//Initialization
const app = express()
require('../services/passport')

//Middleware
app.use(express.urlencoded({extended: false})) // convierte los datos en formato json
app.use(express.json()) //Para que express entienda los objetos json
//app.use(morgan('dev')) // Muestra en consola info de la ruta
app.use(multer({dest: path.join(__dirname, '../public/upload/temp')}).single('image')) //Cuando se suba una imagen lo va a colocar aca, lo agarra del form con nombre image
                                                                                       // El single agarra 1 sola imagen y pone caracteristicas de imagen
app.use(methodOverride('_method'))
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(express.static('public'));

//Settings
app.set('views', path.join(__dirname, '../views'))
app.engine('.hbs', hbs({        // Motor de plantillas HTML
    defaultLayout: 'main',   //
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./helpers')
}))
app.set('view engine', '.hbs')

//Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null // Passport guarda el usuario logueado en la variable user
    next()
})

//Routes
app.use(require('../routes/index.routes'))
app.use(require('../routes/activities.routes'))
app.use(require('../routes/users.routes'))

/*
app.all('/user', (req,res) {
    console.log('aca termina /user')
}) --> para todas las rutas llamadas /user, van a tener que pasar primero por .all

app.all('/user', (req,res, next) {
    console.log('aca empieza /user y sigue con la siguiente')
    next()
}) --> para todas las rutas llamadas /user, van a tener que pasar primero por .all y luego continua con otra (por ej. app.get('/user')
*/

// Static Files 
    // Aqui esta la carpeta public
app.use('/public', express.static(path.join(__dirname, '../public')))

module.exports = app

// untilitsg()N3 
// heroku login
// git add .
// heroku git:remote -a proyecto-nodejs-mongodb
// git commit -m 'preparing to Heroku'
// heroku logs
// git push heroku master