const mongoose = require('mongoose')

const { Schema } = mongoose

const refreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId, ref: 'User'
    }
},
    { timeStamps: true }
)

module.exports = mongoose.model("refreshToken", refreshTokenSchema, 'toekns')