const express = require("express");
const auth = require("../controllers/auth.controller.js");

const userRoutes = express.Router();

userRoutes.post("/register", auth.register_controller);

module.exports = userRoutes;
