import express from "express";
import cors from "cors";
const app = express();

let PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res, next) => {
  res.render("home", { DOMAIN });
});

app.get("/about", (req, res, next) => {
  res.render("about");
});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.get("/contact", (req, res, next) => {
  res.render("contact");
});

app.get("/privacy", (req, res, next) => {
  res.render("privacy");
});

app.get("/terms", (req, res, next) => {
  res.render("terms");
});

app.get("/account", (req, res, next) => {
  res.render("account");
});

app.listen(PORT, () => {
  console.log(`app listening on Port: ${PORT}`);
});
