const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');
const bcrypt = require('bcrypt');

describe('User Routes (/api/students, /api/admin, /api/master)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/students/signup', () => {
    it('should create a new student successfully', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
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
      expect(prisma.student.create).toHaveBeenCalled();
    });

    it('should return 400 if user with same details already exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      
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
        
      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Username already present.');
    });
  });

  describe('POST /api/students/login', () => {
    it('should login student and return token', async () => {
       const hashedPassword = await bcrypt.hash('password123', 10);
       prisma.student.findUnique.mockResolvedValue({
         id: 1, 
         username: 'john123', 
         password: hashedPassword,
         status: 2
       });
       
       const res = await request(app)
         .post('/api/students/login')
         .send({
           username: 'john123',
           password: 'password123'
         });
         
       expect(res.status).toBe(200);
       expect(res.body.message).toBe('Login successful for student');
       expect(res.body.data.token).toBeDefined();
    });

    it('should block PENDING student from login', async () => {
       prisma.student.findUnique.mockResolvedValue({
         id: 1, 
         username: 'john123', 
         password: 'hash',
         status: 1
       });
       
       const res = await request(app)
         .post('/api/students/login')
         .send({
           username: 'john123',
           password: 'password123'
         });
         
       expect(res.status).toBe(403);
       expect(res.body.message).toBe('Your account is pending approval. Please wait for admin approval.');
    });
  });

});
