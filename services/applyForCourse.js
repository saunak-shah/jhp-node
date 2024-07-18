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

async function getAllApplications() {
  const courses = await prisma.student_apply_course.findMany({
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

async function getAllApplicationsByUserId(userId) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      student_id: userId,
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

async function getAllApplicationsByCourseId(examId) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      course_id: examId,
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
  getAllApplicationsByCourseId,
  getAllApplicationsByUserId,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndCourseId,
};
