import express from "express";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";
import { mongoClient } from "./mongo.js";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

//routes for signup/login;
const router = express.Router();
const db = mongoClient.db("current_users");

/**
 * if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
  await mongoClient.connect();
}
 */

dotenv.config();
console.log(
  "SendGrid API Key:",
  process.env.SENDGRID_API_KEY ? "Loaded" : "Not Loaded"
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "登录尝试次数过多。请稍后重试。",
  standardHeaders: true, // Returns rate limit info in headers
  legacyHeaders: false, // Disable old headers from prior attempts
});

const fromEmail = process.env.DOMAIN_EMAIL;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let signupDisplay;
// Signup Route
router.post("/signup", async (req, res) => {
  req.app.locals.signupDisplay = true; // Update global value
  try {
    const { name, email, password, confirmPassword } = req.body;
    // Grab the reCAPTCHA response token
    const recaptchaToken = req.body["g-recaptcha-response"];

    // Check that reCAPTCHA token is present
    //error: Please complete reCAPTCHA challenge.
    if (!recaptchaToken) {
      return res.render("login", {
        error: "请完成 reCAPTCHA 挑战。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Verify reCAPTCHA with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      }),
    });

    console.log("response: ", response);
    // Check if the HTTP response is OK before attempting to parse
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Non-200 response from reCAPTCHA:", errorText);
      return res.render("login", {
        error: "验证错误。请稍后重试.",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }
    /**
     * Not sure why this is needed:
 *  let data;
    try {
      data = await response.json();
    } catch (e) {
      // Log the raw response if JSON parsing fails
      console.log("signup error: ", e);
      const rawResponse = await response.text();
      console.error(
        "Failed to parse JSON from reCAPTCHA response:",
        rawResponse
      );
      return res.render("login", {
        error: "验证错误。请稍后重试.",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        e,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }
 */

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.render("login", {
        error: "所有字段都是必填的。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("login", {
        error: "电子邮件格式无效。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.render("login", {
        error: "密码不匹配。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("password not strong enough");
      return res.render("login", {
        error:
          "密码必须至少包含 8 个字符，并且至少包含一个大写字母和一个数字。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Check if user already exists
    const existingUser = await db.collection("user_info").findOne({ email });
    console.log("existing user: ", existingUser);
    if (existingUser !== null) {
      //add user error page, message property for ejs template;
      return res.status(400).render("login", {
        error: "用户已存在。请登录。",
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        signupDisplay: req.app.locals.signupDisplay,
      });
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
      <p style="color: #555;">此致，<br> CHINESEFLIX 团队</p>
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

    res.status(400).render("login", {
      error: error.message,
      siteKey: process.env.RECAPTCHA_SITE_KEY,
      signupDisplay: req.app.locals.signupDisplay,
    });
  }
});

// Login Route
router.post("/login", limiter, async (req, res) => {
  req.app.locals.signupDisplay = false;
  const { email, password } = req.body;
  //validate email and password

  // Validate required fields
  if (!email || !password) {
    return res.render("login", {
      error: "所有字段都是必填的。",
      siteKey: process.env.RECAPTCHA_SITE_KEY,
      signupDisplay: req.app.locals.signupDisplay,
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("login", {
      error: "电子邮件格式无效。",
      siteKey: process.env.RECAPTCHA_SITE_KEY,
      signupDisplay: req.app.locals.signupDisplay,
    });
  }

  const db = mongoClient.db("current_users");

  try {
    const user = await db.collection("user_info").findOne({ email });

    if (!user) {
      return res.status(400).render("login", {
        error: "无效的电子邮件。",
        email,
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render("login", {
        error: "无效的密码。",
        signupDisplay: req.app.locals.signupDisplay,
      });
    }

    //generate token for existing user session;
    //token is stored on frontend while user is logged in.
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Successful response with token and user info
    //cookie sent back to browser via header body inside response;
    //can be accessed with each request afterwards;
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Secure flag in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    });

    res.status(200).render("home", {
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("login", {
      error: "登录时发生错误。",
      signupDisplay: req.app.locals.signupDisplay,
    });
  }
});

export { router };
