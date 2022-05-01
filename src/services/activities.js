const Activity = require('../models/activity')

async function popular() {
    const activities = await Activity.find().limit(9).sort({likes: 'desc'}).lean()
    return activities
}

module.exports = {
    popular
}