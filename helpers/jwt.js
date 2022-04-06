require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY_JWT;
const resetKey = process.env.JWT_RESET_KEY

// function untuk membuat token pada saat signin
function generateToken(dataUser = {}) {
    let token = jwt.sign(dataUser, secretKey);
    return token;
};

// function untuk mendapatkan data user dari bentuk token
function getUserData(token) {
    let decoded = jwt.verify(token, secretKey);
    return decoded;
};

// function untuk reset password
function resetPassword(token){
    let reset = jwt.verify(token, resetKey)
    return reset;
}

module.exports = { generateToken, getUserData, resetPassword };