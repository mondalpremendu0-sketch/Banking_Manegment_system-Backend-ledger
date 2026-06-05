const express = require('express');
const isLogedIn = require('../middlewares/auth.middleware.js');
const {transaction_Controller}  = require('../controllers/')


const transactionRouter = express.Router();


transactionRouter.post("/",isLogedIn,transaction_Controller);

module.exports = transactionRouter;