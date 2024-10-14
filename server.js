import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

const mongoUser = encodeURIComponent("chiahao1");
const mongoPW = encodeURIComponent("xZBiOUuUGJg2GT0I");
const uri = `mongodb+srv://${mongoUser}:${mongoPW}@chineseflix.r2ugzun.mongodb.net/?retryWrites=true&w=majority&appName=CHINESEFLIX`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

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

app.get("/subtitles", (reg, res) => {
  res.render("subtitles");
});

app.get("/terms", (req, res, next) => {
  res.render("terms");
});

app.get("/account", (req, res, next) => {
  res.render("account");
});

run().catch(console.dir);
app.listen(PORT, () => {
  console.log(`app listening on Port: ${PORT}`);
});
