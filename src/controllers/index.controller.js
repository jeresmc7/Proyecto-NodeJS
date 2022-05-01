const IndexCtrl = {}
const Activity = require('../models/activity')
const sidebar = require('../services/sidebar')

IndexCtrl.renderIndex = async (req, res) => {
    const activities = await Activity.find().sort({createdAt: 'desc'}).lean()
    
    let viewModel = {activities: []}
    viewModel.activities = activities
    viewModel = await sidebar(viewModel)


    console.log(req.user)

    res.render('index',  viewModel )
}

IndexCtrl.renderAbout = (req, res) => {
    res.render('about')
}

IndexCtrl.renderTests = (req, res) => {
    res.render('tests')
}

module.exports = IndexCtrl