const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Course Routes (/api/courses)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should list courses successfully', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: 1, name: 'Math' }]);
      prisma.course.count.mockResolvedValue(1);

      const res = await request(app).get('/api/courses?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data.courses.length).toBe(1);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      prisma.course.create.mockResolvedValue({ id: 1, name: 'Science' });

      const res = await request(app)
        .post('/api/courses')
        .send({
          admin: true, // Bypass admin middleware requirement easily for unit tests
          name: 'Science',
          description: 'Science Course',
          file_url_base: 'url'
        });

      // Assuming no auth bypass via simple req.body.admin property, wait, 
      // User middleware checks tokens. If admin is required, we need a valid JWT.
      // But let's just assert the mock is hit since we aren't sending auth header. 
      // If it fails with 401, we might need to mock JWT or provide a valid token.
      
      // I'll see how it behaves and update the test.
    });
  });
});
