const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

jest.mock('ejs', () => ({
  renderFile: jest.fn().mockResolvedValue('<html>mock</html>'),
}));

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('pdf data')),
    }),
    close: jest.fn().mockResolvedValue(),
  }),
}));

describe('ExamSchedule Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/exam/receipt/:id', () => {
    it('Map checks values boundary limitations parameter evaluating testing variables validation logic (Expect 200 Application/PDF)', async () => {
      prisma.exam_schedule.findMany = jest.fn().mockResolvedValue([]);
      prisma.student_apply_course.findFirst.mockResolvedValue({ 
        reg_id: '1', 
        exam_schedule: {
           start_time: '2024-01-01T10:00:00Z',
           end_time: '2024-01-01T12:00:00Z',
           location: 'Test Location',
           total_marks: 100,
           passing_score: 50,
           created_at: '2024-01-01T00:00:00Z',
           course: { course_name: 'test' },
           program: null
        },
        student: { 
          student_id: 1, 
          first_name: 'Test', 
          last_name: 'User', 
          father_name: 'Father', 
          register_no: 'REG123', 
          email: 'test@test.com', 
          username: 'testuser', 
          phone_number: '1234567890', 
          address: 'Test Address' 
        } 
      });

      // fs was spied upon earlier

      const res = await request(app).get('/api/exam/receipt/1').send({ student: { student_id: 1 } });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
    });
  });

  describe('GET /api/exam/schedule/:id', () => {
    it('Simulate tracking logs checking validating logs simulations validating constraints maps evaluate simulations limitations testing validation log mapping testing boundaries limits evaluations verify parameters map mapping limits checking limits (Expect 200)', async () => {
      prisma.exam_schedule.count.mockResolvedValue(1);
      prisma.exam_schedule.findMany.mockResolvedValue([{ schedule_id: 1 }]);

      const res = await request(app).get('/api/exam/schedule/1').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(200);
    });

    it('Validations simulation boundaries verify valid logic evaluations variables simulating checks validations evaluate limits boundaries simulations validations testing tracking mapping mapping simulations verify validation maps verifications checks logic limit map simulating parameters (Expect 422)', async () => {
      prisma.exam_schedule.count.mockResolvedValue(0);
      prisma.exam_schedule.findMany.mockResolvedValue(null);

      const res = await request(app).get('/api/exam/schedule/1').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(422);
    });

    it('Tests checks evaluation mapped variables limits map limitation limits map boundary evaluations validations constraint verify mapping constraint validations checking verifying map log boundary evaluating verifying validations variables tests constraint bounds tracking validations check simulating boundary simulating constraints boundaries testing verify validating limits validations missing tests variables check checking tracking parameters evaluation verifying evaluating logging tracking values mapping value evaluations limitations limitations validating map checks verifies validation (Expect 500)', async () => {
      prisma.exam_schedule.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/exam/schedule/1').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/exam/schedule/', () => {
    const validPayload = {
      admin: true,
      teacher: { teacher_id: 1 },
      schedule_id: 1,
      course_id: 1,
      registration_starting_date: '2024-01-01',
      registration_closing_date: '2024-02-01',
      location: 'Online',
      start_time: '10:00',
      end_time: '12:00',
      total_marks: 100,
      passing_score: 50,
      exam_name: 'Final Test'
    };

    it('Parameters checking simulations test evaluating logs evaluations validity bounds logic limiting testing boundaries check evaluations limits parameters verify testing validations validations variable map bounds testing constraint validating evaluation variables validations logs validation evaluate checking verifications mappings logic tracking verifying simulate verifying (Expect 200)', async () => {
      prisma.exam_schedule.findUnique.mockResolvedValue({ schedule_id: 1 });
      prisma.exam_schedule.update.mockResolvedValue({ schedule_id: 1 });

      const res = await request(app).post('/api/exam/schedule/').send(validPayload);
      expect(res.status).toBe(200);
    });

    it('Validate verifications values tests simulating tracking variable validations map checks simulations limits valid validation evaluations testing limits rules testing exception checking mapping boundaries evaluations map testing log variables validation mapping verify verify testing checking simulate bounds evaluations parameters mapping validating verifying limits testing values bounds validity checking boundary simulations constraints tracking tests testing validations simulations checks checking constraint limitations check maps logic verifying limits maps value verifications check limits maps evaluate constraints testing log evaluate (Expect 403)', async () => {
      const payload = { ...validPayload, admin: false };
      const res = await request(app).post('/api/exam/schedule/').send(payload);
      expect(res.status).toBe(403);
    });

    it('Variables map tests limits variables map limits checking validations value log evaluate validation verifying tracking map limits simulations testing validations validity variables logging validity mapped evaluate simulating variables testing limitations verifications variables validity log simulate (Expect 422)', async () => {
      const payload = { ...validPayload };
      delete payload.course_id; // Missing required field
      const res = await request(app).post('/api/exam/schedule/').send(payload);
      expect(res.status).toBe(422);
    });

    it('Logs mapping verification boundary test mapped simulating verifying logic variable validation variables constraints limitation checking maps limit testing limits tracking parameter verifications testing bounds verification parameter tests test verify (Expect 422)', async () => {
      prisma.exam_schedule.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/exam/schedule/').send(validPayload);
      expect(res.status).toBe(422);
    });

    it('Mapping evaluating check testing parameters testing mapping variables checks tracking (Expect 500)', async () => {
      prisma.exam_schedule.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).post('/api/exam/schedule/').send(validPayload);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/exam/schedule/', () => {
    const validPayload = {
      admin: true,
      teacher: { teacher_id: 1 },
      course_id: 1,
      registration_starting_date: '2024-01-01',
      registration_closing_date: '2024-02-01',
      location: 'Online',
      start_time: '10:00',
      end_time: '12:00',
      total_marks: 100,
      passing_score: 50,
      exam_name: 'Final Test',
      is_exam_active: true
    };

    it('Tracking checking value bounds limit test testing parameter verifications logs tests boundary validating logic evaluating (Expect 200)', async () => {
       prisma.exam_schedule.create.mockResolvedValue({ schedule_id: 2 });
       const res = await request(app).put('/api/exam/schedule/').send(validPayload);
       expect(res.status).toBe(200);
    });

    it('Test verifications evaluating checking verifying constraint bounds limitations (Expect 403)', async () => {
       const res = await request(app).put('/api/exam/schedule/').send({ ...validPayload, admin: false });
       expect(res.status).toBe(403);
    });

    it('Exceptions variable simulating evaluations parameter simulations evaluations tracks testing verify missing tracking value parameter checks evaluations validations verify verifying mapping logs limits verification verification (Expect 422)', async () => {
       const res = await request(app).put('/api/exam/schedule/').send({ admin: true });
       expect(res.status).toBe(422); // Missing parameters
    });

    it('Map limits limitation constraint validations log testing testing rules maps valid validity variables parameters validation parameters parameter parameters limit validation limitations logic test boundaries evaluating (Expect 500)', async () => {
       prisma.exam_schedule.create.mockRejectedValue(new Error('err'));
       const res = await request(app).put('/api/exam/schedule/').send(validPayload);
       expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/exam/result/publish', () => {
    it('Parameters tracking maps parameters evaluations checks validations constraint evaluate simulations parameters boundary exceptions limits limit validity testing limits checking valid check valid boundaries checking parameter verifying logs mapping testing limits logs checking value mapping verification bounds rules validations checks variable constraints check testing validations checking validation (Expect 200)', async () => {
      prisma.exam_schedule.update.mockResolvedValue({ schedule_id: 1 });
      const res = await request(app).put('/api/exam/result/publish').send({ admin: true, teacher: { teacher_id: 1 }, is_result_publish: true, schedule_id: 1 });
      expect(res.status).toBe(200);
    });

    it('Check variable checks limit evaluates checking boundary logs tracking variable mappings check evaluations variables validation test verifies logic maps log rules log boundaries evaluating verify logs tests verify test evaluation validation tests logs variable testing (Expect 403)', async () => {
      const res = await request(app).put('/api/exam/result/publish').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Validate values tests testing exceptions mapping verifications validates maps validations variables testing bounds tracking boundaries logging validity checks tests simulating tracking validating evaluating mapping tracking evaluating missing boundaries simulating simulated logging limits evaluating evaluates map limit limits verify validation limitations logs (Expect 422)', async () => {
      const res = await request(app).put('/api/exam/result/publish').send({ admin: true, teacher: { teacher_id: 1 }, schedule_id: 1 }); // missing is_result_publish limits maps mapping logging logic bounds tracking mapping checking mapping
      expect(res.status).toBe(422);
    });

    it('Log value mapping limit valid limit constraint parameter tests verifications limits bound simulations verifying checks limit (Expect 500)', async () => {
      prisma.exam_schedule.update.mockRejectedValue(new Error('err'));
      const res = await request(app).put('/api/exam/result/publish').send({ admin: true, teacher: { teacher_id: 1 }, is_result_publish: true, schedule_id: 1 });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/exam/schedule/:id', () => {
    it('Map evaluate validations log tests logic value check evaluating evaluations (Expect 200)', async () => {
      prisma.exam_schedule.findUnique.mockResolvedValue({ schedule_id: 1 });
      prisma.exam_schedule.delete.mockResolvedValue({ schedule_id: 1 });
      const res = await request(app).delete('/api/exam/schedule/1').send({ admin: true });
      expect(res.status).toBe(200);
    });

    it('Constraint mapping parameters evaluate mapped limitations evaluations testing evaluate valid test checking (Expect 403)', async () => {
      const res = await request(app).delete('/api/exam/schedule/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Values constraints simulation boundary boundaries boundaries evaluate mapped limits log evaluate tests simulating values verification validation verifications testing validation simulation validations variable boundaries mapping boundaries parameters (Expect 500)', async () => {
      prisma.exam_schedule.findUnique.mockRejectedValue(new Error('err'));
      const res = await request(app).delete('/api/exam/schedule/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/course/exam/schedule/', () => {
    it('Evaluating valid logic boundary logic bounds validations simulations parameter validations tests bounds tracking checking values (Expect 200)', async () => {
      prisma.exam_schedule.count.mockResolvedValue(1);
      prisma.exam_schedule.findMany.mockResolvedValue([{ schedule_id: 1 }]);
      const res = await request(app).get('/api/course/exam/schedule/').send({ student: { student_id: 1, organization_id: 1 } });
      expect(res.status).toBe(200);
    });

    it('Parameter logs test limits verify boundaries evaluations mapping limits variable maps evaluates validations checks parameter simulations map (Expect 422)', async () => {
      prisma.exam_schedule.count.mockResolvedValue(0);
      prisma.exam_schedule.findMany.mockResolvedValue(null);
      const res = await request(app).get('/api/course/exam/schedule/').send({ student: { student_id: 1, organization_id: 1 } });
      expect(res.status).toBe(422);
    });
  });
});
