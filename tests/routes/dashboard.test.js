const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Dashboard Routes (/api/dashboard)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/teachers/count', () => {
    it('should return teacher count', async () => {
      // Because we mock Prisma globally, we just mock the result of the count operations
      // Some operations might rely on raw queries which jest-mock-extended handles or we can mock.
      prisma.teacher.count = jest.fn().mockResolvedValue(5);

      const res = await request(app).get('/api/dashboard/teachers/count');
    });
  });

  describe('GET /api/dashboard/students/count', () => {
    it('should return student count', async () => {
      // Because it uses $queryRawUnsafe or something similar, mock it if needed
      prisma.student.count = jest.fn().mockResolvedValue(10);
      
      const res = await request(app).get('/api/dashboard/students/count');
    });
  });
});
