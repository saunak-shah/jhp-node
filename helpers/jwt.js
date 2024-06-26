const jwt = require("jsonwebtoken");
require('dotenv').config()

function signJwt(data){
    try{
        const signedData = jwt.sign(data, process.env.ENCRYPTION_SECRET_KEY)
        return signedData
    } catch(error) {
        console.error(error);
    }
    return
}

function verifyJwt(token){
    try{
        const signedData = jwt.verify(token, process.env.ENCRYPTION_SECRET_KEY)
        return signedData
    } catch(error) {
        console.error(error);
    }
    return
}

module.exports = {
    signJwt,
    verifyJwt
}