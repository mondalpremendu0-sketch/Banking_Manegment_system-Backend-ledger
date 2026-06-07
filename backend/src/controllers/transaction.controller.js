const express = require("express");
const Account = require('../model/account.model.js');
const Transaction = require("../model/transaction.model.js");
const AppError = require("../utils/error.utils.js");
async function transaction_Controller() {
    try {
      //validate user and account
        const { fromAccount, toAccount, amount, idemponceyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idemponceyKey) {
            return next(new AppError("All fields are required!!", 400));
        }
        
        const isFromAccountExists = await Account.findOne({
          _id:fromAccount
        })
        
        const isToAccountExists = await Account.findOne({
          _id:toAccount
        })
        
        if (!isFromAccountExists || !isToAccountExists) {
          
          return next(new AppError("Error , From account/To account didn't Exists", 400));
        }
        
        //validate idp..key
        
        const isTransactionExists = await Transaction.findOne({
          idemponceyKey:idemponceyKey
        }) 
        
        if (isTransactionExists) {
          if (isTransactionExists.status === "COMPLETED") {
            res.status(200).json({ 
              success:true,
              message:"transaction successfull",
              transaction:isTransactionExists
            });
          }
          if (isTransactionExists.status === "PENDING") {
            return next(new AppError("Transaction is processing,please wait!",400));
          }
          if (isTransactionExists.status === "FAILED") {
            return next(new AppError("Transaction is FAILED,please try again!",400));
          }
          if (isTransactionExists.status === "REVERSED") {
            return next(new AppError("Transaction is REVERSED,please try again!",400));
          }
        }
        
        //chech account status
        if (isFromAccountExists.status !== "ACTIVE" || isTransactionExists.status !== "ACTIVE") {
          return next(new AppError("Account doesn't Active!", 400));
        }
        
        const balance = await fromAccount.getBalance()
        
        if (balance < amount) {
          return next(new AppError("Insufficient Amount", 400));
        }
        
        
    } catch (err) {
        return next(new AppError("Database disconnected", 500));
    }
}

module.exports = transaction_Controller;
