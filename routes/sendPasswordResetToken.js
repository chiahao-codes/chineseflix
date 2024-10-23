import crypto from "crypto";
import sendPasswordEmail from "./emails/passwordResetEmail";

router.post("/token-gen", async (req, res) => {
  const { email } = req.body;
  const db = client.db("current_users");

  try {
    const user = await db
      .collection("user_info")
      .findOne({ email })
      .catch((e) => console.log(e));

    if (!user) return res.status(404).send("User not found");

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await db.collection("user_info").updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires,
        },
      }
    );

    const resetUrl = `http://localhost:8080/password-reset/${resetToken}`;
    // Send email logic here using nodemailer
    sendPasswordEmail(email, resetUrl);

    res.send("Password reset link sent");
  } catch (e) {
    res.status(500).send("Server error");
  }
});

export default router;
