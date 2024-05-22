const { prisma } = require("../prisma/client");

const findCourseSelection = {
  id: true,
  created_at: true,
  updated_at: true,
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
  created_by: true,
  category: true,
};

async function createCourse(data) {
  const course = await prisma.course.create({
    data,
  });

  if (course) {
    return course;
  }
  return;
}

async function findCourseByCourseId(courseId) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: findCourseSelection,
  });

  if (course) {
    return course;
  }
  return;
}

async function getAllCourses() {
  const courses = await prisma.course.findMany({
    select: findCourseSelection,
    orderBy: {
      course_date: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllPendingCourses() {
  const courses = await prisma.course.findMany({
    where: {
      course_date: {
        gt: Date.now(),
      },
    },
    select: findCourseSelection,
    orderBy: {
      course_date: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function updateCourse(filter, data) {
  const course = await prisma.course.update({
    where: filter,
    data,
    select: findCourseSelection,
  });

  if (course) {
    return course;
  }
  return;
}

async function deleteCourse(filter) {
  const course = await prisma.course.delete({
    where: filter,
    select: findCourseSelection,
  });

  if (course) {
    return course;
  }
  return;
}

module.exports = {
  createCourse,
  findCourseByCourseId,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAllPendingCourses,
};
