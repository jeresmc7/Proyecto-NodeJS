const express = require('express')
const app = express.Router() //Enrutador
const UserCtrl = require('../controllers/user.controller')
const passport = require('passport')

// Sign Up
app.get('/signup', UserCtrl.renderSignUpForm)
app.post('/signup', UserCtrl.signUp)

//Emails
app.get('/signup/verify-account/:id?', UserCtrl.verifyAccount)
app.post('/signup/verify-account/:id?', UserCtrl.verifyAccount)

app.get('/signup/pre-verify-account', UserCtrl.preVerifyAccount)

app.post('/signup/verify-account/:id/:code', UserCtrl.verifyAccountCode)

// Sign In
app.get('/signin', UserCtrl.renderSignInForm)

app.post('/signin', passport.authenticate('local', {    //Ya se ha registrado, quiere acceder denuevo
        failureRedirect: '/signin',
        successRedirect: '/',
        failureFlash: true
    }))

app.get('/signin/forgotten-password/:id?', UserCtrl.forgottenPassword) 
app.post('/signin/forgotten-password/:id?', UserCtrl.forgottenPassword) 

app.post('/signin/new-password/:id', UserCtrl.verifyRecoverCode) 

app.post('/signin/recover-password/:id', UserCtrl.recoverPassword) 


// LogOut
app.get('/logout', UserCtrl.logOut)

module.exports = app