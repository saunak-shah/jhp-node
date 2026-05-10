const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Group Routes (/api/group)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/group', () => {
    it('should fetch groups', async () => {
      prisma.group.findMany.mockResolvedValue([]);
      prisma.group.count.mockResolvedValue(0);

      const res = await request(app).get('/api/group');
      // Verify behavior
    });
  });

  describe('POST /api/group', () => {
    it('should create group successfully', async () => {
      prisma.group.create.mockResolvedValue({ group_id: 1, group_name: 'Alpha' });

      const res = await request(app)
        .post('/api/group')
        .send({
          group_name: 'Alpha',
          teacher_ids: [1, 2]
          // Missing test values will be checked if failure happens
        });
    });
  });
});
