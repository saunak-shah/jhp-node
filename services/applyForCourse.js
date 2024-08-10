const { prisma } = require("../prisma/client");

const appliedExamOutputData = {
  student_apply_course_id: true,
  created_at: true,
  updated_at: true,
  course_id: true,
  student_id: true,
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

async function getAllApplications(limit, offset) {
  const courses = await prisma.student_apply_course.findMany({
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllApplicationsCount() {
  const coursesCount = await prisma.student_apply_course.count();
  return coursesCount;
}

async function getAllApplicationsByUserId(userId, limit, offset) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      student_id: parseInt(userId),
    },
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  if (courses) {
    return courses;
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

async function getAllApplicationsByCourseId(examId, limit, offset) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      course_id: parseInt(examId),
    },
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  if (courses) {
    return courses;
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
