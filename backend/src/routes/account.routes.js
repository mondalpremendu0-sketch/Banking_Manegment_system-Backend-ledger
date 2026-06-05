const express = require('express');
const {createAccount_controller} = require('../controllers/account.controller.js');
const isLogedIn = require('../middlewares/auth.middleware.js');


const accountRouter = express.Router()

accountRouter.post("/account",isLogedIn,createAccount_controller)


module.exports = accountRouter;