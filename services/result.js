const { prisma } = require("../prisma/client");

const resultOutputData = {
  result_id: true,
  created_at: true,
  updated_at: true,
  student_apply_course_id: true,
  score: true,
  creator_id: true,
  student_apply_course: {
    select: {
      student_id: true,
      course_id: true,
      course: {
        select: {
          course_name: true,
          category: true,
          course_score: true,
          course_passing_score: true,
        },
      },
    },
  },
};

async function createResult(data) {
  const result = await prisma.result.create({
    data,
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function getCourseScore(registration_id) {
  const result = await prisma.student_apply_course.findUnique({
    where: {
      student_apply_course_id: registration_id,
    },
    select: {
      course: {
        select: {
          course_score: true,
          course_passing_score: true,
        },
      },
    },
  });

  if (result) {
    return {
      course_score: result.course.course_score,
      course_passing_score: result.course.course_passing_score,
    };
  }
}

async function findResultByResultId(resultId) {
  const result = await prisma.result.findUnique({
    where: {
      result_id: resultId,
    },
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function findResultByRegistrationId(registration_id) {
  const result = await prisma.result.findUnique({
    where: {
      student_apply_course_id: registration_id,
    },
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function getAllResults() {
  const results = await prisma.user_apply_course.findMany({
    select: resultOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (results) {
    return results;
  }
  return;
}

async function getAllResultsByUserId(userId) {
  const results = await prisma.result.findMany({
    where: {
      student_apply_course: {
        student_id: userId,
      },
    },
    select: resultOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (results) {
    return results;
  }
  return;
}

async function getAllResultsByCourseId(courseId) {
  const results = await prisma.result.findMany({
    where: {
      student_apply_course: {
        course_id: courseId,
      },
    },
    select: resultOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (results) {
    return results;
  }
  return;
}

async function updateResult(filter, data) {
  const result = await prisma.result.update({
    where: filter,
    data,
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function deleteResult(filter) {
  const result = await prisma.result.delete({
    where: filter,
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

module.exports = {
  createResult,
  deleteResult,
  findResultByRegistrationId,
  getAllResults,
  getAllResultsByCourseId,
  getAllResultsByUserId,
  updateResult,
  findResultByResultId,
  getCourseScore,
};
