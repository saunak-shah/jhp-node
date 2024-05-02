const { prisma } = require("../prisma/client");

const examApplySelection = {
  registrationId: true,
  createdAt: true,
  updatedAt: true,
  examId: true,
  userId: true,
};

async function createApplication(data) {
  const exam = await prisma.appliedExam.create({
    data,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.appliedExam.findUnique({
    where: {
      registrationId,
    },
    select: examApplySelection,
  });

  if (application) {
    return application;
  }
  return;
}

async function getAllApplications() {
  const exams = await prisma.appliedExam.findMany({
    select: examApplySelection,
    orderBy: {
      createdAt: "asc",
    },
  });

  if (exams) {
    return exams;
  }
  return;
}

async function getAllApplicationsByUserId(userId) {
  const exams = await prisma.appliedExam.findMany({
    where: {
      userId,
    },
    select: examApplySelection,
    orderBy: {
      createdAt: "asc",
    },
  });

  if (exams) {
    return exams;
  }
  return;
}

async function getAllApplicationsByExamId(examId) {
    const exams = await prisma.appliedExam.findMany({
      where: {
        examId,
      },
      select: examApplySelection,
      orderBy: {
        createdAt: "asc",
      },
    });
  
    if (exams) {
      return exams;
    }
    return;
  }

async function updateApplication(filter, data) {
  const exam = await prisma.appliedExam.update({
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
  const exam = await prisma.appliedExam.delete({
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
  getAllApplicationsByExamId,
  getAllApplicationsByUserId,
  updateApplication,
  deleteApplication,
};
