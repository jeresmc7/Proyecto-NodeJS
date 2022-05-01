const Comment = require('../models/comment')
const Activity = require('../models/activity')

async function newest() {
    const comments = await Comment.find().limit(5).sort({ createdAt: 'desc' }).lean()
    for (const comment of comments) {
        const activity = await Activity.findOne({_id: comment.activity}).lean() //agarra el activity que pertenece al comentario
        comment.activityObjet = activity
    }

    return comments
}

module.exports = {
    newest
}