const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Exam Schedule Routes (/api/exam/schedule)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/exam/schedule/:id', () => {
    it('should list schedules by course ID', async () => {
      prisma.examSchedule.findMany.mockResolvedValue([{ id: 1, marks: 100 }]);

      const res = await request(app).get('/api/exam/schedule/1');

      // Middleware might block it if token relies on valid headers.
      // We will adjust based on whether auth blocks or proceeds.
    });
  });
});
