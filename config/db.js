const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MOONGO_URL);
        console.log(`MongoDB Connencted:${conn.connection.host}`);

    } catch (error) {
        console.log(error);
        process.exit(0);
    }
}
module.exports = connectDb