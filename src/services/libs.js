// Aca se crean funciones que sirven para el proyecto

function randomName() {
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let randomImgName = 0
    for (let i = 0; i<7; i++) {
        randomImgName += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return randomImgName
}

// Elimina los diacríticos de un texto (ES6)
//
function eliminarDiacriticos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
}

module.exports = {
    randomName,
    eliminarDiacriticos
}