const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const userRoutes = require('./routes/user.routes.js')
const accountRouter = require('./routes/account.routes.js')
const errorMiddleware = require('./middlewares/error.middleware.js')





const app = express();


app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/api/user",userRoutes);
app.use("/api/user",accountRouter);

app.use(errorMiddleware);

module.exports = app;