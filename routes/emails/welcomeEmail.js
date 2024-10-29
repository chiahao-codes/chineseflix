import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const myUserEmail = process.env.USER_EMAIL;
const myPasscode = process.env.USER_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.mail.me.com",
  port: 587,
  secure: false,
  debug: true,
  logger: true,
  auth: {
    user: myUserEmail,
    pass: myPasscode,
  },
});
/**
 * transporter.verify((err, success) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(success);
  return;
});
 */

const sendWelcomeEmail = (userEmail) => {
  const mailOptions = {
    from: "support@chineseflix.com",
    to: userEmail,
    subject: "欢迎来到 CHINESEFLIX!",
    text: "感谢您的注册！我们很高兴有您加入我们.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending welcome email:", error);
    } else {
      console.log("Welcome email sent:", info.response);
      console.log("Message ID:", info.messageId);
    }
  });
};

export default sendWelcomeEmail;
