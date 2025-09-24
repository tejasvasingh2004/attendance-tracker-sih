import express from "express";
import config from "./config";
const app = express();

app.get("/health", (req, res) => {
  res.send("Server is healthy");
});

app.listen(config.port, () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});
