const { prisma } = require("../prisma/client");

const resultOutputData = {
  result_id: true,
  created_at: true,
  updated_at: true,
  reg_id: true,
  marks_obtained: true,
  passing_marks: true,
  total_marks: true,
  creator_id: true,
  student_apply_exam: {
    select: {
      student_id: true,
      reg_id: true,
      schedule: {
        total_marks: true,
        passing_marks: true,
        select: {
          exam: {
            select: {
              exam_name: true,
              exam_description: true,
            },
          },
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
  const result = await prisma.exam_result.upsert({
    where: {
      reg_id: data.reg_id,
    },
    update: data,
    create: data,
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function getExamScore(registration_id) {
  const result = await prisma.student_apply_exam.findUnique({
    where: {
      application_id: parseInt(registration_id),
    },
    select: {
      reg_id: true,
      exam_schedule: {
        select: {
          total_marks: true,
          passing_marks: true,
        },
      },
    },
  });

  if (result) {
    return {
      total_marks: result.exam_schedule.total_marks,
      passing_marks: result.exam_schedule.passing_marks,
      reg_id: result.reg_id,
    };
  }
}

async function findResultByResultId(resultId) {
  const result = await prisma.exam_result.findUnique({
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
  const result = await prisma.exam_result.findUnique({
    where: {
      reg_id: registration_id,
    },
    select: resultOutputData,
  });

  if (result) {
    return result;
  }
  return;
}

async function getAllResults(limit, offset) {
  const results = await prisma.exam_result.findMany({
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
  const resultsCount = await prisma.exam_result.count();
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
  const results = await prisma.exam_result.findMany({
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
  const resultsCount = await prisma.exam_result.count({
    where: {
      student_apply_exam: {
        student_id: parseInt(userId),
      },
    },
  });

  return resultsCount;
}

async function getAllResultsByExamId(
  searchKey,
  sortBy,
  courseId,
  sortOrder,
  limit,
  offset
) {
  const results = await prisma.exam_result.findMany({
    where: buildWhereClause(undefined, courseId, searchKey),
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

async function getAllResultsByExamIdToDownload(
  searchKey,
  sortBy,
  courseId,
  sortOrder,
  limit,
  offset
) {
  const results = await prisma.exam_result.findMany({
    where: buildWhereClause(undefined, courseId, searchKey),
    select: {
      result_id: true,
      student_apply_exam: {
        select: {
          exam_schedule: {
            select: {
              exam: {
                select: {
                  exam_name: true,
                  exam_description: true,
                },
              },
            },
          },
          student: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      },
      marks_obtained: true,
      passing_marks: true,
      total_marks: true,
      created_at: true,
      updated_at: true,
      reg_id: true,
    },
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  const data = [];

  if (results) {
    for (let i = 0; i < results.length; i++) {
      data.push({
        result_id: results[i].result_id,
        reg_id: results[i].reg_id,
        student_name:
          results[i].student_apply_exam.student.first_name +
          " " +
          results[i].student_apply_exam.student.last_name,
        exam_name: results[i].student_apply_exam.exam_schedule.exam.exam_name,
        exam_description:
          results[i].student_apply_exam.exam_schedule.exam.exam_description,
        marks_obtained: results[i].marks_obtained,
        total_marks: results[i].total_marks,
        passing_marks: results[i].passing_marks,
      });
    }
    return results;
  }
  return;
}

function buildWhereClause(studentId, examId, searchKey) {
  let whereClause;

  if (examId) {
    whereClause = {
      registration: {
        schedule: {
          exam_id: examId,
        },
      },
    };
  } else if (studentId) {
    whereClause = {
      registration: {
        student_id: parseInt(studentId),
      },
    };
  }

  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          registration: {
            select: {
              student: {
                select: {
                  first_name: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  last_name: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  father_name: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  phone_number: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  email: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  register_no: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
        {
          registration: {
            select: {
              student: {
                select: {
                  username: {
                    contains: searchKey,
                    mode: "insensitive",
                  },
                },
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

async function getAllResultsByExamIdCount(examId) {
  const resultsCount = await prisma.exam_result.count({
    where: {
      registration: {
        schedule: {
          exam_id: parseInt(examId),
        },
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
  getAllResultsByExamId,
  getAllResultsByExamIdCount,
  getAllResultsByExamIdToDownload,
  getAllResultsByUserId,
  getAllResultsByUserIdCount,
  updateResult,
  findResultByResultId,
  getExamScore,
};
