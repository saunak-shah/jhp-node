// tests/users.test.js
const request = require('supertest');
const express = require('express');
const usersRoute = require('../routes/teachers'); // Path to your users route

// Mock dependencies
jest.mock('../services/teacher');
jest.mock('../helpers/bcrypt');
jest.mock('../helpers/jwt');

const bcrypt = require('../helpers/bcrypt');
const { signJwt } = require('../helpers/jwt');

const app = express();
app.use(express.json());
app.use('/api', usersRoute());
  

describe('POST /teachers/login', () => {
  it('should return 422 if username or password is missing', async () => {
    const res = await request(app).post('/api/teachers/login').send({
      username: '',
      password: '',
    });

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toBe('Fill all the fields properly');
  });
});
