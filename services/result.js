const { prisma } = require("../prisma/client");

const resultSelection = {
  resultId: true,
  createdAt: true,
  updatedAt: true,
  registrationId: true,
  score: true,
  percentage: true,
  creatorId: true,
  appliedExam: {
    select: {
      userId: true,
      examId: true,
      appliedExam: {
        select: {
          examName: true,
          category: true,
          standard: true,
        },
      },
    },
  },
};

async function createResult(data) {
  const result = await prisma.result.create({
    data,
  });

  if (result) {
    return result;
  }
  return;
}

async function getExamScore(registrationId) {
  const result = await prisma.appliedExam.findUnique({
    where: {
      registrationId,
    },
    select: {
      appliedExam: {
        select: {
          examScore: true,
        },
      },
    },
  });

  if (result) {
    return result.appliedExam.examScore;
  }
  return;
}

async function findResultByResultId(resultId) {
  const result = await prisma.result.findUnique({
    where: {
      resultId,
    },
    select: resultSelection,
  });

  if (result) {
    return result;
  }
  return;
}

async function findResultByRegistrationId(registrationId) {
  const result = await prisma.result.findUnique({
    where: {
      registrationId,
    },
    select: resultSelection,
  });

  if (result) {
    return result;
  }
  return;
}

async function getAllResults() {
  const results = await prisma.appliedExam.findMany({
    select: resultSelection,
    orderBy: {
      createdAt: "asc",
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
      appliedExam: {
        userId,
      },
    },
    select: resultSelection,
    orderBy: {
      createdAt: "asc",
    },
  });

  if (results) {
    return results;
  }
  return;
}

async function getAllResultsByExamId(examId) {
  const results = await prisma.result.findMany({
    where: {
      appliedExam: {
        examId
      }
    },
    select: resultSelection,
    orderBy: {
      createdAt: "asc",
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
  getAllResultsByExamId,
  getAllResultsByUserId,
  updateResult,
  findResultByResultId,
  getExamScore,
};
