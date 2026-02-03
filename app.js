const express = require("express");
const bodyParser = require("body-parser"); // Optional now, express.json() handles most
const fs = require("fs");
const path = require("path");
const helmet = require("helmet"); // ✅ Add helmet
require("dotenv").config();
var cors = require("cors");

const app = express();

// ✅ Add Helmet for security headers including HSTS
app.use(
  helmet({
    contentSecurityPolicy: false // Disable CSP if not using it
  })
);

// ✅ Enforce HSTS manually (1 year, includes subdomains, preload)
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  })
);

// ✅ Redirect HTTP to HTTPS (only works if your app gets HTTP requests directly)
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use(express.json());
const allowedOrigins = [
  "https://software.jhpparivar.in",
  "https://admin.jhpparivar.in",
  "http://localhost:3001", // optional for local testing
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

app.options("*", cors());

// ✅ Check required environment variables
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

// ✅ Load all route files dynamically
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  const routePath = path.join(routesPath, file);
  const route = require(routePath)();
  app.use("/api", route);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
