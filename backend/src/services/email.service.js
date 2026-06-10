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

module.exports = {sendRegisterEmail};
