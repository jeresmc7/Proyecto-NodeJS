const express = require('express')
const app = express.Router() //Enrutador
const ActivityCtrl = require('../controllers/activity.controller')
const ActivityRosarioCtrl = require('../controllers/activityRosario.controller')
const auth = require('../middlewares/auth')

/* ************************************************************** ACTIVIDADES DE LA MUNICIPALIDAD ************************************************************** */

//Search Acts
app.post('/activities-rosario/all' , ActivityRosarioCtrl.renderActivitiesRosario)

//Get All Activities
app.get('/activities-rosario/all/:page?' ,ActivityRosarioCtrl.renderActivitiesRosario) 

app.get('/activities-rosario/activity', ActivityRosarioCtrl.renderActivityRosario)

app.get('/mercados-y-ferias', ActivityRosarioCtrl.renderMercados)


/* ************************************************************** ACTIVIDADES DE USUARIOS ************************************************************** */
//New Activity
app.get('/activities/add', auth.isAuthenticated, ActivityCtrl.renderNewActivityForm)
app.post('/activities/new-activity', auth.isAuthenticated, ActivityCtrl.createNewActivity)

//Get Activity
app.get('/activity/:id', auth.isAuthenticated, ActivityCtrl.renderActivity) //api.get('/activity', auth, ActivityCtrl.getActivities) 
//si agregas el auth, tenes que estar logueado para realizar esa accion             //Enviar datos para almacenar en el servidor, viajan en el cuerpo del mensaje

// Edit Activity
app.get('/activity/edit/:id', auth.isAuthenticated, ActivityCtrl.renderEditForm) // :id es un req.params o parametro de la peticion
app.put('/activity/edit/:id', auth.isAuthenticated, ActivityCtrl.updateActivity)  //Indicar actualizacion de un recurso en el servidor

// Delete activities
app.delete('/activity/delete/:id', auth.isAuthenticated, ActivityCtrl.deleteActivity) //Peticion desde el cliente para borrar un recurso en la BD

// Like
app.post('/activity/:id/like', auth.isAuthenticated, ActivityCtrl.like)

// Report
app.post('/activity/:id/report', auth.isAuthenticated, ActivityCtrl.report)

// Comentarios
app.post('/activity/:id/comment', auth.isAuthenticated, ActivityCtrl.comment)

// Inscripcion a una act
app.post('/activity/:id/inscript', auth.isAuthenticated, ActivityCtrl.inscript)

// Desinscripcion a una act
app.post('/activity/:id/uninscript', auth.isAuthenticated, ActivityCtrl.uninscript)

//Get All Activities
app.get('/activities', auth.isAuthenticated, ActivityCtrl.renderOwnActivities)  //Pedir datos al servidor, el servidor responde al navegador con los datos         

app.get('/activities-users/all', auth.isAuthenticated, ActivityCtrl.renderUsersActivities)
app.post('/activities-users/all', auth.isAuthenticated, ActivityCtrl.renderUsersActivities)     

app.get('/activities-users/past', auth.isAuthenticated, ActivityCtrl.renderUsersPastActivities) 

app.get('/activity/:id/details', auth.isAuthenticated, ActivityCtrl.viewDetails) //Detalles de la actividad (solo p el organizador)


module.exports = app