const JWT = require('jsonwebtoken')
const { ACCESS_TOKEN_SECRET } = require('../config/index')
const { REFRESH_TOKEN_SECRET } = require('../config/index')
const refreshToken = ('../models/toekn')
// const ACCESS_TOKEN_SECRET = 'fe767cf91d06dc9677b580907481629bfb292b9b6bcda7681ae7399c2dee6631146432263500e3cd910ba75b05dcb7dbe966376fd5d6d932cc1497ccc8f9324c'
// const REFRESH_TOKEN_SECRET = 'b5dcaf5352ca79ab76242835069dcea1e83d85a799cef3cc7eadb99a6ebd18ed3922741581621d8b4c97dbaf1729ee5c8bb0f1fc990260edb5adb44f4d36476c'
class JWTServies {
    // sign access token
    static signAccessToken(payload, expiryTime) {
        return JWT.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime })
    }
    // sign refrsh token
    static signRefreshToken(payload, expiryTime) {
        return JWT.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime })
    }
    // verify access token
    static verifyAccessToken(token) {
        return JWT.verify(token, ACCESS_TOKEN_SECRET)
    }
    // verfiy refresh
    static verifyRefreshToken(token) {
        return JWT.verify(token, REFRESH_TOKEN_SECRET)
    }
    // store refresh
    static async storeRefreshToken(token, userId) {
        try {
            const newToken = new refreshToken({
                token: token,
                userId: userId
            })
            // store in db
            await newToken.save();
        } catch (err) {
            console.log(err + "error in token")
        }
    }
}
module.exports = JWTServies