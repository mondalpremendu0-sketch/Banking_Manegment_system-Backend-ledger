require('dotenv').config();
const app = require('./src/app.js');
const connect_to_Db = require('./src/db/db.js')




app.listen(3000,async() => {
  await connect_to_Db();
  console.log("Server is running port 3000");
})