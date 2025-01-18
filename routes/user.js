import express from "express";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";
import { mongoClient } from "./mongo.js";
import dotenv from "dotenv";

//routes for signup/login;
const router = express.Router();
const db = mongoClient.db("current_users");
dotenv.config();
console.log(
  "SendGrid API Key:",
  process.env.SENDGRID_API_KEY ? "Loaded" : "Not Loaded"
);

const fromEmail = process.env.DOMAIN_EMAIL;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.render("login", { error: "所有字段都是必填的。" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("login", { error: "电子邮件格式无效。" });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.render("login", { error: "密码不匹配。" });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.render("login", {
        error:
          "密码必须至少包含 8 个字符，并且至少包含一个大写字母和一个数字。",
      });
    }

    // Check if user already exists
    const existingUser = await db.collection("user_info").findOne({ email });

    if (existingUser !== null) {
      //add user error page, message property for ejs template;
      return res.status(400).send({ error: "用户已存在。" });
    }

    //inserts a document obj to mongodb;
    const hashedPassword = await bcrypt.hash(password, 8);
    await db
      .collection("user_info")
      .insertOne({ name, email, password: hashedPassword });

    const msg = {
      to: email, // Recipient's email address
      from: fromEmail, // Sender's verified email address
      subject: `欢迎, ${name}！`, // Personalize the subject line in Chinese
      text: `您好 ${name},\n\n感谢您的注册！我们很高兴您加入我们的平台。如果您有任何问题，请随时与我们联系。\n\n此致，\n团队`, // Plain text version in Chinese
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="color: #333;">您好 ${name}, 欢迎！</h2>
      <p>感谢您的注册。我们很高兴您加入我们的平台！</p>
      <p>如果您有任何问题，请随时 <a href="mailto:support@chineseflix.com">联系我们</a>。</p>
      <p style="color: #555;">此致，<br>团队</p>
    </div>
  `,
    };

    await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).render("confirmed", { name });
  } catch (error) {
    console.log(error);
    // Send error details to the frontend in non-production environments
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "创建用户时出错。"
        : `Error: ${error}`;

    res.status(400).render("login", { error });
    //res.status(400).send({ error: "创建用户时出错。" });
    //res.status(400).render("login", { error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //validate email and password

  // Validate required fields
  if (!email || !password) {
    return res.render("login", { error: "所有字段都是必填的。" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("login", { error: "电子邮件格式无效。" });
  }

  const db = mongoClient.db("current_users");

  try {
    const user = await db.collection("user_info").findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "无效的电子邮件。", email });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "无效的密码。" });
    }

    //generate token for existing user session;
    //token is stored on frontend while user is logged in.
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Successful response with token and user info
    res.status(200).render("home", {
      user: {
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "登录时发生错误。" });
  }
});

export { router };
