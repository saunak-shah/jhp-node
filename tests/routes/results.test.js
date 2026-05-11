const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Results Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/result/:id', () => {
    it('Map checks values parameter (Expect 200)', async () => {
      prisma.result.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/result/1');
      expect(res.status).toBe(200);
    });

    it('Log verifying limits verifying test mapping tracking mapping (Expect 422)', async () => {
      prisma.result.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/result/1');
      expect(res.status).toBe(422);
    });

    it('Simulate evaluating limits variable (Expect 500)', async () => {
      prisma.result.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/result/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/student/exam/result', () => {
    it('Variables testing constraint mapping (Expect 200)', async () => {
      // findResultByRegistrationId uses prisma.result.findUnique with where: { reg_id }
      prisma.result.findUnique.mockResolvedValue({ student_apply_course: { student_id: 1, schedule_id: 1 }});
      // findExamByScheduleId uses prisma.exam_schedule.findUnique
      prisma.exam_schedule.findUnique.mockResolvedValue({ is_result_publish: true });
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 }, reg_id: '1' });
      expect(res.status).toBe(200);
    });

    it('Validations simulation parameters log (Expect 422)', async () => {
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 } }); // No reg_id
      expect(res.status).toBe(422);
    });

    it('Test verifications maps boundaries (Expect 422)', async () => {
      prisma.result.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 }, reg_id: '1' });
      expect(res.status).toBe(422);
    });

    it('Rules maps validity checking (Expect 422)', async () => {
      prisma.result.findUnique.mockResolvedValue({ student_apply_course: { student_id: 2, schedule_id: 1 }}); // Wrong student
      prisma.exam_schedule.findUnique.mockResolvedValue({ is_result_publish: true });
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 }, reg_id: '1' });
      expect(res.status).toBe(422);
    });

    it('Map evaluate mapping variables (Expect 422)', async () => {
      prisma.result.findUnique.mockResolvedValue({ student_apply_course: { student_id: 1, schedule_id: 1 }});
      prisma.exam_schedule.findUnique.mockResolvedValue({ is_result_publish: false }); // not published
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 }, reg_id: '1' });
      expect(res.status).toBe(422);
    });

    it('Error verify simulate logs (Expect 500)', async () => {
      prisma.result.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/student/exam/result').send({ student: { student_id: 1 }, reg_id: '1' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/application/result/:id', () => {
    it('Map variables boundary verification checks (Expect 200)', async () => {
      // findResultByRegistrationId uses prisma.result.findUnique
      prisma.result.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/application/result/1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/courses/result/:id', () => {
    it('Validate values limits verifying checks limits (Expect 200)', async () => {
      prisma.result.count.mockResolvedValue(1);
      prisma.result.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/courses/result/1');
      expect(res.status).toBe(200);
    });

    it('Constraints limit simulates validation (Expect 422)', async () => {
      prisma.result.count.mockResolvedValue(0);
      prisma.result.findMany.mockResolvedValue(null);
      const res = await request(app).get('/api/courses/result/1');
      expect(res.status).toBe(422);
    });

    it('Missing checking verifying boundaries (Expect 500)', async () => {
      prisma.result.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/courses/result/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/download/courses/result/:id', () => {
    it('Map test checks variables (Expect 200)', async () => {
      prisma.result.count.mockResolvedValue(1);
      prisma.result.findMany.mockResolvedValue([{
        result_id: 1,
        student_apply_course_id: 1,
        student_apply_course: {
          student: { first_name: 'Test', last_name: 'User' },
          course: { course_name: 'Math' }
        },
        score: 80,
        course_score: 100,
        course_passing_score: 50,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }]);
      const res = await request(app).get('/api/download/courses/result/1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/students/result/:id', () => {
    it('Checking tracking bounds mapping (Expect 200)', async () => {
      prisma.result.count.mockResolvedValue(1);
      prisma.result.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/students/result/1');
      expect(res.status).toBe(200);
    });

    it('Test values parameters logs (Expect 422)', async () => {
      prisma.result.count.mockResolvedValue(0);
      prisma.result.findMany.mockResolvedValue(null);
      const res = await request(app).get('/api/students/result/1');
      expect(res.status).toBe(422);
    });

    it('Testing verifications evaluating limitations (Expect 500)', async () => {
      prisma.result.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/students/result/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/result', () => {
    it('Simulate evaluating verify checks (Expect 200)', async () => {
      // getCourseScore uses prisma.student_apply_course.findUnique and accesses result.exam_schedule.total_marks
      prisma.student_apply_course.findUnique.mockResolvedValue({
        reg_id: '1',
        exam_schedule: { total_marks: 100, passing_score: 50 }
      });
      // createResult uses prisma.result.upsert
      prisma.result.upsert.mockResolvedValue({ id: 1 });
      const res = await request(app).post('/api/result').send({ admin: true, teacher: { teacher_id: 1 }, data: { student_apply_course_id: 1, score: 75 }});
      expect(res.status).toBe(200);
    });

    it('Logs rules evaluations checks checks (Expect 400)', async () => {
      const res = await request(app).post('/api/result').send({ admin: true, teacher: { teacher_id: 1 }, data: { student_apply_course_id: 1 }}); // no score
      expect(res.status).toBe(400);
    });

    it('Validate validations limit constraints (Expect 403)', async () => {
      const res = await request(app).post('/api/result').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Verification constraint tests limits (Expect 422)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/result').send({ admin: true, teacher: { teacher_id: 1 }, data: { student_apply_course_id: 1, score: 75 }});
      expect(res.status).toBe(422);
    });

    it('Tests verify limits variables map (Expect 500)', async () => {
      prisma.student_apply_course.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/result').send({ admin: true, teacher: { teacher_id: 1 }, data: { student_apply_course_id: 1, score: 75 }});
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/result/:id', () => {
    it('Map limits evaluates mapped evaluate (Expect 200)', async () => {
      // findResultByRegistrationId uses prisma.result.findUnique
      prisma.result.findUnique.mockResolvedValue({ id: 1 });
      prisma.result.update.mockResolvedValue({ id: 1 });
      const res = await request(app).post('/api/result/1').send({ admin: true, data: { score: 90 }});
      expect(res.status).toBe(200);
    });

    it('Testing verifications evaluating checking (Expect 403)', async () => {
      const res = await request(app).post('/api/result/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Limit parameter variables evaluate (Expect 422)', async () => {
      prisma.result.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/result/1').send({ admin: true, data: { score: 90 }});
      expect(res.status).toBe(422);
    });

    it('Log value mapping variable (Expect 500)', async () => {
      prisma.result.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/result/1').send({ admin: true, data: { score: 90 }});
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/result/:id', () => {
    it('Testing evaluating parameters boundaries (Expect 200)', async () => {
      prisma.result.delete.mockResolvedValue({ id: 1 });
      const res = await request(app).delete('/api/result/1').send({ admin: true });
      expect(res.status).toBe(200);
    });

    it('Simulation rules maps limit (Expect 403)', async () => {
      const res = await request(app).delete('/api/result/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Tests constraint evaluating limit (Expect 500)', async () => {
      prisma.result.delete.mockRejectedValue(new Error('err'));
      const res = await request(app).delete('/api/result/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });
});
