const jwt = require("jsonwebtoken");
require('dotenv').config()

function signJwt(data){
    try{
        const payload = {
            student_id: data.student_id,
            teacher_id: data.teacher_id,
            username: data.username || data.teacher_username,
            email: data.email || data.teacher_email,
            master_role_id: data.master_role_id,
            organization_id: data.organization_id,
        };
        const signedData = jwt.sign(payload, process.env.ENCRYPTION_SECRET_KEY, { expiresIn: '7d' })
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