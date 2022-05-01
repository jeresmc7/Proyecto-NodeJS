// Se encarga de mantener en sesion al usuario
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

passport.use(new LocalStrategy({
    usernameField: 'email', //desde mi vista signin tengo un campo email y password
    passwordField: 'password'
}, async (email, password, done) => {
    //Match Email
    const user = await User.findOne({ email })
    if (!user) {
        return done(null, false, { message: 'El usuario no existe' }) //error partial
    }
    else {
        if (user.verified) {
            //Match Password
            const match = await user.matchPassword(password)
            if (match) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: 'Contraseña incorrecta' })
            }
        } else {
            return done(null, false, { message: 'El usuario no esta verificado' }) //error partial
        }
    }
}))

passport.serializeUser((user, done) => {    //Guarda el usuario en sesion
    done(null, user.id)
})

passport.deserializeUser((id, done) => {    //Este ID tiene autorizacion???
    User.findById(id, (err, user) => {
        done(err, user)
    })
})