import express from "express";
import cors from "cors";
import sendPasswordResetToken from "./routes/sendPasswordResetToken.js";
import { connectToDatabase, closeDatabaseConnection } from "./routes/mongo.js";
import resetPassword from "./routes/resetPassword.js";
import { router } from "./routes/user.js";
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

// Middleware to parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));
// Set global variable for signupDisplay (default: false)
app.locals.signupDisplay = false;

connectToDatabase().catch(console.dir);

app.use("/", pageRoutes);
app.use("/user", router);
app.use("/password-token", sendPasswordResetToken);
app.use("/reset", resetPassword);

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
