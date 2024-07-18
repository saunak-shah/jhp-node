var bcrypt = require('bcrypt');

export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (insertedPassword, reqPassword) => {
    return bcrypt.compareSync(reqPassword, insertedPassword);
};