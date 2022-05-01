const mongoose = require('mongoose')
const path = require('path')
const Schema = mongoose.Schema

const TagSchema = Schema({
    id: { type: Number, required: true},
    name: { type: String, required: true},
    count: { type: Number, default: 0}
}, {
    timestamps: true
})

module.exports = mongoose.model('TagActivitiesRosario', TagSchema)