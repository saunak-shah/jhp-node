const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Organization Routes (/api/organization)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/organization', () => {
    it('should fetch organizations list', async () => {
      prisma.organization.findMany.mockResolvedValue([{ id: 1, name: 'Org' }]);
      prisma.organization.count.mockResolvedValue(1);

      const res = await request(app).get('/api/organization');
    });
  });
});
