const express = require('express');
const AppError = require('../utils/error.utils.js')
const Account = require('../model/account.model.js')


async function createAccount_controller(req,res,next) {
  
  try {
    
    const {userId} = req.user;
    
    const newAccount = await Account.create({account:userId});
    
    if (!newAccount) {
      return next(new AppError("can't create account right now", 400));
    }
    res.status(201).json({ 
      success:true,
      message:"account created successfully ",
      newAccount
      });
    
    
  } catch (err) {
    return next(new AppError("Database disconnected", 500));
  }
  
}


module.exports = {
  createAccount_controller
}