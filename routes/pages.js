import express from "express";
const router = express.Router();

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
  res.render("login");
});

router.get("/confirmed", (req, res, next) => {
  res.render("confirmed");
});

//Account Profile
router.get("/account", (req, res, next) => {
  res.render("account");
});

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
