//Un middleWare es un manejador de peticion antes de que lleguen a su ruta original

'use strict'

//const services = require('../services')

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { // Funcion de passport que pregunta si el usuario esta en sesion
        return next()
    }
    req.flash('error_msg', 'Es necesario loguearse para continuar')
    res.redirect('/signin')
}



// function isAuth (req, res, next) {  //Si no existe esa cabecera, no tenes autorizacion
//     if (!req.headers.authorization) {
//         return res.status(403).send({ message: 'No tienes autorizacion'})
//     }

//     const token = req.headers.authorization.split(" ")[1] //desglose peater token en array

//     services.decodeToken(token)
//         .then(response => {
//             req.user = response
//             next()
//         })
//         .catch(response => {
//             res.status(response.satus)
//         })
// }

module.exports = {
    isAuthenticated
}

