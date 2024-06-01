const express = require('express');
const router = express.Router();
const db = require('../querybuilders/db')

// Export a function that accepts the database pool as a parameter
module.exports = function(pool) {
  // Login route
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Use the pool to query the database
      const client = await pool.connect();
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await client.query(query, [username]);

      console.log("result========== %j", result)

      // Perform the login logic here
      // Release the client back to the pool
      client.release();
      res.status(200).json({message: "Login Successfull."});
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};
