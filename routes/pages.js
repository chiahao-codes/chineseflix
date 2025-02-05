import express from "express";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

const siteKey = process.env.RECAPTCHA_SITE_KEY;
console.log("Loaded site key:", process.env.RECAPTCHA_SITE_KEY); // Check if this logs your site key
router.get("/", (req, res, next) => {
  //res.render("updating");
  res.render("home");
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
