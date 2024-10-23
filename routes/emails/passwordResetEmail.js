import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordEmail = (userEmail, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "CHINESEFLIX: 密码重置请求",
    text: `你好, 请点击此处重置您的密码:${resetUrl} `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending Password email:", error);
    } else {
      console.log("Password email sent:", info.response);
      console.log("Message ID:", info.messageId);
    }
  });
};

export default sendPasswordEmail;
