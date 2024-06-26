const { prisma } = require("../prisma/client");

const examApplySelection = {
  id: true,
  created_at: true,
  updated_at: true,
  course_id: true,
  user_id: true,
};

async function createApplication(data) {
  const exam = await prisma.user_apply_course.create({
    data,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.user_apply_course.findUnique({
    where: {
      id: registrationId,
    },
    select: examApplySelection,
  });

  if (application) {
    return application;
  }
  return;
}

async function getAllApplications() {
  const courses = await prisma.user_apply_course.findMany({
    select: examApplySelection,
    orderBy: {
      created_at: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllApplicationsByUserId(userId) {
  const courses = await prisma.user_apply_course.findMany({
    where: {
      user_id: userId,
    },
    select: examApplySelection,
    orderBy: {
      created_at: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllApplicationsByCourseId(examId) {
  const courses = await prisma.user_apply_course.findMany({
    where: {
      course_id: examId,
    },
    select: examApplySelection,
    orderBy: {
      created_at: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllApplicationsByUserIdAndCourseId(userId, courseId) {
  const courses = await prisma.user_apply_course.findMany({
    where: {
      user_id: userId,
      course_id: courseId
    },
    select: examApplySelection,
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
  const exam = await prisma.user_apply_course.update({
    where: filter,
    data,
    select: examApplySelection,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function deleteApplication(filter) {
  const exam = await prisma.user_apply_course.delete({
    where: filter,
    select: examApplySelection,
  });

  if (exam) {
    return exam;
  }
  return;
}

module.exports = {
  createApplication,
  findApplicationByRegistrationId,
  getAllApplications,
  getAllApplicationsByCourseId,
  getAllApplicationsByUserId,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndCourseId
};
