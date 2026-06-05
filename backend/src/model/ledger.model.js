import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
      immutable:true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users_account",
      required: true,
      index: true,
      immutable:true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      immutable:true,
    },
    Type:{
      type:String,
      enum:["DEBITED","CREATED"],
      required:true,
      index:true,
      immutable:true
    }
  },
  {
    timestamps: true,
  }
);


function preventLedgerModification() {
  throw new Error("Any content can't be modified!!");
}

// Block all Update, Replace, and Delete operations
const blockedMethods = [
  'updateOne', 
  'updateMany', 
  'findOneAndUpdate', 
  'findOneAndReplace',
  'replaceOne',
  'deleteOne', 
  'deleteMany', 
  'findOneAndDelete',
  'bulkWrite'
];

// Attach the prevention function to every blocked method
blockedMethods.forEach(method => {
  ledgerSchema.pre(method, preventLedgerModification);
});

const Ledger = mongoose.model('Ledger', ledgerSchema);
const ledgerModel = mongoose.model("Ledger", ledgerSchema);


module.exports = ledgerModel;