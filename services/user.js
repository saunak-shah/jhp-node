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
  register_no: true,
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
      username: username.toLowerCase(),
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
      register_no,
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
      username: username.toLowerCase(),
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

async function getTotalStudentsCount(
  organization_id,
  searchKey,
  teacherId = undefined
) {
  const studentCount = await prisma.student.count({
    where: buildWhereClause(organization_id, searchKey, teacherId),
  });

  return studentCount;
}

async function getAllStudents(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0,
  teacherId = undefined
) {
  const student = await prisma.student.findMany({
    where: buildWhereClause(organization_id, searchKey, teacherId),
    select: studentOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (student) {
    return student;
  }
  return;
}

function buildWhereClause(
  organization_id,
  searchKey,
  // assigneeCheck = false,
  teacher_id = undefined
) {
  let whereClause;

  /*  if (assigneeCheck) {
    whereClause = {
      assigned_to: {
        not: null,
      },
    };
  } */
  if (teacher_id) {
    whereClause = {
      assigned_to: Array.isArray(teacher_id)
        ? { in: teacher_id.map((id) => parseInt(id)) }
        : parseInt(teacher_id),
    };
  }

  if (searchKey) {
    whereClause = {
      ...whereClause,
      organization_id,
      OR: [
        {
          first_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          phone_number: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          father_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          register_no: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  return whereClause;
}

function buildOrderClause(sortBy, sortOrder) {
  let orderClause = {
    birth_date: "asc",
  };

  if (!sortOrder) {
    sortOrder = "asc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function findStudentsAssignedToTeacherIdCount(
  organization_id,
  searchKey,
  teacher_id
) {
  const students = await prisma.student.count({
    where: buildWhereClause(organization_id, searchKey, teacher_id),
  });

  if (students) {
    return students;
  }
  return;
}

async function findStudentsAssignedToTeacherId(
  organization_id,
  searchKey,
  sortBy,
  teacher_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const students = await prisma.student.findMany({
    where: buildWhereClause(organization_id, searchKey, teacher_id),
    select: studentOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (students) {
    return students;
  }
  return;
}

async function findStudentsAssignedToTeacherData(organization_id) {
  const students = await prisma.$queryRaw`
    SELECT COUNT(s.student_id) AS student_count, t.teacher_first_name as teachers from student s
      JOIN teacher t ON s.assigned_to = t.teacher_id
      WHERE s.organization_id = ${organization_id}
      GROUP BY teacher_first_name ORDER BY student_count DESC`;
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
      teacher: true,
    },
  });

  if (teacher) {
    return teacher.teacher;
  }
  return;
}

async function getAllAssignees(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const students = await prisma.student.findMany({
    where: buildWhereClause(organization_id, searchKey, true),
    select: {
      student_id: true,
      first_name: true,
      last_name: true,
      father_name: true,
      email: true,
      phone_number: true,
      address: true,
      assigned_to: true,
    },
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (students) {
    return students;
  }
  return;
}

async function getAllAssigneesCount(organization_id) {
  const studentsCount = await prisma.student.count({
    where: {
      organization_id,
      assigned_to: {
        not: null,
      },
    },
  });

  return studentsCount;
}

async function findStudentsByAgeGroup(organization_id) {
  const data = await prisma.$queryRawUnsafe(`
    SELECT
        CASE
            WHEN age(current_date, birth_date) < INTERVAL '11 years' THEN '0-10 years'
            WHEN age(current_date, birth_date) < INTERVAL '21 years' THEN '11-20 years'
            WHEN age(current_date, birth_date) < INTERVAL '31 years' THEN '21-30 years'
            WHEN age(current_date, birth_date) < INTERVAL '41 years' THEN '31-40 years'
            WHEN age(current_date, birth_date) < INTERVAL '51 years' THEN '41-50 years'
            WHEN age(current_date, birth_date) < INTERVAL '61 years' THEN '51-60 years'
            WHEN age(current_date, birth_date) < INTERVAL '71 years' THEN '61-70 years'
            WHEN age(current_date, birth_date) < INTERVAL '81 years' THEN '71-80 years'
            WHEN age(current_date, birth_date) < INTERVAL '91 years' THEN '81-90 years'
            ELSE '91+ years'
        END AS age_range,
      COUNT(*) AS student_count
    FROM student
    WHERE organization_id = $1
    GROUP BY age_range
    ORDER BY age_range
`, organization_id)

  return data;
}

async function findStudentsByGenderGroup(organization_id) {
  const data = await prisma.$queryRawUnsafe(`
    SELECT
      gender,
      COUNT(*) AS student_count
    FROM student
    WHERE organization_id = $1
    GROUP BY gender
    ORDER BY gender
`, organization_id)

  return data;
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
  findStudentsAssignedToTeacherId,
  findStudentsAssignedToTeacherIdCount,
  findStudentAssignedTeacher,
  getAllAssignees,
  getTotalStudentsCount,
  getAllAssigneesCount,
  findStudentsAssignedToTeacherData,
  findStudentsByAgeGroup,
  findStudentsByGenderGroup
};
