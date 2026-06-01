const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const userRoutes = require('./routes/user.routes.js')





const app = express();


app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/v1/user",userRoutes);


module.exports = app;