import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { client } from "../server.js";
import nodemailer from "nodemailer";

//after user is already logged in with verified token:
//route allows for retrieving sensitive user info: email, username, pw;

const router = express.Router();

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.get("/user", authenticateToken, async (req, res) => {
  //send email with user info;
  try {
    const db = client.db("current_users");
    const user = await db
      .collection("user_info")
      .findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Set up email options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Profile Data Accessed",
      text: `你好 ${user.username},\n\n
您已成功访问您的个人资料数据。这是您的详细信息:\n\n用户名: ${user.username}\n电子邮件: ${user.email}\n\n此致,\n支持团队`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({ error: "Failed to send email" });
      } else {
        res.send({ username: user.username, email: user.email });
      }
    });
  } catch (error) {
    res.status(500).send({});
  }
});

export default router;
