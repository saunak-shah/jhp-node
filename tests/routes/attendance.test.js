const request = require('supertest');
const app = require('../../app');
const { prisma } = require('../../prisma/client');

describe('Attendance Routes (/api/attendance, /api/attendance_report)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/attendance', () => {
    it('should mark attendance for students', async () => {
      prisma.attendance.createMany.mockResolvedValue({ count: 2 });
      
      const res = await request(app)
        .post('/api/attendance')
        .send({
          students: [1, 2],
          status: 'present',
          date: '2026-05-10',
          program_id: null,
          course_id: null
        });
    });
  });

  describe('GET /api/attendance_report', () => {
    it('should fetch attendance report', async () => {
      prisma.attendance.findMany.mockResolvedValue([]);
      
      const res = await request(app).get('/api/attendance_report?year=2026&month=5');
    });
  });
});
