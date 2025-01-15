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
const fromEmail = process.env.DOMAIN_EMAIL;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await db.collection("user_info").findOne({ email });

    if (existingUser !== null) {
      //add user error page, message property for ejs template;
      return res.status(400).send({ error: "User already exists" });
    }

    //inserts a document obj to mongodb;
    const hashedPassword = await bcrypt.hash(password, 8);
    await db
      .collection("user_info")
      .insertOne({ email, password: hashedPassword });

    const msg = {
      to: email, // Change to your recipient
      from: fromEmail, // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };

    await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).render("confirmed");
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Error creating user" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = mongoClient.db("current_users");

  try {
    const user = await db.collection("user_info").findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "Invalid email", email });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid password" });
    }

    //generate token for existing user session;
    //token is stored on frontend while user is logged in.
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Successful response with token and user info
    res.status(200).render("home", {
      user: {
        username: user.username,
        email: user.email,
        // Add any other user info you want to send
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred during login" });
  }
});

export { router };
