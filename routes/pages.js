import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("home", { DOMAIN });
});

router.get("/about", (req, res, next) => {
  res.render("about");
});

router.get("/account", (req, res, next) => {
  res.render("account");
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.get("/contact", (req, res, next) => {
  res.render("contact");
});

router.get("/privacy", (req, res, next) => {
  res.render("privacy");
});

router.get("/subtitles", (reg, res) => {
  res.render("subtitles");
});

router.get("/terms", (req, res, next) => {
  res.render("terms");
});

export default router;
