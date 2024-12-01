import { mongoClient } from "./mongo.js";
import express from "express";

const router = express.Router();

router.post("/password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const db = mongoClient.db("your_database_name");

  try {
    const user = await db
      .collection("current_users")
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .catch((e) => console.log(e));

    if (!user) return res.status(400).send("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hashing the new password
    await db.collection("user_info").updateOne(
      { email: user.email },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    res.send("Password successfully reset");
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

export default router;
