const express = require('express');
const router = express.Router();
const common = require('../helpers/common')

// Export a function that accepts the database pool as a parameter
module.exports = function(pool) {
  // Signup route
  router.post('/signup', async (req, res) => {
    try {
      // Extract necessary data from request body
      const { fname, lname, fathername, mothername, phone, whatsappnum, username, email, password, birthdate, gender } = req.body;

      // uniq number generate with firstname three character
      let student_unique_id = 'SAU-1234'
      let orgID = 1

      // hash password
      let encPassword = common.createHash(password)
      console.log("============encpassword==========", encPassword)

      // Use the pool to query the database
      const client = await pool.connect();
      const query = 'INSERT INTO users (org_id, fname, lname, fathername, mothername, phone, whatsappnum, username, email, password, birthdate, gender, student_unique_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
      const result = await client.query(query, [orgID, fname, lname, fathername, mothername, phone, whatsappnum, username, email, encPassword, birthdate, gender, student_unique_id]);
      // Perform the signup logic here
      // Release the client back to the pool
      client.release();
      res.status(200).json({message: "Signup Successfull."});
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};
