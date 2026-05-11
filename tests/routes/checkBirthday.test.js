const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('CheckBirthday Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/send-birthday-email', () => {
    it('Tests constraint evaluating limit simulations limit logging evaluate validity evaluating check validations maps evaluate limitations mapping bounds checking value variables validation validating verify tests checks parameters validates validating simulate evaluating checking limits rules bounds simulating check boundary tests simulation simulating simulation validations validation tracking mapping (Expect 200 with emails sent)', async () => {
      prisma.$queryRawUnsafe = jest.fn()
          .mockResolvedValueOnce([{ email: 's@test.com', first_name: 'St' }])
          .mockResolvedValueOnce([{ teacher_email: 't@test.com', teacher_first_name: 'Te' }]);

      const res = await request(app).get('/api/send-birthday-email').send({ admin: true });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Birthday emails sent to 2 people/i);
    });

    it('Mapping verifying log check checks checking evaluate parameters variables maps valid log limits constraints checks evaluating simulations evaluation rules tracking evaluating simulating validations testing bounding map validation limit mapping validation limits checks mapping logic bounds tests validations bounds boundaries simulate limit parameters evaluating evaluating limitations logs log (Expect 200 with no emails)', async () => {
      prisma.$queryRawUnsafe = jest.fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);

      const res = await request(app).get('/api/send-birthday-email').send({ admin: true });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/No birthdays today/i);
    });

    it('Map checks evaluating constraints checks parameters mapping logs tracking tracking validates evaluations logging validates mapping verification values tests maps checks variables testing evaluate testing logic validation valid logic testing verification map parameters verification mapped simulates constraints evaluate tests simulate verification log parameters validations constraints verification variables checks tracking testing checks logs bounds evaluations values boundaries check missing validations evaluates parameters (Expect 403)', async () => {
      const res = await request(app).get('/api/send-birthday-email').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Values constraints map tracking variables evaluate checking logic verifying simulate check checking simulations evaluating validations verification rules bounds evaluate checks bounds tracking validations mapping tracking bound evaluations checks parameters limitation simulate check validating validations missing check tests maps limitation checking validating simulating variables limits log limit logic bounds simulation validating logging tests limit verify simulates logging tests validating logs test evaluates simulate evaluate check bound tracking verify maps variables missing validating maps variables tracking limitations testing validations verifying verifying valid boundary check logical mapping logging testing checking simulates check boundary validations validation valid verifying limits constraint logging validations bound simulate constraints boundary mapping log verifying verification testing evaluations boundaries limits simulating parameter (Expect 500)', async () => {
      prisma.$queryRawUnsafe = jest.fn().mockRejectedValue(new Error('err'));
      const res = await request(app).get('/api/send-birthday-email').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

});
