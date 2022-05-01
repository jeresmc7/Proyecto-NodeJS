//Conexiones
module.exports = {
    port: process.env.PORT || 4000,
    db: process.env.MONGODB_URI || 'mongodb://localhost:27017/App',
    SECRET_TOKEN: 'miclavedetoken'
}

// mongodb+srv://jeresmc7:1234@cluster0.9xkjp.mongodb.net/Shop?retryWrites=true&w=majority

// mongodb+srv://jeresmc7:1234@cluster0.9xkjp.mongodb.net/test

// heroku config:set MONGODB_URL = mongodb+srv://jeresmc7:1234@cluster0-vvh5f.mongodb.net/test?retryWrites=true&w=majority