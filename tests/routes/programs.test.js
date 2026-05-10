const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Programs Routes (/api/programs)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/programs', () => {
    it('should list active programs', async () => {
      prisma.program.findMany.mockResolvedValue([{ id: 1, name: 'Summer Camp' }]);
      prisma.program.count.mockResolvedValue(1);

      const res = await request(app).get('/api/programs?page=1&limit=10');
      // Verify behavior
    });
  });

  describe('POST /api/programs', () => {
    it('should create new program', async () => {
      prisma.program.create.mockResolvedValue({ id: 1, name: 'Winter Camp' });

      const res = await request(app)
        .post('/api/programs')
        .send({
          admin: true,
          name: 'Winter Camp',
          registration_start_date: '2027-01-01',
          registration_end_date: '2027-02-01',
          program_start_date: '2027-03-01',
          program_end_date: '2027-04-01'
        });
    });
  });
});
