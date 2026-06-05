import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        // transactionId: {
        //   type: String,
        //   required: true,
        //   unique: true,
        //   index: true,
        // },
        fromAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users_account",
            required: true,
            index:true
        },

        toAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users_account",
            required: true,
            index:true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            default: "PENDING"
        },
        idemponceyKey:{
          type: String,
          required:true,
          index:true,
          unique: true
            
        }
    },
    {
        timestamps: true
    }
);


transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });

const transactionModel = mongoose.model("Transaction", transactionSchema);


module.exports = transactionModel;