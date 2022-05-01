const bcrypt = require('bcryptjs') //Libreria de HASH para password (bcrypt-nodejs)

// HASH
async function encryptPassword (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt)
}


module.exports = {
    encryptPassword
}