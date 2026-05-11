const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('ApplyForCourses Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/registrations', () => {
    it('should fetch all registrations (Expect 200)', async () => {
      prisma.student_apply_course.count.mockResolvedValue(1);
      prisma.student_apply_course.findMany.mockResolvedValue([{ id: 1 }]);
      
      const res = await request(app).get('/api/registrations');
      
      expect(res.status).toBe(200);
      expect(res.body.data.registrations.length).toBe(1);
    });

    it('should return 422 securely if registrations returns falsy', async () => {
      prisma.student_apply_course.count.mockResolvedValue(0);
      prisma.student_apply_course.findMany.mockResolvedValue(null);
      
      const res = await request(app).get('/api/registrations');
      expect(res.status).toBe(422);
    });

    it('should map DB failure to 500 error gracefully', async () => {
      prisma.student_apply_course.count.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/registrations');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/registrations/check', () => {
    it('Fetches check validation successfully (Expect 200)', async () => {
      prisma.student_apply_course.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/registrations/check?courseId=1&studentId=1');
      expect(res.status).toBe(200);
    });

    it('No existing mapping mapping successfully testing 422 restriction', async () => {
      prisma.student_apply_course.findMany.mockResolvedValue(null);
      const res = await request(app).get('/api/registrations/check?courseId=1&studentId=1');
      expect(res.status).toBe(422);
    });

    it('Error simulation internally caught mapping limits restriction to 500', async () => {
      prisma.student_apply_course.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/registrations/check?courseId=1&studentId=1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/registrations/:id', () => {
    it('Fetches application seamlessly (Expect 200)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue({ id: 1 });
      const res = await request(app).get('/api/registrations/1');
      expect(res.status).toBe(200);
    });

    it('Fetches null application mapped check validation (Expect 422)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/registrations/999');
      expect(res.status).toBe(422);
    });

    it('Testing DB constraints hook exception mapping (Expect 500)', async () => {
      prisma.student_apply_course.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/registrations/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/students/registrations/:id', () => {
    it('Student mapped fetches logically (Expect 200)', async () => {
      prisma.student_apply_course.count.mockResolvedValue(1);
      prisma.student_apply_course.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/students/registrations/1');
      expect(res.status).toBe(200);
    });

    it('Validations checks maps boundaries (Expect 422)', async () => {
      prisma.student_apply_course.count.mockResolvedValue(0);
      prisma.student_apply_course.findMany.mockResolvedValue(null);
      const res = await request(app).get('/api/students/registrations/1');
      expect(res.status).toBe(422);
    });

    it('Logs errors testing validations (Expect 500)', async () => {
      prisma.student_apply_course.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/students/registrations/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/courses/registrations/:id', () => {
    it('Course target parameters bounds executing (Expect 200)', async () => {
      prisma.student_apply_course.count.mockResolvedValue(1);
      prisma.student_apply_course.findMany.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get('/api/courses/registrations/1');
      expect(res.status).toBe(200);
    });

    it('Logic constraints check constraints mapped (Expect 500)', async () => {
      prisma.student_apply_course.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/courses/registrations/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/download/courses/registrations/:id', () => {
    it('Course download payload target evaluates properly (Expect 200)', async () => {
      prisma.student_apply_course.count.mockResolvedValue(1);
      // getAllApplicationsByCourseIdToDownload accesses .student.first_name, .course.course_name, etc.
      prisma.student_apply_course.findMany.mockResolvedValue([
        {
          student_apply_course_id: 1,
          reg_id: 'REG1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          student: { first_name: 'Test', last_name: 'User', father_name: 'Father', phone_number: '123', email: 'a@b.com', gender: 'M', register_no: 'R001' },
          course: { course_name: 'Math' },
          exam_schedule: { exam_name: 'Exam 1', start_time: '10:00', end_time: '12:00', total_marks: 100, passing_score: 50 },
          result: [{ score: 80 }]
        }
      ]);
      const res = await request(app).get('/api/download/courses/registrations/1');
      expect(res.status).toBe(200);
    });
    
    it('Simulated boundaries testing constraints (Expect 500)', async () => {
       prisma.student_apply_course.count.mockRejectedValue(new Error('err'));
       const res = await request(app).get('/api/download/courses/registrations/1');
       expect(res.status).toBe(500);
    });
  });

  describe('POST /api/register/', () => {
    it('Values missing tests evaluate map log (Expect 422)', async () => {
      const res = await request(app).post('/api/register/').send({ course_id: null });
      expect(res.status).toBe(422);
    });

    it('Limits boundary tracking verify check (Expect 422)', async () => {
      // findAppliedCourseWithScheduleId uses prisma.student_apply_course.findMany
      prisma.student_apply_course.findMany.mockResolvedValue([
        { result: [{ score: 100, course_passing_score: 50 }] }
      ]);
      const res = await request(app).post('/api/register/').send({ course_id: 1, schedule_id: 1, student: { student_id: 1 } });
      expect(res.status).toBe(422);
      expect(res.body.message).toMatch(/already passed/i);
    });

    it('Validations variables mapping validation (Expect 200)', async () => {
      // First findMany call is for findAppliedCourseWithScheduleId - no previous exams
      // Second findMany call is for getAllApplicationsByUserIdAndCourseId - no existing registration
      prisma.student_apply_course.findMany.mockResolvedValue([]);
      
      const future1 = new Date(); future1.setFullYear(future1.getFullYear() + 1);
      const past1 = new Date(); past1.setFullYear(past1.getFullYear() - 1);
      
      // findExamByScheduleId uses prisma.exam_schedule.findUnique
      prisma.exam_schedule.findUnique.mockResolvedValue({ 
        registration_starting_date: past1,
        registration_closing_date: future1 
      });
      prisma.student_apply_course.create.mockResolvedValue({ reg_id: 'test_id' });

      const res = await request(app).post('/api/register/').send({ course_id: 1, schedule_id: 1, student: { student_id: 1 } });
      expect(res.status).toBe(200);
    });

    it('Constraint mapping limit verify parameter (Expect 500)', async () => {
      prisma.student_apply_course.findMany.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/register/').send({ course_id: 1, schedule_id: 1, student: { student_id: 1 } });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/exam/registration/:id', () => {
    it('Map mapping limits map simulation (Expect 200)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue({ student_id: 1, student_apply_course_id: 1 });
      prisma.student_apply_course.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/exam/registration/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(200);
    });

    it('Verify values verify map values (Expect 403)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue({ student_id: 2 });
      const res = await request(app).delete('/api/exam/registration/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(403);
    });

    it('Testing checks simulation evaluate (Expect 204)', async () => {
      prisma.student_apply_course.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/api/exam/registration/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(204);
    });

    it('Valid testing evaluate simulates (Expect 500)', async () => {
      prisma.student_apply_course.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).delete('/api/exam/registration/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(500);
    });
  });

});
