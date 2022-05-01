// Registro y autenticacion de usuarios

'use string'

const mongoose = require('mongoose')
const User = require('../models/user')
const passport = require('passport')
const md5 = require('md5')
const libs = require('../services/libs')
const bcrypt = require('../services/bcrypt')
//const service = require('../services')

function is_numeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/* ************************* TUTORIAL FAZT ************************* */
//Sign Out
function renderSignUpForm(req, res) {
    res.render('users/signup')
}

async function signUp(req, res) {  //Registra usuarios
    const errors = []
    const { name, email, tel, password, confirm_password } = req.body
    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden' }) // Le setea un objeto con propiedad text y valor 'Pass...'
    }
    if (password.length < 4) {
        errors.push({ text: 'La contraseña tiene que tener al menos 4 caracteres' })
    }
    if (!is_numeric(tel)) {
        errors.push({ text: 'El telefono debe ser numerico' })
    }
    if (errors.length > 0) {
        res.render('users/signup', { errors, name, email, tel }) //Le envia la lista de errores, el nombre y email (por si se equivoca) a la vista hbs
    }
    else {
        const emailUser = await User.findOne({ email: email })
        if (emailUser) {
            errors.push({ text: 'El email ya está en uso' })
            res.render('users/signup', { errors, name, email, tel })
        }
        else {
            const newUser = new User({ name, email, tel, password })
            newUser.password = await newUser.encryptPassword(password)
            newUser.gravatar = md5(newUser.email)
            newUser.save()

            //res.status(200).send({token: service.createToken(newUser)})
            req.flash('success_msg', 'Usuario registrado exitosamente')
            res.redirect('/signup/verify-account/' + newUser._id)
        }
    }
}

// Pre Verify Account
async function preVerifyAccount(req, res) {

    res.render('users/pre-verify-account')
}

// Verify Account
async function verifyAccount(req, res) {
    let userID
    let userEmail
    let user

    if (req.params.id) {
        userID = req.params.id
        user = await User.findById(userID).lean()
    } else if (req.body.verifyEmail) {
        userEmail = req.body.verifyEmail
        user = await User.findOne({ email: userEmail }).lean()
    }

    if (user) {
        if (user.verified) {
            req.flash('success_msg', 'El usuario ya esta verificado')
            res.redirect('/signin')
        } else {
            const rdnImgName = libs.randomName()
            userID = user._id
            user.verifyCode = rdnImgName
            await User.findByIdAndUpdate(userID, { verifyCode: user.verifyCode })
            res.render('users/verify-account', { user })
        }
    } else {
        req.flash('error_msg', 'El usuario no existe')
        res.redirect('/signup/pre-verify-account')
    }
}

// Verify Code
async function verifyAccountCode(req, res) {
    const userID = req.params.id
    const { verifyCode } = req.body
    const user = await User.findById(userID).lean()

    if (user.verifyCode == verifyCode) {
        user.verified = true
        await User.findByIdAndUpdate(userID, { verified: user.verified })
        req.flash('success_msg', 'Usuario verificado exitosamente')
        res.redirect('/signin')
    } else {
        req.flash('error_msg', 'Codigo incorrecto')
        res.redirect('/signup/verify-account/' + userID)
    }
}

//Sign In
function renderSignInForm(req, res) {
    res.render('users/signin')
}

//Forgotten Password
async function forgottenPassword(req, res) {

    let userEmail
    let user

    if (req.body.verifyEmail) {
        userEmail = req.body.verifyEmail
        user = await User.findOne({ email: userEmail }).lean()
        if (user) {
            const rdnImgName = libs.randomName()
            userID = user._id
            user.recoverCode = rdnImgName
            await User.findByIdAndUpdate(userID, { recoverCode: user.recoverCode })
            res.render('users/send-passwordcode', { user })
        } else {
            req.flash('error_msg', 'El usuario no existe')
            res.redirect('/signin/forgotten-password')
        }
    } else {
        res.render('users/forgotten-password')
    }
}

//Verify Recover Code
async function verifyRecoverCode(req, res) {

    const userID = req.params.id
    const { recoverCode } = req.body
    console.log(recoverCode)
    const user = await User.findById(userID).lean()
    console.log(user.recoverCode)

    if (user.recoverCode == recoverCode) {
        user.password = ''
        await User.findByIdAndUpdate(userID, { password: user.password })
        res.render('users/enter-new-password', { user })
    } else {
        req.flash('error_msg', 'Codigo incorrecto')
        res.redirect('/signin/forgotten-password/' + userID)
    }
}

//Recover Passoword
async function recoverPassword(req, res) {

    const userID = req.params.id
    const { recoverPassword } = req.body

    if (recoverPassword.length < 4) {
        req.flash('error_msg', 'La contraseña debe tener al menos 4 caracteres')
        res.redirect('/signin/forgotten-password/' + userID)
    } else {
        const user = await User.findById(userID).lean()
        user.password = await bcrypt.encryptPassword(recoverPassword)
        await User.findByIdAndUpdate(userID, { password: user.password })
        req.flash('success_msg', 'Contraseña recuperada exitosamente')
        res.redirect('/signin')
    }




}

// function signIn((passport.authenticate('local', {    //Ya se ha registrado, quiere acceder denuevo
//     failureRedirect: '/signin',
//     successRedirect: '/products',
//     failureFlash: true
// })))

function logOut(req, res) {
    req.logOut() //Funicion de passport para eliminar al usuario de la sesion
    req.flash('success_msg', 'Deslogueado exitosamente')
    res.redirect('/signin')
}

/* ************************* TUTORIAL CARLOS AZAUSTRE  ************************* */
// function singUp(req, res) {  //Registra usuarios
//     const user = new User({
//         email: req.body.email, // req.body o cuerpo de la peticion es el dato que te estan enviando en el post
//         displayName: req.body.displayName
//     })

//     user.save((err) => {
//         if (err) res.status(500).send({ message: `Error al crear el usuario ${err}`})

//         return res.status(200).send({ message: 'Usuario creado correctamente', token: service.createToken(user)})
//     })
// }

// function singIn(req ,res) { //Ya se ha registrado, quiere acceder denuevo
//     User.find( {email: req.body.email}, (err, user) =>{
//         if (err) return res.status(500).send({ message: `Error al ingresar: ${err}`})
//         if (!user) return res.status(404).send({ message: 'No existe el usuario'})

//         req.user = user 
//         res.status(200).send({ 
//             token: service.createToken(user), 
//             message: 'Logueo correcto'
//         })

//     })
// }

module.exports = {
    renderSignUpForm,
    signUp,
    renderSignInForm,
    //signIn,
    logOut,
    preVerifyAccount,
    verifyAccount,
    verifyAccountCode,
    forgottenPassword,
    verifyRecoverCode,
    recoverPassword
}