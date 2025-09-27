import config from "./config.ts";                  
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/index.ts";    
import otpRoutes from "./routes/otpRoutes.ts"
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


app.get("/health", (req, res) => res.send("Server is healthy"));

app.use("/api/students", studentRoutes);
app.use("/api/otp", otpRoutes);


app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
