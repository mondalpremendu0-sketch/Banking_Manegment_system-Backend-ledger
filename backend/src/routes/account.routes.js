const express = require('express');
const {createAccount_controller} = require('../controllers/account.controller.js');

const accountRouter = express.Router()

accountRouter.post("/account",createAccount_controller)


module.exports = accountRouter;