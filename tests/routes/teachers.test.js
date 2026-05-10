const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');
const bcrypt = require('bcrypt');

describe('Teachers Routes (/api/teachers)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/teachers/signup', () => {
    it('should create a new teacher successfully', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);
      prisma.teacher.create.mockResolvedValue({ id: 1, teacher_name: 'Test Teacher', teacher_username: 'testteacher' });
      
      const res = await request(app)
        .post('/api/teachers/signup')
        .send({
          teacher_first_name: 'Test',
          teacher_last_name: 'Teacher',
          teacher_phone_number: '1234567890',
          teacher_email: 'test@examples.com',
          teacher_password: 'password123',
          teacher_birth_date: '2000-01-01',
          teacher_gender: 'Male',
          teacher_username: 'testteacher',
          organization_id: 1,
          teacher_address: '123 Test St',
          master_role_id: 2
        });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Signup successful');
      expect(prisma.teacher.create).toHaveBeenCalled();
    });

    it('should return error if username already exists', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      
      const res = await request(app)
        .post('/api/teachers/signup')
        .send({
          teacher_first_name: 'Test',
          teacher_last_name: 'Teacher',
          teacher_phone_number: '1234567890',
          teacher_email: 'test@examples.com',
          teacher_password: 'password123',
          teacher_birth_date: '2000-01-01',
          teacher_gender: 'Male',
          teacher_username: 'testteacher',
          organization_id: 1,
          teacher_address: '123 Test St',
          master_role_id: 2
        });
        
      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Username already present.');
    });
  });

  describe('POST /api/teachers/login', () => {
    it('should login teacher and return token', async () => {
       const hashedPassword = await bcrypt.hash('password123', 10);
       prisma.teacher.findUnique.mockResolvedValue({
         id: 1, 
         teacher_username: 'testteacher', 
         password: hashedPassword,
         master_role_id: 2
       });
       
       const res = await request(app)
         .post('/api/teachers/login')
         .send({
           username: 'testteacher',
           password: 'password123'
         });
         
       expect(res.status).toBe(200);
       expect(res.body.message).toBe('Login successful for teacher');
       expect(res.body.data.token).toBeDefined();
    });
  });

});
