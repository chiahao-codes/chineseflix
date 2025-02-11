import express from "express";
import cors from "cors";
import sendPasswordResetToken from "./routes/sendPasswordResetToken.js";
import { connectToDatabase, closeDatabaseConnection } from "./routes/mongo.js";
import resetPassword from "./routes/resetPassword.js";
import userRoutes from "./routes/user.js";
import pageRoutes from "./routes/pages.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  "http://localhost:8080", // Local development
  "https://chineseflix.com", // Your production domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, auth headers)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  })
);

//app.use(cors());
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
// Middleware to parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Set global variable for signupDisplay (default: false)
app.locals.signupDisplay = false;

connectToDatabase()
  .then((db) => {
    app.locals.db = db; // Store DB connection globally

    app.use("/", pageRoutes);
    app.use("/user", userRoutes);
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
        console.log("✅ Server closed.");
        await closeDatabaseConnection();
        console.log("✅ MongoDB connection closed.");
        process.exit(0);
      });
    };
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  })
  .catch((error) => {
    console.error("❌ Server startup failed due to database error:", error);
    process.exit(1); // Exit process on fatal DB failure
  });
