import express from "express";
const router = express.Router();
import { connectToDatabase } from "./mongo.js";
import dotenv from "dotenv";
dotenv.config();

const siteKey = process.env.RECAPTCHA_SITE_KEY || "";

router.get("/", (req, res, next) => {
  res.render("updating");
  //res.render("home");
});

router.get("/about", (req, res, next) => {
  res.render("about");
});

router.get("/contact", (req, res, next) => {
  res.render("contact");
});

//login/signup page
router.get("/login", (req, res, next) => {
  res.render("login", { siteKey });
});

router.get("/test-connection", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("user_info").findOne({});
    res.status(200).send({ message: "Connection successful!", result });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.render("login", { error });
    //res.status(500).send({ error: "Connection failed.", details: error });
  }
});

//Account Profile
/**
 * router.get("/account", (req, res, next) => {
  res.render("account");
});
 */

router.get("/privacy", (req, res, next) => {
  res.render("privacy");
});

router.get("/subtitles", (req, res) => {
  res.render("subtitles");
});

router.get("/terms", (req, res, next) => {
  res.render("terms");
});

export default router;
