const { parse } = require("dotenv");
const { prisma } = require("../prisma/client");
const courses = require("../routes/courses");

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
      student: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          father_name: true,
          username: true,
          register_no: true,
          email: true,
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
      student_apply_course_id: parseInt(registration_id),
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
      result_id: parseInt(resultId),
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
      student_apply_course_id: parseInt(registration_id),
    },
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function getAllResults(limit, offset) {
  const results = await prisma.user_apply_course.findMany({
    select: resultOutputData,
    orderBy: {
      created_at: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (results) {
    return results;
  }
  return;
}

async function getAllResultsCount() {
  const resultsCount = await prisma.user_apply_course.count();
  return resultsCount;
}

async function getAllResultsByUserId(
  searchKey,
  sortBy,
  userId,
  sortOrder,
  limit,
  offset
) {
  const results = await prisma.result.findMany({
    where: buildWhereClause(userId, undefined, searchKey),
    select: resultOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (results) {
    return results;
  }
  return;
}

async function getAllResultsByUserIdCount(userId) {
  const resultsCount = await prisma.result.count({
    where: {
      student_apply_course: {
        student_id: parseInt(userId),
      },
    },
  });

  return resultsCount;
}

async function getAllResultsByCourseId(
  searchKey,
  sortBy,
  courseId,
  sortOrder,
  limit,
  offset
) {
  const results = await prisma.result.findMany({
    where: {
      student_apply_course: buildWhereClause(undefined, courseId, searchKey),
    },
    select: resultOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (results) {
    return results;
  }
  return;
}

function buildWhereClause(studentId, courseId, searchKey) {
  let whereClause;

  if (courseId) {
    whereClause = {
      course_id: parseInt(courseId),
    };
  } else if (studentId) {
    whereClause = {
      student_id: parseInt(studentId),
    };
  }

  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          student: {
            select: {
              first_name: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              last_name: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              father_name: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              phone_number: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              email: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              register_no: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              username: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            select: {
              address: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
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
    sortOrder = "asc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllResultsByCourseIdCount(courseId) {
  const resultsCount = await prisma.result.count({
    where: {
      student_apply_course: {
        course_id: parseInt(courseId),
      },
    },
  });

  return resultsCount;
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
  getAllResultsCount,
  getAllResultsByCourseId,
  getAllResultsByCourseIdCount,
  getAllResultsByUserId,
  getAllResultsByUserIdCount,
  updateResult,
  findResultByResultId,
  getCourseScore,
};
