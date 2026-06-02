const express = require("express");
const auth = require("../controllers/auth.controller.js");
const isLogedIn = require('../middlewares/auth.middleware.js')



const userRoutes = express.Router();

userRoutes.post("/register", auth.register_controller);
userRoutes.post("/login", auth.login_controller);
userRoutes.get("/profile",isLogedIn,auth.userProfile_controller);



module.exports = userRoutes;
