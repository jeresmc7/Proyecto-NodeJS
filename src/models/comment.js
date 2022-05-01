'use strict'

const mongoose = require('mongoose')
const path = require('path')
const Schema = mongoose.Schema

const CommentSchema = Schema({
    name: String,
    email: String,
    comment: String,
    activity: { type: String, required: true},
    gravatar: String
}, {
    timestamps: true
})


// Creo una propiedad virtual para guardar el activity al que pertenece el comentario
CommentSchema.virtual('activityObjet')
    .set(function(activityObjet) {
        this._activityObjet = activityObjet
    })
    .get(function() {
        return this._activityObjet
    })

module.exports = mongoose.model('Comment', CommentSchema)