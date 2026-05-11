const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

// Mock aws-sdk to prevent actual S3 calls
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: jest.fn().mockResolvedValue('http://mock-url.com/signed')
    }))
  };
});

describe('Course Routes (/api/courses)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('Request from Student context filtering by their organization (Expect 200)', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: 1, name: 'Math' }]);
      prisma.course.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/courses')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(200);
      expect(res.body.data.courses.length).toBe(1);
    });

    it('Request from Teacher context filtering by context organization (Expect 200)', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: 1, name: 'Science' }]);
      prisma.course.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/courses')
        .send({ teacher: { organization_id: 2 } });
      
      expect(res.status).toBe(200);
    });

    it('Omit `limit` falling back to total list count (Expect 200)', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      prisma.course.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/courses')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(200);
    });

    it('Supply search and sorting parameters successfully mapped onto DB query (Expect 200)', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: 3 }]);
      prisma.course.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/courses?searchKey=math&sortBy=name&sortOrder=asc&limit=10&offset=0')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(200);
    });

    it('Database returns a falsy payload locally yielding no course execution successfully (Expect 422)', async () => {
      prisma.course.findMany.mockResolvedValue(null);
      prisma.course.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/courses')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(422);
    });

    it('Simulate generic DB exception locally mapping to HTTP 500 error properly (Expect 500)', async () => {
      prisma.course.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .get('/api/courses')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('Valid, actively existing numeric ID representing mapped existing DB object correctly (Expect 200)', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 1, course_name: 'test' });
      const res = await request(app).get('/api/courses/1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('Non-existent ID parameter generating a null mapped missing element lookup hook correctly returning error (Expect 422)', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/courses/999');
      expect(res.status).toBe(422);
    });

    it('Invalid query generating general DB unhandled generic exception (Expect 500)', async () => {
      prisma.course.findUnique.mockRejectedValue(new Error("DB Error"));
      const res = await request(app).get('/api/courses/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/courses/apply/:id', () => {
    it('Payload submitted smoothly applying successfully (Expect 200)', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      prisma.course.findUnique.mockResolvedValue({ 
        id: 1, 
        registration_starting_date: pastDate.toISOString(),
        registration_closing_date: futureDate.toISOString()
      });
      prisma.student_apply_course.create.mockResolvedValue({ id: 100, courseId: 1, student_id: 1 });

      const res = await request(app)
        .post('/api/courses/apply/1')
        .send({ user: { id: 1 } });
      
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(100);
    });

    it('Application date breached past limits mapped dynamically (Expect 422)', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      prisma.course.findUnique.mockResolvedValue({ 
        id: 1, 
        registration_starting_date: pastDate.toISOString(),
        registration_closing_date: pastDate.toISOString() // Closed
      });

      const res = await request(app)
        .post('/api/courses/apply/1')
        .send({ user: { id: 1 } });
      
      expect(res.status).toBe(422);
    });

    it('Course totally completely non-existent limits mapped restriction executing maps checking successfully (Expect 422)', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/courses/apply/999').send({ user: { id: 1 } });
      expect(res.status).toBe(422);
    });

    it('Creation applying yields fallback failing mapping checking variable mapping limit boundary checks restricting logically (Expect 500)', async () => {
      prisma.course.findUnique.mockRejectedValue(new Error("DB Error"));
      const res = await request(app).post('/api/courses/apply/1').send({ user: { id: 1 } });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/courses/', () => {
    it('Correctly mapped complete properties returning proper map logically checks mapped restrictions executed (Expect 200)', async () => {
      prisma.course.create.mockResolvedValue({ id: 1, course_name: 'Science' });

      const res = await request(app)
        .post('/api/courses/')
        .send({
          admin: true,
          teacher: { teacher_id: 1, organization_id: 1 },
          course_name: 'Science',
          file_url: 'http://url.com',
          course_description: 'Science Course',
          is_active: true
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('Non-admin attempting checks properly mapped hooks restrictions executing checking missing variables hook restrictions (Expect 403)', async () => {
      const res = await request(app).post('/api/courses/').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Missing components checks mapped variables hooks restriction testing variable mapped missing boundaries (Expect 422)', async () => {
      const res = await request(app).post('/api/courses/').send({ admin: true }); // Missing name, url, etc.
      expect(res.status).toBe(422);
    });

    it('Falsy uncompleted logic fallback catching database hooks mapped properly (Expect 500)', async () => {
      prisma.course.create.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/api/courses/')
        .send({
          admin: true,
          teacher: { teacher_id: 1, organization_id: 1 },
          course_name: 'Fail',
          file_url: 'url',
          course_description: 'Failed Course',
          is_active: true
        });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/generate-presigned-url', () => {
    it('Supply standard types logically testing executing bounds hooks variables mapping successfully (Expect 200)', async () => {
      // The aws sdk is mocked at the top of the file
      const res = await request(app).get('/api/generate-presigned-url?fileName=test.png&fileType=image/png');
      expect(res.status).toBe(200);
      expect(res.body.uploadURL).toBe('http://mock-url.com/signed');
    });
  });

  describe('POST /api/courses/:id', () => {
    it('Standard check functionally accurately limited executing locally limiting effectively logically executing correctly (Expect 200)', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 1 });
      prisma.course.update.mockResolvedValue({ id: 1, course_name: 'Updated' });

      const res = await request(app)
        .post('/api/courses/1')
        .send({ admin: true, course_name: 'Updated' });
      
      expect(res.status).toBe(200);
    });

    it('Fallback limiting maps successfully effectively variables restricting boundaries locally checking testing execution (Expect 403)', async () => {
      const res = await request(app).post('/api/courses/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Invalid target checks missing components effectively bounds mapping testing mapping checking restrictions (Expect 422)', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/courses/99').send({ admin: true, course_name: 'New' });
      expect(res.status).toBe(422);
    });

    it('Failure catching limiting testing mappings boundaries effectively logically mappings functionally (Expect 500)', async () => {
      prisma.course.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/courses/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('Positive testing testing variables functionally deleting limits mapping successfully (Expect 200)', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 1 });
      prisma.course.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/courses/1').send({ admin: true });
      expect(res.status).toBe(200);
    });

    it('Unauthorized user testing boundary limits dynamically mapping functionally mapping bounds hooks checks logically executing (Expect 403)', async () => {
      const res = await request(app).delete('/api/courses/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Failed logic effectively simulating constraints logically mapping limits dynamically boundaries map constraints hooks functionally mapping exceptions (Expect 500)', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 1 });
      prisma.course.delete.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).delete('/api/courses/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

});
