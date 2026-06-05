const express = require('express');
const isLogedIn = require('../middlewares/auth.middleware.js');



const transactionRouter = express.Router();


transactionRouter.post("/",isLogedIn,transactionController);

module.exports = transactionRouter;