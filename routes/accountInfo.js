import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { client } from "../server.js";

const router = express.Router();
//grab account info for Accounts page.

router.get("/account", authenticateToken, async (req, res) => {
  try {
    const db = client.db("current_users");
    const user = await db
      .collection("user_info")
      .findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Send user info to the frontend
    res.send({ username: user.username, email: user.email });
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve user data" });
  }
});

export default router;
