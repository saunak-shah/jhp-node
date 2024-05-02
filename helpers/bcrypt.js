var bcrypt = require('bcrypt');

const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const isValidPassword = (insertedPassword, reqPassword) => {
    return bcrypt.compareSync(reqPassword, insertedPassword);
};

module.exports = {
    createHash,
    isValidPassword
}