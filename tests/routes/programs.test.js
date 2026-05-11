const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Program Routes (/api/programs)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/programs', () => {
    it('should list active programs', async () => {
      prisma.program.findMany.mockResolvedValue([{ id: 1, program_name: 'Prog 1' }]);
      prisma.program.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/programs')
        .send({ student: { organization_id: 1 } });
      
      expect(res.status).toBe(200);
      expect(res.body.data.programs.length).toBe(1);
    });

    it('Student context querying for active programs (Expect 200)', async () => {
      prisma.program.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.program.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/programs?is_program_active=true&limit=10')
        .send({ student: { organization_id: 1, student_id: 1 } });
        
      expect(res.status).toBe(200);
    });

    it('Admin context querying explicit search limits (Expect 200)', async () => {
      prisma.program.findMany.mockResolvedValue([{ id: 2 }]);
      prisma.program.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/programs?searchKey=test&limit=5')
        .send({ teacher: { organization_id: 1 } });
        
      expect(res.status).toBe(200);
    });

    it('Pagination limit omitted directly defaulting to global counts (Expect 200)', async () => {
      prisma.program.findMany.mockResolvedValue([]);
      prisma.program.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/programs')
        .send({ teacher: { organization_id: 1 } });
        
      expect(res.status).toBe(200);
    });

    it('Generic unhandled exceptions causing DB restrictions check (Expect 500)', async () => {
      prisma.program.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .get('/api/programs')
        .send({ student: { organization_id: 1 } });
        
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/programs/:id', () => {
    it('Specific numeric ID representing available mapped DB row (Expect 200)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1, program_name: 'test' });
      const res = await request(app).get('/api/programs/1');
      expect(res.status).toBe(200);
    });

    it('Non-existent mapping querying blank elements evaluating check restrictions limit (Expect 422)', async () => {
      prisma.program.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/programs/999');
      expect(res.status).toBe(422);
    });

    it('DB internal variable mapping bound checks constraints limit hooks checking mapped variable (Expect 500)', async () => {
      prisma.program.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/programs/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/programs/', () => {
    const validPayload = () => {
      const future1 = new Date(); future1.setFullYear(future1.getFullYear() + 1);
      const future2 = new Date(); future2.setFullYear(future2.getFullYear() + 2);
      const future3 = new Date(); future3.setFullYear(future3.getFullYear() + 3);
      const future4 = new Date(); future4.setFullYear(future4.getFullYear() + 4);

      return {
        admin: true,
        teacher: { teacher_id: 1, organization_id: 1 },
        program_name: 'Test',
        file_url: 'url',
        program_description: 'Desc',
        registration_starting_date: future1.toISOString(),
        registration_closing_date: future2.toISOString(),
        program_location: 'Location',
        program_starting_date: future3.toISOString(),
        program_ending_date: future4.toISOString(),
        is_program_active: true
      };
    };

    it('Admin user passing fully validated parameter schema effectively (Expect 200)', async () => {
      prisma.program.create.mockResolvedValue({ id: 1 });
      const res = await request(app).post('/api/programs/').send(validPayload());
      expect(res.status).toBe(200);
    });

    it('Unauthorised execution check mapped missing user hook checking logically bounds (Expect 403)', async () => {
      const payload = validPayload();
      payload.admin = false;
      const res = await request(app).post('/api/programs/').send(payload);
      expect(res.status).toBe(403);
    });

    it('Validation omitting standard strings simulating bounds variable variables (Expect 422)', async () => {
      const payload = validPayload();
      delete payload.program_name;
      const res = await request(app).post('/api/programs/').send(payload);
      expect(res.status).toBe(422);
    });

    it('Payload checking date validation mapping variables checks logically (Expect 422)', async () => {
      const payload = validPayload();
      // Registration start in past
      const past = new Date(); past.setFullYear(past.getFullYear() - 1);
      payload.registration_starting_date = past.toISOString();
      const res = await request(app).post('/api/programs/').send(payload);
      expect(res.status).toBe(422);
    });

    it('Start bound logically simulating end bounds checks bounds functionally variables (Expect 422)', async () => {
      const payload = validPayload();
      // start > end
      const temp = payload.registration_starting_date;
      payload.registration_starting_date = payload.registration_closing_date;
      payload.registration_closing_date = temp;
      const res = await request(app).post('/api/programs/').send(payload);
      expect(res.status).toBe(422);
    });

    it('Simulated internal checking limitations bounds limitation constraints mapping (Expect 500)', async () => {
      prisma.program.create.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/programs/').send(validPayload());
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/programs/:id', () => {
    const validUpdatePayload = () => {
      const future1 = new Date(); future1.setFullYear(future1.getFullYear() + 1);
      const future2 = new Date(); future2.setFullYear(future2.getFullYear() + 2);
      const future3 = new Date(); future3.setFullYear(future3.getFullYear() + 3);
      const future4 = new Date(); future4.setFullYear(future4.getFullYear() + 4);

      return {
        admin: true,
        teacher: { teacher_id: 1, organization_id: 1 },
        program_name: 'Test',
        file_url: 'url',
        program_description: 'Desc',
        registration_starting_date: future1.toISOString(),
        registration_closing_date: future2.toISOString(),
        program_location: 'Location',
        program_starting_date: future3.toISOString(),
        program_ending_date: future4.toISOString(),
        is_program_active: true
      };
    };

    it('Standard modification execution logic limits bounded evaluating limits (Expect 200)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1, file_url: 'old_url' });
      prisma.program.update.mockResolvedValue({ id: 1, program_name: 'Updated' });

      const res = await request(app)
        .post('/api/programs/1')
        .send(validUpdatePayload());
      
      expect(res.status).toBe(200);
    });

    it('Target non-existent exceptions tests checking maps mapping variables maps (Expect 404)', async () => {
      prisma.program.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/programs/999').send({ admin: true });
      expect(res.status).toBe(404);
    });

    it('Insufficient checking bounds limitations executing variables mapped checking (Expect 422)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1 });
      const payload = validUpdatePayload();
      delete payload.program_name;
      const res = await request(app).post('/api/programs/1').send(payload);
      expect(res.status).toBe(422);
    });

    it('Permissions bounds simulated limits testing functionality missing testing (Expect 403)', async () => {
      const res = await request(app).post('/api/programs/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Unhandled constraint exceptions mapping variables testing checking execution (Expect 500)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1 });
      prisma.program.update.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/programs/1').send(validUpdatePayload());
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/programs/:id', () => {
    it('Mapping successfully deletes element evaluating boundary maps executing (Expect 200)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1 });
      prisma.program.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/programs/1').send({ admin: true });
      expect(res.status).toBe(200);
    });

    it('Unauthorised bounds checking constraint check maps functional limitations (Expect 403)', async () => {
      const res = await request(app).delete('/api/programs/1').send({ admin: false });
      expect(res.status).toBe(403);
    });

    it('Parameter bounds checks null limitation execution variable bounding mappings (Expect 422)', async () => {
      prisma.program.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/api/programs/999').send({ admin: true });
      expect(res.status).toBe(422);
    });

    it('Maps logically simulating database hook constraints evaluating checks effectively (Expect 500)', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 1 });
      prisma.program.delete.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).delete('/api/programs/1').send({ admin: true });
      expect(res.status).toBe(500);
    });
  });

});
