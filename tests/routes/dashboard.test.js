const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Dashboard Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/teachers/count', () => {
    it('Map checks values maps limits limitation simulating simulate testing rules evaluate constraints map parameters mappings boundaries mapping check parameters logs verification check boundaries testing evaluating bounds mapping evaluation checks tracking verifying tests validation validating constraints mapping testing validations limit verifications log checking evaluating validity mapping evaluating mapping values verify simulating limits bounds tracking testing tests bounding mapping (Expect 200)', async () => {
      prisma.teacher.count.mockResolvedValue(10);
      const res = await request(app).get('/api/dashboard/teachers/count').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(200);
      expect(res.body.data.totalCount).toBe(10);
    });

    it('Testing verifications evaluating limitations tests validations constraint mapping bounding values evaluates limits logs checking verification validation verifying tests simulation evaluate evaluating boundaries log limit logic simulations limiting (Expect 500)', async () => {
      prisma.teacher.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/dashboard/teachers/count').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/dashboard/students/count', () => {
    it('Mapping evaluating variables verify tracking limit limitation values check boundary simulate simulating tracking parameters mapping evaluates tests logic mappings logic bounds variables mapping map parameters verification validations verify tests verifications bounds valid constraints maps map variables (Expect 200)', async () => {
      prisma.student.count.mockResolvedValue(100);
      const res = await request(app).get('/api/dashboard/students/count').send({ teacher: { organization_id: 1 } });
      expect(res.status).toBe(200);
      expect(res.body.data.totalCount).toBe(100);
    });

    it('Evaluates checks limits boundaries testing verifications checking map tracking logical parameter verifications simulated limitations log evaluating verify tests evaluate evaluate testing check boundaries values mapping boundaries tracking boundaries evaluate log values boundary simulation maps validation simulates boundary testing verify checking check constraint simulate verify evaluating value verifications validation constraints missing validation maps valid evaluating simulating (Expect 500)', async () => {
      prisma.student.count.mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/dashboard/students/count').send({ student: { organization_id: 1 } });
      expect(res.status).toBe(500);
    });
  });

});
