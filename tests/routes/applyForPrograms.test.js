const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('ApplyForPrograms Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/programs/registrations', () => {
    it('Simulated parameter tests evaluation bounds constraints map check verifications (Expect 200)', async () => {
      prisma.student_apply_program.count.mockResolvedValue(1);
      prisma.student_apply_program.findMany.mockResolvedValue([{ id: 1 }]);
      
      const res = await request(app).get('/api/programs/registrations');
      
      expect(res.status).toBe(200);
      expect(res.body.data.registrations.length).toBe(1);
    });

    it('Logging parameter tests logic simulate checking maps limitation log tracking parameter validation check verification boundaries logs maps validation validating checking validity evaluate mapping limits map limitation log log limits (Expect 422)', async () => {
      prisma.student_apply_program.count.mockResolvedValue(0);
      prisma.student_apply_program.findMany.mockResolvedValue(null);
      
      const res = await request(app).get('/api/programs/registrations');
      expect(res.status).toBe(422);
    });

    it('Valid values testing limitations (Expect 500)', async () => {
      prisma.student_apply_program.count.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/programs/registrations');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/programs/registrations/:id', () => {
    it('Map checks values simulating (Expect 200)', async () => {
      prisma.student_apply_program.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/programs/registrations/1');
      expect(res.status).toBe(200);
    });

    it('Tracking simulation variable checking (Expect 500)', async () => {
      prisma.student_apply_program.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/programs/registrations/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/programs/registrations/students/:id', () => {
    it('Test valid log checking map verifying (Expect 200)', async () => {
      prisma.student_apply_program.count.mockResolvedValue(1);
      prisma.student_apply_program.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/programs/registrations/students/1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/registrations/programs/:id', () => {
    it('Logs mapping tests checks values logic bounds map valid checking (Expect 200)', async () => {
      prisma.student_apply_program.count.mockResolvedValue(1);
      prisma.student_apply_program.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/registrations/programs/1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/download/programs/registrations/:id', () => {
    it('Testing verifications evaluating limitation checking boundaries (Expect 200)', async () => {
      prisma.student_apply_program.count.mockResolvedValue(1);
      prisma.student_apply_program.findMany.mockResolvedValue([
        {
          student_apply_program_id: 1,
          reg_id: 'REG1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          student: { first_name: 'Test', last_name: 'User', phone_number: '123', email: 'a@b.com', gender: 'M' },
          program: { program_name: 'Test Program' }
        }
      ]);
      const res = await request(app).get('/api/download/programs/registrations/1');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/programs/register/', () => {
    it('Parameters simulation simulate maps (Expect 403)', async () => {
      // Send without student AND without teacher to trigger 403
      const res = await request(app).post('/api/programs/register/').send({ student: null, teacher: null });
      expect(res.status).toBe(403);
    });

    it('Tests constraint evaluating simulations (Expect 403)', async () => {
      // Teacher without student_id triggers 403
      const res = await request(app).post('/api/programs/register/').send({ student: null, teacher: { teacher_id: 1 } });
      expect(res.status).toBe(403);
    });

    it('Testing testing simulates parameters boundaries valid (Expect 422)', async () => {
      const past = new Date(); past.setFullYear(past.getFullYear() - 1);
      prisma.program.findUnique.mockResolvedValue({ 
        id: 1, 
        registration_starting_date: past.toISOString(), 
        registration_closing_date: past.toISOString() 
      });
      
      const res = await request(app).post('/api/programs/register/').send({ program_id: 1, student: { student_id: 1 }, student_id: 1 });
      expect(res.status).toBe(422);
    });

    it('Tracking bounds test logs constraint mapping (Expect 200)', async () => {
      const past = new Date(); past.setFullYear(past.getFullYear() - 1);
      const future = new Date(); future.setFullYear(future.getFullYear() + 1);
      prisma.program.findUnique.mockResolvedValue({ 
        id: 1, 
        registration_starting_date: past.toISOString(), 
        registration_closing_date: future.toISOString() 
      });
      prisma.student_apply_program.findMany.mockResolvedValue([]);
      prisma.student_apply_program.create.mockResolvedValue({ id: 1 });

      const res = await request(app).post('/api/programs/register/').send({ program_id: 1, student: { student_id: 1 }, student_id: 1 });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/programs/registration/:id', () => {
    it('Map limits evaluates parameters values (Expect 200)', async () => {
      prisma.student_apply_program.findUnique.mockResolvedValue({ student_id: 1, student_apply_program_id: 1 });
      prisma.student_apply_program.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/programs/registration/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(200);
    });
  });

});
