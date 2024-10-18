import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../server.js";
import dotenv from "dotenv";
import sendWelcomeEmail from "./welcomeEmail.js";

//define routes to store/access user info in mongodb;
//generate token for user login usage

const router = express.Router();
dotenv.config();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = client.db("current_users");

    // Check if user already exists
    const existingUser = await db
      .collection("user_info")
      .findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    //inserts a document obj to mongodb;
    const hashedPassword = await bcrypt.hash(password, 8);
    const result = await db
      .collection("user_info")
      .insertOne({ username, email, password: hashedPassword });

    //send welcome email
    sendWelcomeEmail(email);
    res.status(201).send({ message: "User created successfully", result });
  } catch (error) {
    res.status(400).send({ error: "Error creating user" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = client.db("current_user");
    const user = await db.collection("user_info").findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid email or password" });
    }
    //generate token for existing user's id in mongo;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({
      token,
      user: {
        username: user.username,
        email: user.email,
        // Add any other user info you want to send
      },
    });
  } catch (error) {
    res.status(400).send({ error: "Error logging in" });
  }
});

export default router;
