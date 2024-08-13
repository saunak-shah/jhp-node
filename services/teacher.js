const { prisma } = require("../prisma/client");

const teacherOutputData = {
  teacher_id: true,
  teacher_first_name: true,
  teacher_last_name: true,
  teacher_phone_number: true,
  teacher_address: true,
  teacher_email: true,
  teacher_birth_date: true,
  teacher_password: true,
  teacher_gender: true,
  teacher_username: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
  is_support_user: true,
  master_role_id: true,
};

async function createTeacherData(data) {
  const teacher = await prisma.teacher.create({
    data,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByUsername(username) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      teacher_username: username,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherById(id) {
  const teacher = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByResetPasswordToken(token) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      teacher_reset_password_token: token,
      teacher_reset_password_token_expiration: {
        gte: new Date(),
      },
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByResetEmailToken(username, token) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      teacher_username: username,
      teacher_reset_email_token: token,
      teacher_reset_email_token_expiration: {
        gte: new Date(),
      },
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function findTeacherByEmail(email) {
  const teacher = await prisma.teacher.findMany({
    where: {
      teacher_email: email,
    },
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function updateTeacherData(filter, data) {
  const teacher = await prisma.teacher.update({
    where: filter,
    data,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function deleteTeacherData(filter) {
  const teacher = await prisma.teacher.delete({
    where: filter,
    select: teacherOutputData,
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function getAllTeachers(limit, offset, organization_id) {
  const teacher = await prisma.teacher.findMany({
    where: {
      organization_id,
    },
    select: teacherOutputData,
    orderBy: {
      teacher_birth_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (teacher) {
    return teacher;
  }
  return;
}

async function getTeachersCount(organization_id) {
  const teacherCount = await prisma.teacher.count({
    where: {
      organization_id,
    },
  });

  return teacherCount;
}

async function isAdmin(id, organization_id) {
  const student = await prisma.teacher.findUnique({
    where: {
      teacher_id: id,
      organization_id,
    },
  });

  if (student.master_role_id == 1) {
    return true;
  }
  return;
}

module.exports = {
  findTeacherByUsername,
  findTeacherByEmail,
  findTeacherById,
  findTeacherByResetPasswordToken,
  findTeacherByResetEmailToken,
  getAllTeachers,
  createTeacherData,
  updateTeacherData,
  deleteTeacherData,
  getTeachersCount,
  isAdmin
};
