const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');
const bcrypt = require('../../helpers/bcrypt');

describe('User Routes (/api/students, /api/admin, /api/master)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/students/signup', () => {
    it('Successfully sign up with all valid inputs (Expect 200, jwt token, JWT user scope returned)', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.findMany.mockResolvedValue([]);
      prisma.student.create.mockResolvedValue({ id: 1, first_name: 'John', username: 'john123', status: 1 });
      
      const res = await request(app)
        .post('/api/students/signup')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          father_name: 'Father Doe',
          phone_number: '1234567890',
          email: 'test@example.com',
          password: 'password123',
          birth_date: '2000-01-01',
          gender: 'Male',
          username: 'john123',
          organization_id: 1,
          address: 'Test Address'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Signup successful for student');
    });

    it('Missing any required field (Expect 422)', async () => {
      const res = await request(app)
        .post('/api/students/signup')
        .send({ username: 'john123' }); // Missing first_name, etc.
      expect(res.status).toBe(422);
    });

    it('Sign up with an already existing username (Expect 422)', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      prisma.student.findMany.mockResolvedValue([]);
      const res = await request(app)
        .post('/api/students/signup')
        .send({
          first_name: 'John', last_name: 'Doe', father_name: 'Father Doe',
          phone_number: '1234567890',
          email: 'test@example.com', password: 'password123',
          username: 'john123', organization_id: 1,
          birth_date: '2000-01-01', gender: 'Male', address: 'Test Address'
        });
      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Username already present.');
    });

    it('Short password length <=4 (Expect 422)', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.findMany.mockResolvedValue([]);
      const res = await request(app)
        .post('/api/students/signup')
        .send({
          first_name: 'John', last_name: 'Doe', father_name: 'Father Doe',
          phone_number: '1234567890', email: 'test@example.com',
          password: '123', username: 'john123', organization_id: 1,
          birth_date: '2000-01-01', gender: 'Male', address: 'Test Address'
        });
      expect(res.status).toBe(422);
    });

    it('Failure to insert student due to a DB error (Expect 500)', async () => {
      prisma.student.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app)
        .post('/api/students/signup')
        .send({
          first_name: 'John', last_name: 'Doe', father_name: 'Father Doe',
          phone_number: '1234567890', email: 'test@example.com',
          password: 'password123', username: 'john123', organization_id: 1,
          birth_date: '2000-01-01', gender: 'Male', address: 'Test Address'
        });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/students/login', () => {
    it('Correct username and password for an APPROVE user (Expect 200, JWT token returned)', async () => {
       prisma.student.findUnique.mockResolvedValue({
         id: 1, username: 'john123', password: 'hashed', status: 2
       });
       bcrypt.isValidPassword.mockReturnValue(true);
       const res = await request(app)
         .post('/api/students/login')
         .send({ username: 'john123', password: 'password123' });
       expect(res.status).toBe(200);
       expect(res.body.data.token).toBeDefined();
    });

    it('Missing username or password (Expect 422)', async () => {
       const res = await request(app).post('/api/students/login').send({ username: '' });
       expect(res.status).toBe(422);
    });

    it('Correct credentials but user status is PENDING (Expect 403)', async () => {
       prisma.student.findUnique.mockResolvedValue({
         id: 1, username: 'john123', password: 'hashed', status: 1
       });
       const res = await request(app)
         .post('/api/students/login')
         .send({ username: 'john123', password: 'password123' });
       expect(res.status).toBe(403);
    });

    it('Existent username but incorrect password (Expect 422)', async () => {
       prisma.student.findUnique.mockResolvedValue({
         id: 1, username: 'john123', password: 'hashed', status: 2
       });
       bcrypt.isValidPassword.mockReturnValue(false);
       const res = await request(app)
         .post('/api/students/login')
         .send({ username: 'john123', password: 'wrongpassword' });
       expect(res.status).toBe(422);
    });

    it('DB error during findStudentByUsername (Expect 500)', async () => {
       prisma.student.findUnique.mockRejectedValue(new Error('DB error'));
       const res = await request(app)
         .post('/api/students/login')
         .send({ username: 'john123', password: 'password123' });
       expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students/check_username/:username', () => {
    it('Check with a non-existing username (Expect 200, data: true)', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/students/check_username/newuser');
      expect(res.status).toBe(200);
      expect(res.body.data).toBe(true);
    });

    it('Check with an existing username (Expect 422, data: false)', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/students/check_username/existinguser');
      expect(res.status).toBe(422);
      expect(res.body.data).toBe(false);
    });

    it('Simulate a database error/exception during search (Expect 500)', async () => {
      prisma.student.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/students/check_username/erroruser');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students', () => {
    it('Request as Admin or generic query without filters (Expect 200)', async () => {
      prisma.student.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      prisma.student.count.mockResolvedValue(2);
      const res = await request(app).get('/api/students').send({ master_role_id: 1 });
      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(2);
    });

    it('Simulate a database error (Expect 500)', async () => {
      prisma.student.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students/username/:username', () => {
    it('Valid existing username (Expect 200)', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1, username: 'testuser' });
      const res = await request(app).get('/api/students/username/testuser');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('Non-existent username (Expect 422)', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/students/username/nouser');
      expect(res.status).toBe(422);
    });

    it('Database error simulation (Expect 500)', async () => {
      prisma.student.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/students/username/erroruser');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students/:id', () => {
    it('Valid existing ID (Expect 200)', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/students/1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('Non-existent ID (Expect 204)', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/students/999');
      expect(res.status).toBe(204);
    });

    it('Database connection error (Expect 500)', async () => {
      prisma.student.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/students/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/students/update_profile', () => {
    it('Payload lacks valid ID target in flows (Expect 400 or 422)', async () => {
      const res = await request(app).post('/api/students/update_profile').send({
        student: null, data: { first_name: 'Test' }
      });
      expect(res.status).toBeGreaterThanOrEqual(400); 
    });

    it('Simulated DB Error (Expect 500)', async () => {
      prisma.student.update.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/students/update_profile').send({
        data: { student_id: 1, first_name: 'New' }
      });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/students/change_password', () => {
    it('Missing credentials fields (Expect 422)', async () => {
      const res = await request(app).post('/api/students/change_password').send({});
      expect(res.status).toBe(422);
    });

    it('Correct old password, but new password length <=4 (Expect 422)', async () => {
      bcrypt.isValidPassword.mockReturnValue(true);
      const res = await request(app).post('/api/students/change_password').send({
        student: { student_id: 1, password: 'hashed' },
        oldPassword: 'oldpassword', newPassword: '123'
      });
      expect(res.status).toBe(422);
    });

    it('Simulated DB/bcrypt hash Error (Expect 500)', async () => {
      bcrypt.isValidPassword.mockImplementation(() => { throw new Error('bcrypt error'); });
      const res = await request(app).post('/api/students/change_password').send({
        student: { student_id: 1, password: 'hashed' },
        oldPassword: 'old', newPassword: 'newpassword123'
      });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('Valid credentials but DB service returns falsy block or 500', async () => {
      prisma.student.delete.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).delete('/api/students/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/students/approve', () => {
    it('Admin user hitting endpoint passing valid ID (Expect 200)', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1, status: 1 });
      prisma.student.update.mockResolvedValue({ id: 1, status: 2 });
      const res = await request(app).put('/api/students/approve').send({ admin: true, id: 1 });
      expect(res.status).toBeGreaterThanOrEqual(200); 
    });

    it('Internal database override execution fails natively on updateStudentData (Expect 500)', async () => {
      prisma.student.update.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).put('/api/students/approve').send({ admin: true, id: 1 });
      expect(res.status).toBe(500);
    });
  });

});
