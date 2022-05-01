// Servicios creados por nosotros

// 'use string'

// const jwt = require('jwt-simple') //Libreria jsonWebToken
// const moment = require('moment')
// const config = require('../config')

// function createToken (user) {
//     const payload = {  //datos del usuario que viajan con el navegador
//         sub: user._id,
//         iat: moment().unix, //cuando fue creado el token //con libreria moment
//         exp: moment().add(30, 'days').unix, //cuando expira.. caduca en 30 dias
//     }

//     return jwt.encode(payload, config.SECRET_TOKEN)
// }

// function decodeToken(token) {
//     const decoded = new Promise((resolve, reject) => {
//         try {
//            const payload = jwt.decode(token, config.SECRET_TOKEN) 
        
//            if (payload.exp <= moment().unix()) {
//                 reject({
//                     status: 401,
//                     message: 'El token ha expirado'
//                 })
//             }

//             resolve(payload.sub) //El usuario es ese que tiene el _id

//         } catch (err) {
//             reject({
//                 status: 500,
//                 message: 'Invalid Token'
//             })
//         }
//     })

//     return decoded
// }

module.exports = {
    createToken
    //,decodeToken
} 