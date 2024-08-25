const { prisma } = require("../prisma/client");

const appliedExamOutputData = {
  student_apply_course_id: true,
  created_at: true,
  updated_at: true,
  course_id: true,
  student_id: true,
  student: {
    select: {
      student_id: true,
      first_name: true,
      last_name: true,
      father_name: true,
      phone_number: true,
      address: true,
      email: true,
      username: true,
      register_no: true,
    },
  },
  course: {
    select: {
      course_id: true,
      course_name: true,
      file_url: true,
      course_date: true,
      course_duration_in_hours: true,
      course_description: true,
      course_score: true,
      course_location: true,
      course_passing_score: true,
      course_max_attempts: true,
      is_active: true,
      registration_starting_date: true,
      registration_closing_date: true,
      result_date: true,
    },
  },
};

async function applyForCourse(data) {
  const application = await prisma.student_apply_course.create({
    data,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.student_apply_course.findUnique({
    where: {
      student_apply_course_id: registrationId,
    },
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

function buildWhereClause(searchKey, courseId = undefined, userId = undefined) {
  let whereClause;

  if (courseId) {
    whereClause = {
      course_id: parseInt(courseId),
    };
  }

  if (userId) {
    whereClause = {
      student_id: parseInt(userId),
    };
  }

  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          course_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          course_description: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          course_location: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          file_url: {
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
    created_at: "asc",
  };

  if (!sortOrder) {
    sortOrder = "desc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllApplications(
  searchKey,
  sortBy,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_course.findMany({
    where: buildWhereClause(searchKey),
    select: appliedExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (applications) {
    return applications;
  }
  return;
}

async function getAllApplicationsCount() {
  const applicationsCount = await prisma.student_apply_course.count();
  return applicationsCount;
}

async function getAllApplicationsByUserId(
  searchKey,
  sortBy,
  userId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_course.findMany({
    where: buildWhereClause(searchKey, undefined, userId),
    select: appliedExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (applications) {
    return applications;
  }
  return;
}

async function getAllApplicationsByUserIdCount(userId) {
  const coursesCount = await prisma.student_apply_course.count({
    where: {
      student_id: parseInt(userId),
    },
  });

  return coursesCount;
}

async function getAllApplicationsByCourseId(
  searchKey,
  sortBy,
  examId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_course.findMany({
    where: buildWhereClause(searchKey, examId, undefined),
    select: appliedExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (applications) {
    return applications;
  }
  return;
}

async function getAllApplicationsByCourseIdCount(examId) {
  const coursesCount = await prisma.student_apply_course.count({
    where: {
      course_id: parseInt(examId),
    },
  });

  return coursesCount;
}

async function getAllApplicationsByUserIdAndCourseId(userId, courseId) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      student_id: userId,
      course_id: courseId,
    },
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function updateApplication(filter, data) {
  const application = await prisma.student_apply_course.update({
    where: filter,
    data,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function deleteApplication(filter) {
  const application = await prisma.student_apply_course.delete({
    where: filter,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

module.exports = {
  applyForCourse,
  findApplicationByRegistrationId,
  getAllApplications,
  getAllApplicationsCount,
  getAllApplicationsByCourseId,
  getAllApplicationsByCourseIdCount,
  getAllApplicationsByUserId,
  getAllApplicationsByUserIdCount,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndCourseId,
};
