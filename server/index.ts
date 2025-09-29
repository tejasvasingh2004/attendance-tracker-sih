import config from "./config.ts";
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/index.ts";
import otpRoutes from "./routes/otp/index.ts";
import attendanceRouter from "./routes/attendanceRoutes.ts";
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/plain' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to parse text/plain as JSON
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain;charset=UTF-8' && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (error) {
      console.error('Failed to parse JSON from text/plain:', error);
    }
  }
  next();
});


app.get("/health", (req, res) => res.send("Server is healthy"));

app.use("/api/students", studentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/attendance", attendanceRouter);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
