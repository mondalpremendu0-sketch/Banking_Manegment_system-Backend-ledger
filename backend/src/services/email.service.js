const transporter = require("../utils/email.utils.js");
const nodemailer = require("nodemailer");

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html // html body
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

async function sendRegisterEmail(userEmail, userName) {
    try {
         const to = userEmail;
         const text = "Registration for Banking ledger!"
        const subject = "Welcome to Banking Management System"
        const  html = `
        <h2>Welcome, ${userName} 🎉</h2>
        <p>Your account <u>${userEmail} </u> has been successfully registered.</p>
        <p>Thank you for choosing our Banking Management System.</p>
        <br/>
        <p>Regards,</p>
        <p>Banking Management Team</p>
      `;
      await sendEmail(to,text,subject,html)
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

async function sendTransactionMail(userEmail, userName,Type,amount,balance) {
  
  try {
    const to = userEmail;
    const subject = "Transaction Alert";
    const text = "You have a new transaction!!";
    const html =  `<h2>Transaction Notification</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        
        <p>Your transaction has been processed successfully.</p>

        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Transaction Type</strong></td>
            <td>${Type}</td>
          </tr>
          <tr>
            <td><strong>Amount</strong></td>
            <td>₹${amount}</td>
          </tr>
          <tr>
            <td><strong>Available Balance</strong></td>
            <td>₹${balance}</td>
          </tr>
        </table>

        <p>If you did not perform this transaction, please contact support immediately.</p>

        <p>Thank you,<br>Banking Management System</p>
      `;
      await sendEmail(to,subject,text,html);
  } catch (err) {
    console.error('Mail Error:', err);
    
  }
  
}

module.exports = {sendRegisterEmail};

