const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'jhp-db',
  password: '12345',
  port: 5432,
});

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Load all route files dynamically
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  const routePath = path.join(routesPath, file);
  const route = require(routePath)(pool); // Pass the pool object when requiring the route files
  app.use('/api', route);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
