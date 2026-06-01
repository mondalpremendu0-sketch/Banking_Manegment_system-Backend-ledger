require('dotenv').config();
const mongoose = require("mongoose");

// Ideally, pull this from your .env.test file
const TEST_DB_URI = process.env.TEST_DB_URI;

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(TEST_DB_URI);
    }
};

const clearDB = async () => {
    // This dynamically clears all collections so you don't have to specify User.deleteMany()
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

const closeDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        //await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    }
};

module.exports = { connectDB, clearDB, closeDB };