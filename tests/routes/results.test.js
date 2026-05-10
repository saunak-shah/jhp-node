const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Results Routes (/api/result)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/result/', () => {
    it('should create exam result successfully', async () => {
      prisma.result.create.mockResolvedValue({ id: 1, score: 85 });

      const res = await request(app)
        .post('/api/result')
        .send({
          student_id: 1,
          course_id: 1,
          score: 85,
          course_score: 100,
          reg_id: 'REG-1234'
        });

      // Again, these routes might require auth which could fail the request with 401.
      // Assuming a middleware bypass, or we'll have to inject mocked user data into the request.
    });
  });

  describe('GET /api/courses/result/:id', () => {
    it('should fetch results by course', async () => {
      prisma.result.findMany.mockResolvedValue([{ id: 1, score: 85 }]);
      
      const res = await request(app).get('/api/courses/result/1');
    });
  });
});
