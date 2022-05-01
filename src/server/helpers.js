const moment = require('moment') 
const Handlebars = require('handlebars');
const fetch = require("node-fetch");

//************************************/

function susOne(page) { return (parseInt(page) - 1) }
function addOne(page) { return (parseInt(page) + 1) }

function timeAgo(createdAt) {
    return moment(createdAt).startOf('minute').fromNow() // Ver como pasarlo al español
}

function today() {
    moment.locale('es')
    return moment().format('YYYY-MM-DD')
}

function datePlus7(date) {
    moment.locale('es')
    return moment(date).add(7, 'days').format('YYYY-MM-DD');
}

function datePlus1(date) {
    moment.locale('es')
    return moment(date).add(1, 'days').format('YYYY-MM-DD');
}

function format(date) {
    moment.locale('es')

    if (moment(date).format('HH:mm') == '00:00') {
        return moment(date).format('DD MMM [Todo el día]')
    }

    return moment(date).format('DD MMM HH:mm[hs]')
}

function format2(date) {
    moment.locale('es')

    return moment(date).format('DD MMM HH:mm[hs]')
}

function userEmail(user) {
    console.log(user)

    return user.email
}

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {  //{{#ifCond var1 '==' var2}}

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

module.exports = {
    timeAgo,
    today,
    datePlus7,
    datePlus1,
    format,
    format2,
    susOne,
    addOne,
    userEmail
}