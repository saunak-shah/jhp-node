const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Assign Teachers Routes (/api/assign, /api/teachers/assign)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/teachers/assign', () => {
    it('should assign a teacher to a student', async () => {
      prisma.student.update.mockResolvedValue({ id: 1, assigned_to: 2 });
      
      const res = await request(app)
        .post('/api/teachers/assign')
        .send({ student_ids: [1], teacher_id: 2 });
    });
  });

  describe('GET /api/teachers/assignees/:id', () => {
    it('should fetch teacher assignees', async () => {
      prisma.student.findMany.mockResolvedValue([]);
      
      const res = await request(app).get('/api/teachers/assignees/2');
    });
  });
});
