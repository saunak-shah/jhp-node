const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Apply For Courses Routes (/api/register, /api/registrations)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/registrations/check', () => {
    it('should check if registration exists', async () => {
      prisma.studentApplyCourse.findMany.mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get('/api/registrations/check?student_id=1&course_id=1');
      // Verify behavior
    });
  });
});
