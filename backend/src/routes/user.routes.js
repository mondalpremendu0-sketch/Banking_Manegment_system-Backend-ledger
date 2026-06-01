const express = require('express');

const userRoutes = express.Router();



userRoutes.post("/login",login_controller)



module.exports = userRoutes;