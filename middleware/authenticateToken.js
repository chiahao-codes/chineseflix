import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//checks for secure jwt token in user's request header;

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer token

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = decodedPayload; // Attach user to request object
    next();
  });
};

export default authenticateToken;
