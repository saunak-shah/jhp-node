const { prisma } = require("../prisma/client");

const findExamSelection = {
  examId: true,
  createdAt: true,
  updatedAt: true,
  examName: true,
  fileUrl: true,
  examDate: true,
  examDurationInHours: true,
  examDescription: true,
  examScore: true,
  examLocation: true,
  examStatus: true,
  examPassingScore: true,
  examMaxAttemps: true,
  isActive: true,
  registrationStartingDate: true,
  registrationClosingDate: true,
  resultDate: true,
  recheckingStartingDate: true,
  recheckingClosingDate: true,
  createdBy: true,
  category: true,
  standard: true,
}

async function createExam(data) {
  const exam = await prisma.exams.create({
    data,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function findExamByExamId(examId) {
  const exam = await prisma.exams.findUnique({
    where: {
      examId
    },
    select: findExamSelection
  })

  if(exam){
    return exam;
  }
  return;
}

async function getAllExams(){
  const exams = await prisma.exams.findMany({
    select: findExamSelection,
    orderBy: {
      examDate: "asc"
    }
  })

  if(exams){
    return exams;
  }
  return;
}

async function getAllPendingExams(){
  const exams = await prisma.exams.findMany({
    where: {
      examDate: {
        gt: Date.now()
      }
    },
    select: findExamSelection,
    orderBy: {
      examDate: "asc"
    }
  })

  if(exams){
    return exams;
  }
  return;
}

async function updateExam(filter, data){
  const exam = await prisma.exams.update({
    where: filter,
    data,
    select: findExamSelection
  })

  if(exam){
    return exam;
  }
  return;
}

async function deleteExam(filter){
  const exam = await prisma.exams.delete({
    where: filter,
    select: findExamSelection
  })

  if(exam){
    return exam;
  }
  return;
}

module.exports = {
  createExam,
  findExamByExamId,
  getAllExams,
  updateExam,
  deleteExam,
  getAllPendingExams
};
