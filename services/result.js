const { prisma } = require("../prisma/client");

const resultSelection = {
  id: true,
  created_at: true,
  updated_at: true,
  registration_id: true,
  score: true,
  creator_id: true,
  user_apply_course: {
    select: {
      user_id: true,
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
    select: resultSelection
  });

  if (result) {
    return result;
  }
  return;
}

async function getCourseScore(registration_id) {
  const result = await prisma.user_apply_course.findUnique({
    where: {
      id: registration_id,
    },
    select: {
      course: {
        select: {
          course_score: true,
          course_passing_score: true
        },
      },
    },
  });

  if (result) {
    return {
      course_score: result.course.course_score,
      course_passing_score: result.course.course_passing_score
    }
  }
}

async function findResultByResultId(resultId) {
  const result = await prisma.result.findUnique({
    where: {
      id: resultId,
    },
    select: resultSelection,
  });

  if (result) {
    return result;
  }
  return;
}

async function findResultByRegistrationId(registration_id) {
  const result = await prisma.result.findUnique({
    where: {
      registration_id,
    },
    select: resultSelection,
  });

  if (result) {
    return result;
  }
  return;
}

async function getAllResults() {
  const results = await prisma.user_apply_course.findMany({
    select: resultSelection,
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
      user_apply_course: {
        user_id: userId,
      },
    },
    select: resultSelection,
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
      user_apply_course: {
        course_id: courseId
      }
    },
    select: resultSelection,
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
    select: resultSelection,
  });

  if (result) {
    return result;
  }
  return;
}

async function deleteResult(filter) {
  const result = await prisma.result.delete({
    where: filter,
    select: resultSelection,
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
