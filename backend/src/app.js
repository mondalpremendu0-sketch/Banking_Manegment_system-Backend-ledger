const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const sendEmail = require('./services/email.service.js');


const userRoutes = require('./routes/user.routes.js')
const accountRouter = require('./routes/account.routes.js')
const transactionRouter = require('./routes/transaction.routes.js')
const errorMiddleware = require('./middlewares/error.middleware.js')





const app = express();


app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/api/user",userRoutes);
app.use("/api/user",accountRouter);
app.use("/api/user/transaction",transactionRouter);

// Example usage
sendEmail(
  'mondalpremendu43@gmail.com',
  'Test Email Subject',
  'This is a test email sent with Nodemailer using OAuth2.',
  '<p>This is a test email sent with <b>Nodemailer</b> using OAuth2.</p>'
);

app.use(errorMiddleware);

module.exports = app;