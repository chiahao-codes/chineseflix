import express from "express";
import bcrypt from "bcryptjs";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { mongoClient } from "./mongo.js";
import dotenv from "dotenv";
import sendWelcomeEmail from "./emails/welcomeEmail.js";

//define routes for signup/login;
//generate token for user login usage
const app = express();
const router = express.Router();
dotenv.config();

const oAuthClientId = process.env.GOOGLE_OAUTH_ID;
const oAuthSecret = process.env.GOOGLE_OAUTH_SECRET;

const oAuth2Client = new google.auth.OAuth2(
  oAuthClientId,
  oAuthSecret,
  "http://localhost:8080/auth/google/callback" // Your redirect URI here
);

// Redirect chineseflix to Google's OAuth 2.0 server for authentication on their server;
app.get("/google", (req, res) => {
  try {
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
    });
    console.log("authURL:", url);
    res.redirect(url);
  } catch (e) {
    console.log(e);
    res.sendStatus(500).send(e);
  }
});

// Handle the OAuth 2.0 server response
app.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const resp = await oAuth2Client.getToken(code); // Token exchange happens here
    console.log("Full response:", resp);
    const tokens = resp.tokens;
    oAuth2Client.setCredentials(tokens); // Set the tokens to the OAuth2 client
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    res.send("Authentication successful! Tokens received.");
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Authentication failed");
  }
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = mongoClient.db("current_users");

    // Check if user already exists
    const existingUser = await db
      .collection("user_info")
      .findOne({ $or: [{ email }, { username }] });

    console.log(existingUser);

    if (existingUser !== null) {
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
    console.log(error);
    res.status(400).send({ error: "Error creating user" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  const db = mongoClient.db("current_users");

  try {
    const user = await db
      .collection("user_info")
      .findOne({ email })
      .catch((e) => console.log(e));

    if (!user) {
      return res.status(400).send({ error: "Invalid email", email });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid password" });
    }

    //generate token for existing user session;
    //token is stored on frontend while user is logged in.
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
