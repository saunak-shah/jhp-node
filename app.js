const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
var cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const requiredEnvVariables = [
  process.env.DATABASE_URL,
  process.env.MAIL_ID,
  process.env.MAIL_PASSWORD,
  process.env.ENCRYPTION_SECRET_KEY
];

for (const variable of requiredEnvVariables) {
  if (!variable) {
    throw new Error("All Env variables should be configured.");
  }
}

// Load all route files dynamically
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  const routePath = path.join(routesPath, file);
  const route = require(routePath)(); // Pass the pool object when requiring the route files
  app.use("/api", route);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
