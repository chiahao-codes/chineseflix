import nodemailer from "nodemailer";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { OAuth2 } = google.auth;
const myUserEmail = process.env.DOMAIN_EMAIL;

const oAuthClientId = process.env.GOOGLE_OAUTH_ID;
const oAuthSecret = process.env.GOOGLE_OAUTH_SECRET;
const oAuthRefresh = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
const oAuthRedirectURi = process.env.GOOGLE_OAUTH_REDIRECT_URI;

const oAuth2Client = new OAuth2(oAuthClientId, oAuthSecret, oAuthRedirectURi);

oAuth2Client.setCredentials({
  refresh_token:
    "1//04J25Dtwf7jnyCgYIARAAGAQSNwF-L9Iri8B7LzSH5zwKU7tezcttypneDsX0SkjqRN_zv8A4Lphrp-R766h0nvYL_GJEjJ8rVpk",
});

const getAccessToken = async () => {
  const accessToken = await oAuth2Client.getAccessToken();
  return accessToken.token;
};

const sendWelcomeEmail = async (userEmail) => {
  try {
    const accessToken = await getAccessToken().catch((e) =>
      console.log(`accessToken error:${e}`)
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: myUserEmail,
        clientId: oAuth2Client,
        clientSecret: oAuthSecret,
        refreshToken:
          "1//04J25Dtwf7jnyCgYIARAAGAQSNwF-L9Iri8B7LzSH5zwKU7tezcttypneDsX0SkjqRN_zv8A4Lphrp-R766h0nvYL_GJEjJ8rVpk",
        accessToken,
      },
    });

    const mailOptions = {
      from: "support@chineseflix.com",
      to: userEmail,
      subject: "欢迎来到 CHINESEFLIX!",
      text: "感谢您的注册！我们很高兴有您加入我们.",
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent: " + result.response);
  } catch (e) {
    console.error("Error sending welcome email:", e);
  }
};

export default sendWelcomeEmail;
