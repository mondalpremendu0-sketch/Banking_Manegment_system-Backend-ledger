const mongoose = require('mongoose');


async function connect_to_Db() {
  
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to Db successfully");
    })
    .catch((error) => {
      console.error('Database Error', error);
      process.exit(1)
    })
}

module.exports = connect_to_Db;