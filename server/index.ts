// src/index.ts
import config from "./config.ts";                  // <--- add .ts
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/index.ts";    // <--- add .ts

const app = express();

// CORS setup
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => res.send("Server is healthy"));

// Routes
app.use("/api/students", studentRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
