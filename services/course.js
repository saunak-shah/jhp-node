const { prisma } = require("../prisma/client");

const courseOutputData = {
  course_id: true,
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
  organization_id: true
};

async function createCourse(data) {
  const course = await prisma.course.create({
    data,
    select: courseOutputData
  });

  if (course) {
    return course;
  }
  return;
}

async function findCourseByCourseId(courseId) {
  const course = await prisma.course.findUnique({
    where: {
      course_id: courseId,
    },
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function getAllCourses(organization_id, limit, offset) {
  const courses = await prisma.course.findMany({
    where: {
      organization_id
    },
    select: courseOutputData,
    orderBy: {
      course_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllCoursesCount(organization_id) {
  const coursesCount = await prisma.course.count({
    where: {
      organization_id
    },
  });

  return coursesCount;
}

async function getAllPendingCourses(limit, offset) {
  const courses = await prisma.course.findMany({
    where: {
      course_date: {
        gt: Date.now(),
      },
    },
    select: courseOutputData,
    orderBy: {
      course_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  if (courses) {
    return courses;
  }
  return;
}

async function getAllPendingCoursesCount() {
  const coursesCount = await prisma.course.count({
    where: {
      course_date: {
        gt: Date.now(),
      },
    },
  });

  return coursesCount;
}

async function updateCourse(filter, data) {
  const course = await prisma.course.update({
    where: filter,
    data,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function deleteCourse(filter) {
  const course = await prisma.course.delete({
    where: filter,
    select: courseOutputData,
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
  getAllCoursesCount,
  updateCourse,
  deleteCourse,
  getAllPendingCourses,
  getAllPendingCoursesCount
};
