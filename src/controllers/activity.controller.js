'use strict'

//Controladores que acceden a mongo y traen los datos
const path = require('path')
const libs = require('../services/libs')
const fs = require('fs-extra')
const md5 = require('md5')
const Activity = require('../models/activity')
const Comment = require('../models/comment')
const User = require('../models/user')
const sidebar = require('../services/sidebar')
const serviceActRos = require('../services/activitiesRosario')
const helpers = require('../server/helpers')
// if (typeof localStorage === "undefined" || localStorage === null) {
//     var LocalStorage = require('node-localstorage').LocalStorage;
//     localStorage = new LocalStorage('./scratch');
// }

// Activity Page

async function renderActivity(req, res) {

    let viewModel = { activity: {}, comments: {} }

    let activityID = req.params.id
    // Busco los datos de la actividad que queremos mostrar
    let activity = await Activity.findById(activityID).lean()
    if (!activity) return res.status(404).redirect('/')
    // Busca los comentarios de la actividad que queremos mostrar
    const comments = await Comment.find({ activity: activityID }).lean()
    // Busco el usuario propietario de la actividad
    const user = await User.findById({ _id: activity.user }).lean() // User.find trae un arreglo, User.findById trae un objeto

    // Logica para que se visite 1 vez por usuario
    if (activity.viewedUsers.includes(req.user.id)) { }  // El usuario ya visito la act??
    else {
        // Actualiza vistas en la pagina de la actividad
        let viewedUsers = activity.viewedUsers
        viewedUsers.push(req.user.id);
        const actualViews = activity.views + 1
        await Activity.findByIdAndUpdate(activityID, { views: actualViews, viewedUsers: viewedUsers })
    }

    // La busco denuevo para tener las views actualizadas
    activity = await Activity.findById(activityID).lean()

    viewModel.activity = activity
    viewModel.activityParticipants = activity.registeredUsers.length
    viewModel.comments = comments
    viewModel.user = user
    viewModel.placesAvailable = activity.maxPeople - viewModel.activityParticipants

    const findCat = await serviceActRos.findTag(activity.category)
    viewModel.categoryName = findCat[0].name

    // Pregunto si la actividad ya paso
    if (activity.dFrom < helpers.today()) {
        viewModel.oldActivity = true
    }
    else {
        viewModel.oldActivity = false
    }
    // Pregunto si el usuario logueado es el mismo que el propietario de la actividad, para saber si se activa el boton o no
    if (user._id == req.user.id) {
        viewModel.organizatorUser = true
    }
    else {
        viewModel.organizatorUser = false
    }
    // Pregunto si el usuario logueado ya esta inscripto en esa actividad, para saber si se activa el boton o no
    if (activity.registeredUsers.includes(req.user.id)) {  // El usuario ya esta inscripto??
        viewModel.inscriptedUser = true
    }
    else {
        viewModel.inscriptedUser = false
    }
    // Validar si ya le puso Like
    if (activity.likedUsers.includes(req.user.id)) {
        viewModel.likedUser = true
    }
    else {
        viewModel.likedUser = false
    }
    // Validar si ya denunció
    if (activity.reportedUsers.includes(req.user.id)) {
        viewModel.reportedUser = true
    }
    else {
        viewModel.reportedUser = false
    }
    // Validar si ya denunció
    if (viewModel.placesAvailable <= 0) {
        viewModel.fullActivity = true
    }
    else {
        viewModel.fullActivity = false
    }

    // Entra el viewModel a sidebar, y vuelve con un atributo mas viewModel.sidebar
    viewModel = await sidebar(viewModel)

    res.render('activities/activity', viewModel) // Le paso la actividad encontrado a la vista renderizada

}

async function renderOwnActivities(req, res) {
    const today = helpers.today()
    // Renderiza las actividades del usuario que esta logueado y ordena por fecha
    let activitiesOrganized = await Activity.find({ user: req.user.id }).sort({ dFrom: 'desc' }).lean()   // El lean hace que Handlebars no de error
    // Renderiza las actividades en las que se inscribio el usuario que esta logueado y ordena por fecha
    const activitiesInscript = await Activity.find({ registeredUsers: req.user.id }).sort({ dFrom: 'asc' }).lean()

    activitiesOrganized.forEach(function (element) {
        element.today = today;
    });

    let viewModel = { activitiesOrganized: [] }

    viewModel.activitiesOrganized = activitiesOrganized
    viewModel.activitiesInscript = activitiesInscript
    viewModel.today = today

    res.render('activities/allOwnActivities', viewModel)
}

// CREATE
async function renderNewActivityForm(req, res) {

    const tagsRender = await serviceActRos.allTags('Todas')

    res.render('activities/new-activity', { tagsRender })
}

function createNewActivity(req, res) {
    const cat = req.body.category
    const dateFrom = req.body.dFrom
    const dateTo = req.body.dTo

    if (cat == 99999) {
        req.flash('error_msg', 'Ingresa una categoria')
        return res.redirect('/activities/add')
    } else if (dateTo <= dateFrom) {
        req.flash('error_msg', 'La fecha hasta no puede ser menor o igual a la fecha desde')
        return res.redirect('/activities/add')
    }

    // Imagenes
    const safeImgName = async () => {
        const rdnImgName = libs.randomName()
        const activities = await Activity.find({ pictureFileName: rdnImgName })
        if (activities.length > 0) {
            safeImgName()
        } else {
            const imageTempPath = req.file.path // El path de la imagen es upload/temp  
            const ext = path.extname(req.file.originalname).toLowerCase() // Extrae la extension de la imagen .png .jpg etc
            const targetPath = path.resolve(`src/public/upload/${rdnImgName}${ext}`)

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imageTempPath, targetPath)
            } else {
                req.flash('error_msg', 'Este tipo de archivo no esta permitido')
                await fs.unlink(imageTempPath)
            }

            // Activity
            const { name, description, place, category, maxPeople, dFrom, dTo } = req.body

            const newActivity = new Activity({ name, description, place, category, maxPeople, dFrom, dTo })
            newActivity.pictureFileName = rdnImgName + ext // La imagen es la de la carpeta upload
            newActivity.user = req.user.id
            newActivity.nameMod = libs.eliminarDiacriticos(name)
            await newActivity.save()
            req.flash('success_msg', 'Actividad agregada exitosamente')
            res.redirect('/activities')
        }
    }
    safeImgName()
}

// UPDATE
async function renderEditForm(req, res) {
    console.log("------------########################------------------")
    const activity = await Activity.findById(req.params.id).lean()
    if (activity.user != req.user.id) { // Condicion para que no se edite actividades de otros usuarios
        req.flash('error_msg', 'Usted no esta autorizado para editar esta actividad')
        return res.redirect('/activities')
    }

    const tagsRender = await serviceActRos.allTags(activity.category)
    console.log(activity.category)
    res.render('activities/edit-activity', { activity, tagsRender }) // Le paso el activity encontrado a la vista renderizada
}

async function updateActivity(req, res) {
    const cat = req.body.category
    const dateFrom = req.body.dFrom
    const dateTo = req.body.dTo

    console.log(cat)
    console.log(dateFrom)
    console.log(dateTo)


    if (cat == 99999 || !cat) {
        req.flash('error_msg', 'Ingresa una categoria')
        return res.redirect('/activity/edit/' + req.params.id)
    } else if (dateTo <= dateFrom) {
        req.flash('error_msg', 'La fecha hasta no puede ser menor o igual a la fecha desde')
        return res.redirect('/activity/edit/' + req.params.id)
    }

    const today = helpers.today()

    const { name, description, place, category, maxPeople, dFrom, dTo } = req.body

    if (dFrom > today) {
        console.log("entro aca")
        let registeredUsers = []
        let reportedUsers = []
        let reports = 0
        let banned = false
        await Activity.findByIdAndUpdate(req.params.id, { registeredUsers: registeredUsers, reportedUsers: reportedUsers, reports: reports, banned: banned })
        await Activity.findByIdAndUpdate(req.params.id, { name, description, place, category, maxPeople, dFrom, dTo })
        req.flash('success_msg', 'Actividad actualizada exitosamente')
        res.redirect('/activities')
    }
    else if (dFrom < today || dTo < today) {
        req.flash('error_msg', 'Las fechas deben ser mayores al dia de hoy')
        res.redirect('/activity/edit/' + req.params.id)
    }



    // let activityID = req.params.id
    // let update = req.body

    // Activity.findByIdAndUpdate(activityID, update, (err, activityUpdated) => {
    //     if (err) res.status(500).send({message: `Error al actualizar el activityo: ${err}`})

    //     res.status(200).send({activity: activityUpdated})
    //     })
}

// DELETE
async function deleteActivity(req, res) {
    const activity = await Activity.findById(req.params.id).lean()
    //Elimino tambien la imagen
    await fs.unlink(path.resolve(`./src/public/upload/${activity.pictureFileName}`))
    //Elimino tambien los comentarios
    await Comment.deleteMany({ activity: req.params.id })
    await Activity.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Actividad eliminada exitosamente')
    res.status(200).redirect('/activities')
}

// LIKE
async function like(req, res) {
    let activityID = req.params.id
    const activity = await Activity.findById(activityID).lean()

    // Logica para que se Likee 1 vez por usuario
    if (!activity.likedUsers.includes(req.user.id)) {  // El usuario todavia no le puso like??
        let likedUsers = activity.likedUsers
        likedUsers.push(req.user.id);
        const actualLikes = activity.likes + 1
        await Activity.findByIdAndUpdate(activityID, { likes: actualLikes, likedUsers: likedUsers })
    }
    res.redirect('/activity/' + req.params.id)

    //req.flash('success_msg', 'Like Added succesfully')
    //
}


// REPORT
async function report(req, res) {
    let activityID = req.params.id
    let activity = await Activity.findById(activityID).lean()

    // Logica para que se Likee 1 vez por usuario
    if (!activity.reportedUsers.includes(req.user.id)) {  // El usuario todavia no denuncio??
        let reportedUsers = activity.reportedUsers
        reportedUsers.push(req.user.id);
        const actualReports = activity.reports + 1
        await Activity.findByIdAndUpdate(activityID, { reports: actualReports, reportedUsers: reportedUsers })


        if (actualReports >= 3) {
            await Activity.findByIdAndUpdate(activityID, { banned: true })  // Si tiene tantas denuncias, la actividad es baneada
        }

    }
    res.redirect('/activity/' + req.params.id)

    //req.flash('success_msg', 'Like Added succesfully')
    //
}

// COMMENT
async function comment(req, res) {
    const user = await User.findById(req.user.id).lean()
    let comment = {}
    comment.name = user.name
    comment.email = user.email
    comment.comment = req.body.comment
    const newComment = new Comment(comment)
    newComment.activity = req.params.id
    newComment.gravatar = md5(newComment.email)
    await newComment.save()
    req.flash('success_msg', 'Comentario agregado exitosamente')
    res.redirect('/activity/' + req.params.id)
}

// INSCRIPT
async function inscript(req, res) {
    const activityID = req.params.id
    const activity = await Activity.findById(activityID).lean()

    if (!activity.registeredUsers.includes(req.user.id)) {  // El usuario todavia no esta registrado??
        let registeredUsers = activity.registeredUsers
        registeredUsers.push(req.user.id);
        await Activity.findByIdAndUpdate(activityID, { registeredUsers: registeredUsers })
        req.flash('success_msg', 'Te inscribiste a esta actividad')
    }

    res.redirect('/activity/' + req.params.id)
}

// UNINSCRIPT
async function uninscript(req, res) {
    const activityID = req.params.id
    const activity = await Activity.findById(activityID).lean()

    if (activity.registeredUsers.includes(req.user.id)) {  // El usuario ya esta registrado??
        const index = activity.registeredUsers.indexOf(req.user.id);
        if (index > -1) {
            let registeredUsers = activity.registeredUsers
            registeredUsers.splice(index, 1);
            await Activity.findByIdAndUpdate(activityID, { registeredUsers: registeredUsers })
            req.flash('success_msg', 'Cancelaste tu inscripcion a esta actividad')
        }
    }

    res.redirect('/activity/' + req.params.id)
}


// Next Activities
async function renderUsersActivities(req, res) {

    // Busco fecha de hoy y proxima semana
    const today = helpers.today()
    const todayPlus7 = helpers.datePlus7(today)
    // POST Si hace algun filtro agarra el req.body
    let { dateFrom = today, dateTo = todayPlus7, tag = 'Todas', textFilter = "" } = req.body

    let viewModel = { activities: [] }
    viewModel.dateFrom = dateFrom
    viewModel.dateTo = dateTo

    console.log(dateFrom)
    console.log(dateTo)
    console.log(tag)
    console.log(textFilter)

    textFilter = libs.eliminarDiacriticos(textFilter)

    console.log(textFilter)

    // Actividades disponibles ($gte = greater and equal than)($lte = lower and equal than)
    let activities

    if (dateTo == "") {
        if (tag == 'Todas') {
            if (textFilter == "") {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom) } }).sort({ dFrom: 'asc' }).lean()
            }
            else {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom) }, nameMod: new RegExp(textFilter, 'i') }).sort({ dFrom: 'asc' }).lean()
            }
        }
        else {
            if (textFilter == "") {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom) }, category: tag }).sort({ dFrom: 'asc' }).lean()
            }
            else {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom) }, category: tag, nameMod: new RegExp(textFilter, 'i') }).sort({ dFrom: 'asc' }).lean()
            }
        }
    }
    else {
        if (tag == 'Todas') {
            if (textFilter == "") {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom), $lte: (dateTo) } }).sort({ dFrom: 'asc' }).lean()
            }
            else {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom), $lte: (dateTo) }, nameMod: new RegExp(textFilter, 'i') }).sort({ dFrom: 'asc' }).lean()
            }
        }
        else {
            if (textFilter == "") {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom), $lte: (dateTo) }, category: tag }).sort({ dFrom: 'asc' }).lean()
            }
            else {
                activities = await Activity.find({ dFrom: { $gte: (dateFrom), $lte: (dateTo) }, category: tag, nameMod: new RegExp(textFilter, 'i') }).sort({ dFrom: 'asc' }).lean()
            }
        }
    }
    
    if (activities.length == 0) { viewModel.emptyActivites = true }
    else { viewModel.emptyActivites = false }

    viewModel.activities = activities
    // Esto agrega un atributo con los Stats, Actividades recomendadas y Ultimos comentarios
    viewModel = await sidebar(viewModel)

    viewModel.tagsRender = await serviceActRos.allTags(tag)

    res.render('activities/all-activities', viewModel)
}

// Past Activities
async function renderUsersPastActivities(req, res) {

    const today = helpers.today()

    // Actividades que ya pasaron ($lt = lower than)
    const activitiesPassed = await Activity.find({ dFrom: { $lt: (today) } }).sort({ dFrom: 'desc' }).limit(20).lean()

    let viewModel = { activitiesPassed: [] }

    if (activitiesPassed.length == 0) { viewModel.emptyActivites = true }
    else { viewModel.emptyActivites = false }

    viewModel.activitiesPassed = activitiesPassed
    // Esto agrega un atributo con los Stats, Actividades recomendadas y Ultimos comentarios
    viewModel = await sidebar(viewModel)

    res.render('activities/past-activities', viewModel)
}

//VER DETALLES

async function viewDetails(req, res) {
    const activityID = req.params.id
    const activity = await Activity.findById(activityID).lean()
    let usrsLike = []
    let usrsReg = []
    let usrsReport = []


    for (let i = 0; i <= (activity.likedUsers.length) - 1; i++) {
        let idUser = activity.likedUsers[i]
        let datosUsr = await User.findById(idUser).lean()
        if (datosUsr) {
            usrsLike.push(datosUsr)
        }

    }
    for (let i = 0; i <= (activity.registeredUsers.length) - 1; i++) {
        let idUser = activity.registeredUsers[i]
        let datosUsr = await User.findById(idUser).lean()
        if (datosUsr) {
            usrsReg.push(datosUsr)
        }

    }
    for (let i = 0; i <= (activity.reportedUsers.length) - 1; i++) {
        let idUser = activity.reportedUsers[i]
        let datosUsr = await User.findById(idUser).lean()
        if (datosUsr) {
            usrsReport.push(datosUsr)
        }

    }

    res.render('activities/activity-details', { usrsLike, usrsReg, usrsReport, activity })

}

module.exports = {
    renderNewActivityForm,
    renderEditForm,
    updateActivity,
    deleteActivity,
    renderActivity,
    renderOwnActivities,
    renderUsersActivities,
    renderUsersPastActivities,
    createNewActivity,
    like,
    report,
    comment,
    inscript,
    uninscript,
    viewDetails
}