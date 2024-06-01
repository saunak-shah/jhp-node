const express = require('express');
const router = express.Router();
const common = require('../helpers/common')

// Export a function that accepts the database pool as a parameter
module.exports = function(pool) {
  // Signup route
  router.post('/exams/add', async (req, res) => {
    try {
      // Extract necessary data from request body
      const { exam_name, file_url, exam_date, exam_duration, exam_description, exam_score, exam_location, exam_status, exam_passing_score, exam_max_attempts, is_active, exam_created_at, exam_updated_at} = req.body;

      // Use the pool to query the database
      const client = await pool.connect();
      const query = 'INSERT INTO exams (exam_name, file_url, exam_date, exam_duration, exam_description, exam_score, exam_location, exam_status, exam_passing_score, exam_max_attempts, is_active, exam_created_at, exam_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
      const result = await client.query(query, [exam_name, file_url, exam_date, exam_duration, exam_description, exam_score, exam_location, exam_status, exam_passing_score, exam_max_attempts, is_active, exam_created_at, exam_updated_at]);
      // Perform the signup logic here
      // Release the client back to the pool
      client.release();
      res.send('Signup logic goes here');
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // admin
  router.post('/exams/all_list', async (req, res) => {
    try {
      // Extract necessary data from request body
      const { exam_id } = req.body;

      // Use the pool to query the database
      const query = 'SELECT * FROM exams WHERE is_active = $1';
      const result = await client.query(query, [true]);
      // Perform the signup logic here
      // Release the client back to the pool
      client.release();
      res.send('Signup logic goes here');
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/exams/apply', async (req, res) => {
    try {
      // Extract necessary data from request body
      const { exam_id, user_id } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like 
      // generate unique exam id
      // check if already apply or not for requested exam

      // Use the pool to query the database
      const query = 'SELECT * FROM exams_apply_user WHERE exam_id = $1';
      const result = await client.query(query, [exam_id]);
      // Perform the signup logic here
      // Release the client back to the pool
      client.release();
      res.send('Signup logic goes here');
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/result/list', async (req, res) => {
    try {
      // Extract necessary data from request body
      const { exam_id, user_id } = req.body;
      
      // enter exam id
      
      // Use the pool to query the database
      const query = 'SELECT * FROM exams_apply_user WHERE exam_id = $1';
      const result = await client.query(query, [exam_id]);
      // Perform the signup logic here
      // Release the client back to the pool
      client.release();
      res.send('Signup logic goes here');
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};
