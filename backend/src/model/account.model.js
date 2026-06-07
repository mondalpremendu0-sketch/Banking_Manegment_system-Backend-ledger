const mongoose = require('mongoose');
const Ledger = require('./ledger.model.js')

const accountSchema = new mongoose.Schema({
  account:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users",
    required:[true,"Account must be created"],
    index:true
  },
  status:{
    type:String,
    enum:{
      values:["ACTIVE","FROZEN","CLOSED"],
    },
    default: "ACTIVE"
  },
  currency:{
    type:String,
    required:[true,"currency is required!"],
    default: "INR"
  }
  
},{timestamps:true});

accountSchema.index({account:1, status:1})

accountSchema.methods.getBalance  = async function() 
{
  const balanceData = await Ledger.aggregate([
  //const accountId = this._id;
    {
      $match: {
        accountId: this._id
      }
    },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0]
          }
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, 
            "$amount", 
            0]
          }
        }
      }
    },
    {
      $project:{
        _id:0,
        balance:
        {
          $subtract:[
            "$totalCredit",
            "$totalDebit"
          ]
          
        }
      }
    }
])
  if (!balanceData.length) return 0;

  return balanceData[0].balance;
};




const accountModel = mongoose.model("Users_account",accountSchema);


module.exports = accountModel;