const Stats = require('./stats')
const Activities = require('./activities')
const Comments = require('./comments')


// Esto es una funcion que agarra como parametro un viewModel y le mete adentro los valores
module.exports = async (viewModel) => {

    const results = await Promise.all([
        Stats(), //Stats es una funcion en si misma // Retorna un objeto {activities: n, views: n, likes: n, comments: n}
        Activities.popular(), // Retorna un objeto con las 9 actividades mas likeadas
        Comments.newest() // Retorna los 5 comentarios mas nuevos y le agrega un atributo con su objeto Actividad
    ])

    viewModel.sidebar = {
        stats: results[0],
        popular: results[1],
        comments: results[2]
    }

    return viewModel
    
}