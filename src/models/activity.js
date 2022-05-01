'use strict'

const mongoose = require('mongoose')
const path = require('path')
const Schema = mongoose.Schema

const ActivitySchema = Schema({
    name: String,
    nameMod: String,
    pictureFileName: String,
    place: { type: String, default: "No especificado"},
    category: { type: Number },     // Agarra el codigo de Models Tags
    description: String,
    user: { type: String, required: true},
    registeredUsers: [],
    dFrom: { type: String, required: true},
    dTo: { type: String, required: true},
    maxPeople: { type: Number, default: 0, required: true },
    views: { type: Number, default: 0 },
    viewedUsers: [],
    likes: { type: Number, default: 0 },
    likedUsers: [],
    reports: { type: Number, default: 0 },
    reportedUsers: [],
    banned: { type: Boolean, default: false },
}, {
    timestamps: true
})

// Variable Virtual no se almacena en BD -- esto le saca la extension al nombre de la foto
ActivitySchema.virtual('uniquePictureId')
    .get(function() {
        return this.pictureFileName.replace(path.extname(this.pictureFileName))
    })

module.exports = mongoose.model('activity', ActivitySchema)