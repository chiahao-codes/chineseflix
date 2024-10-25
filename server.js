import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import sendPasswordResetToken from "./routes/sendPasswordResetToken.js";
import resetPassword from "./routes/resetPassword.js";
import accountInfoRoutes from "./routes/accountInfo.js";
import authRoutes from "./routes/auth.js";
import pageRoutes from "./routes/pages.js";
import dotenv from "dotenv";

dotenv.config();

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
async function connectToDatabase() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log("You successfully connected to MongoDB!");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
  }
}

const app = express();
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.set("view engine", "ejs");

connectToDatabase().catch(console.dir);

app.use("/", pageRoutes);

/*
Endpoints working so far. Need to setup custom email and test sending emails (tokens, welcome)
Don't commit these yet.
Production environment only:

app.use("/auth", authRoutes);
app.use("/password-token", sendPasswordResetToken);
app.use("/reset", resetPassword);
app.use("/account", accountInfoRoutes);
*/

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`app listening on Port: ${PORT}`);
});

// Graceful shutdown of server
process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing MongoDB client");
  await client.close().catch((e) => console.log(e));
  console.log("MongoDB client closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing MongoDB client");
  await client.close().catch((e) => console.log(e));
  console.log("MongoDB client closed");
  process.exit(0);
});

export { client };
