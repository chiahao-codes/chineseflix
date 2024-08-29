import express from "express";
import cors from "cors";
const app = express();

let PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res, next) => {
  res.render("home");
});

app.listen(PORT, () => {
  console.log(`app listening on Port: ${PORT}`);
});
