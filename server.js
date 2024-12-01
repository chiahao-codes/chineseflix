import express from "express";
import cors from "cors";
import sendPasswordResetToken from "./routes/sendPasswordResetToken.js";
import { connectToDatabase, closeDatabaseConnection } from "./routes/mongo.js";
import resetPassword from "./routes/resetPassword.js";
import accountInfoRoutes from "./routes/accountInfo.js";
import authRoutes from "./routes/auth.js";
import pageRoutes from "./routes/pages.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.set("view engine", "ejs");

connectToDatabase().catch(console.dir);

app.use("/", pageRoutes);
/*
Endpoints working so far. Need to setup custom email and test sending emails (tokens, welcome)
*/
app.use("/auth", authRoutes);
app.use("/password-token", sendPasswordResetToken);
app.use("/reset", resetPassword);
app.use("/account", accountInfoRoutes);

const server = app.listen(PORT, () =>
  console.log(`listening on port: ${PORT}`)
);

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(async (err) => {
    if (err) {
      console.error("Error closing server", err);
      process.exit(1);
    }
    await closeDatabaseConnection();
    process.exit(0);
  });
};
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
