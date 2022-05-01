const Comment = require('../models/comment')
const Activity = require('../models/activity')
const helpers = require('../server/helpers')

async function activityCounter() {
    const today = helpers.today()
    return await Activity.countDocuments({dFrom: { $gte: (today) }})  // Cuenta la cantidad de actividades disponibles que hay en la coleccion
}

async function activityPastCounter() {
    const today = helpers.today()
    return await Activity.countDocuments({ dFrom: { $lt: (today) } })  // Cuenta la cantidad de actividades pasadas que hay en la coleccion
}

async function activityTotalViewsCounter() {
    const result = await Activity.aggregate([{
        $group: {
            _id: '1',
            viewsTotal: {$sum: '$views'}
        }
    }])
    return result[0].viewsTotal //Result es un arreglo con [{_id: '1', viewsTotal: n}]
}

async function activityTotalLikesCounter() {
    const result = await Activity.aggregate([{
        $group: {
            _id: '1',
            likesTotal: {$sum: '$likes'}
        }
    }])
    return result[0].likesTotal
}

async function commentCounter() {
    return await Comment.countDocuments()
}

// Las funciones se van a ejecutar al mismo tiempo
// Esto va a retornar un arreglo con los resultados ej. [5,4,10,6]
module.exports = async () =>  {

    const results = await Promise.all([
        activityCounter(),
        activityTotalViewsCounter(),
        activityTotalLikesCounter(),
        commentCounter(),
        activityPastCounter()
    ])

    return {    //vamos a devolver un objeto con estas propiedades
        activities: results[0],
        views: results[1],
        likes: results[2],
        comments: results[3],
        activitiesPast: results[4]
    }
    
}