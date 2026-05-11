process.env.DATABASE_URL = 'postgres://dummy';
process.env.MAIL_ID = 'test@test.com';
process.env.MAIL_PASSWORD = 'pass';
process.env.ENCRYPTION_SECRET_KEY = 'secret';
process.env.JWT_LIFETIME = '1000';
process.env.NODE_ENV = 'test';

const { mockDeep } = require('jest-mock-extended');

jest.mock('../prisma/client', () => {
  return {
    prisma: require('jest-mock-extended').mockDeep(),
  };
});

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true)
    })
  };
});

jest.mock('aws-sdk', () => {
  const mS3 = {
    getSignedUrlPromise: jest.fn()
  };
  return {
    S3: jest.fn(() => mS3),
    config: {
      update: jest.fn()
    }
  };
});

jest.mock('../middlewares/middleware', () => {
  return {
    userMiddleware: (req, res, next) => {
      const adminValue = typeof req.body.admin === 'boolean' ? req.body.admin : true;
      req.body = {
        ...req.body,
        admin: adminValue,
        teacher: req.body.teacher || { teacher_id: 1, organization_id: 1, master_role_id: 1 },
        student: req.body.student || { student_id: 1, organization_id: 1 }
      };
      next();
    },
    adminMiddleware: (req, res, next) => {
      req.body.admin = typeof req.body.admin === 'boolean' ? req.body.admin : true;
      next();
    }
  };
});

jest.mock('../helpers/bcrypt', () => ({
  createHash: jest.fn().mockReturnValue('mock_hashed_password'),
  isValidPassword: jest.fn().mockReturnValue(true)
}));

jest.mock('../helpers/jwt', () => ({
  signJwt: jest.fn().mockReturnValue('mock_token'),
  verifyJwt: jest.fn().mockReturnValue({ username: 'mock' })
}));

jest.mock('../services/organization', () => ({
  getOrganization: jest.fn().mockResolvedValue({ name: 'JHP' })
}));
