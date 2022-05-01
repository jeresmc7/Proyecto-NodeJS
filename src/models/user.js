'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs') //Libreria de HASH para password (bcrypt-nodejs)

const UserSchema = Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    tel: { type: String, required: true },
    //displayname: String,
    //avatar: String,
    password: { type: String, required: true }, //con select false no te muestra la contrasena con el get
    //signupDate: { type: Date , default: Date.now},
    //lastLogin: Date
    gravatar: String,
    verified: { type: Boolean, default: false },
    verifyCode: { type: String },
    recoverCode: { type: String }
}, {
    timestamps: true
})

//Funciones que se ejecutan antes o despues de que se almacene en la BD

// HASH
UserSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt)
}

UserSchema.methods.matchPassword = async function (password) {
    console.log(password + " " + this.password) //Devuelve true or false si la contra es correcta
    return await bcrypt.compare(password, this.password)
}

/*
UserSchema.pre('save', function(next) { //Aca no se usa arrow func porque sino tira error
    let user = this
    if (!user.isModified('password')) return next()

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next()

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err)

            user.password = hash
            next()
        })
    })
})
*/

/* <script>
    function sendEmail(event) {
        event.preventDefault()
        Email.send({
            Host: "smtp.gmail.com",
            Username: "rosarioactivaproyecto@gmail.com",
            Password: "rosactproy1234",
            To: document.getElementById('email').value,
            From: "rosarioactivaproyecto@gmail.com",
            Subject: "Contraseña",
            Body: "Tu contraseña es: " + document.getElementById('password').value
        }).then(function (response) {
            if (response == 'OK') {
                alert('Se ha enviado un mail con tu contraseña')
            } else {
                throw new Error("Error: " + response.statusText)
            }
        });
    }
</script> */
module.exports = mongoose.model('User', UserSchema)