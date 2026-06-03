const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users",
    required:[true,"Account must be created"],
    index:true
  },
  status:{
    enum:{
      type:String,
      values:["ACTIVE","FROZEN","CLOSED"]
    }
  },
  currency:{
    type:String,
    required:[true,"currency is required!"],
    default: "INR"
  }
  
  
},{timestams:true})

const accountModel = mongoose.model("Users_account",accountSchema);


module.exports = accountModel;