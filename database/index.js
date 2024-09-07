const mongoose = require('mongoose');
const { MONGODB_CONNECTION_STRING } = require('../config/index')
// const connectionString = 'mongodb+srv://admin:admin@cluster0.2hdhzq9.mongodb.net/crypto-coin';

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_CONNECTION_STRING)
        console.log(`Database connected to host ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
    }
}
module.exports = dbConnect