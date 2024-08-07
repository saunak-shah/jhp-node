const { prisma } = require("../prisma/client");

const studentOutputData = {
  student_id: true,
  first_name: true,
  last_name: true,
  father_name: true,
  phone_number: true,
  address: true,
  email: true,
  birth_date: true,
  password: true,
  gender: true,
  username: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
  assigned_to: true,
  teacher: true,
  register_no: true
};

async function createStudentData(data) {
  const student = await prisma.student.create({
    data,
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentByUsername(username) {
  const student = await prisma.student.findUnique({
    where: {
      username,
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentById(id) {
  const student = await prisma.student.findUnique({
    where: {
      student_id: id,
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentByRegisterNumber(register_no) {
  const student = await prisma.student.findUnique({
    where: {
      register_no
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentByResetPasswordToken(token) {
  const student = await prisma.student.findFirst({
    where: {
      reset_password_token: token,
      reset_password_token_expiration: {
        gte: new Date(),
      },
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentByResetEmailToken(username, token) {
  const student = await prisma.student.findFirst({
    where: {
      username,
      reset_email_token: token,
      reset_email_token_expiration: {
        gte: new Date(),
      },
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function findStudentByEmail(email) {
  const student = await prisma.student.findMany({
    where: {
      email,
    },
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function updateStudentData(filter, data) {
  const student = await prisma.student.update({
    where: filter,
    data,
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function deleteStudentData(filter) {
  const student = await prisma.student.delete({
    where: filter,
    select: studentOutputData,
  });

  if (student) {
    return student;
  }
  return;
}

async function getAllStudents(limit, offset, organization_id) {
  const student = await prisma.student.findMany({
    where: {
      organization_id,
    },
    select: studentOutputData,
    orderBy: {
      birth_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (student) {
    return student;
  }
  return;
}

async function isAdmin(student_id, organization_id) {
  const student = await prisma.master_role.findUnique({
    where: {
      master_role_id: student_id,
      organization_id
    },
  });

  if (student) {
    return true;
  }
  return;
}


async function findStudentsAssignedToTeacherId(teacher_id) {
  const students = await prisma.student.findMany({
    where: {
        assigned_to: teacher_id
    },
    select: studentOutputData
  });

  if (students) {
    return students;
  }
  return;
}

async function findStudentAssignedTeacher(student_id) {
  const teacher = await prisma.student.findUnique({
    where: {
      student_id,
    },
    select: {
        teacher: true
    },
  });

  if (teacher) {
    return teacher.teacher;
  }
  return;
}

async function getAllAssignees() {
  const students = await prisma.student.findMany({
    where: {
      assigned_to: {
        not: null
      }
    },
    select: {
      student_id: true,
      assigned_to: true
    },
    orderBy: {
      birth_date: "asc",
    },
  });

  if (students) {
    return students;
  }
  return;
}

module.exports = {
  findStudentByUsername,
  findStudentByEmail,
  findStudentById,
  findStudentByResetPasswordToken,
  findStudentByResetEmailToken,
  findStudentByRegisterNumber,
  getAllStudents,
  createStudentData,
  updateStudentData,
  deleteStudentData,
  isAdmin,
  findStudentsAssignedToTeacherId,
  findStudentAssignedTeacher,
  getAllAssignees
};
