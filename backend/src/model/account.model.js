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
      values:["ACTIVE","FROZEN","CLOSED"],
      default: "ACTIVE"
    }
  },
  currency:{
    type:String,
    required:[true,"currency is required!"],
    default: "INR"
  }
  
  
},{timestams:true});

accountSchema.index({account:1, status:1})

const accountModel = mongoose.model("Users_account",accountSchema);


module.exports = accountModel;