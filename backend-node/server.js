const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Server is healthy");
});

app.get("/", (req, res) => {
  res.send("Hello from Node.js server!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
