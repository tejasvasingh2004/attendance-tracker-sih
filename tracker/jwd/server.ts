import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { register, verifyEmail } from "./controllers/authController"; // adjust path if needed

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Enable CORS so frontend can call API
app.use(
  cors({
    origin: "*", // Replace '*' with frontend URL in production
  })
);

// --- Inline Routes ---
// Auth routes
app.post("/api/auth/register", register);
app.get("/api/auth/verify/:token", verifyEmail);

// Example user route
app.get("/api/user/profile", (req, res) => {
  res.json({ message: "User profile route (implement later)" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
