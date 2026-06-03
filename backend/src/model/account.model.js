const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users",
    index:true
  },
  status:{
    enum:{
      type:String,
      values:["ACTIVE","FROZEN","CLOSED"]
    }
  },
  
  
},{timestams:true})

const accountModel = mongoose.model("Users_account",accountSchema);


module.exports = accountModel;