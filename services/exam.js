const { prisma } = require("../prisma/client");

const examOutputData = {
  exam_id: true,
  created_at: true,
  updated_at: true,
  exam_name: true,
  exam_description: true,
  is_active: true,
  exam_course_url: true,
  organization_id: true,
};

async function createExam(data) {
  const exam = await prisma.exam.create({
    data,
    select: examOutputData,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function findExamByExamId(examId) {
  const exam = await prisma.exam.findUnique({
    where: {
      exam_id: examId,
    },
    select: examOutputData,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function getAllExams(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const exams = await prisma.exam.findMany({
    where: buildWhereClause(organization_id, searchKey),
    select: examOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (exams) {
    return exams;
  }
  return;
}

function buildWhereClause(organization_id, searchKey) {
  let whereClause;

  if (searchKey) {
    whereClause = {
      organization_id,
      OR: [
        {
          exam_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          exam_description: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  return whereClause;
}

function buildOrderClause(sortBy, sortOrder) {
  let orderClause = {
    course_date: "desc",
  };

  if (!sortOrder) {
    sortOrder = "desc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllExamsCount(organization_id, searchKey) {
  const examsCount = await prisma.exam.count({
    where: buildWhereClause(organization_id, searchKey),
  });

  return examsCount;
}

async function getAllPendingExams(limit, offset) {
  const exams = await prisma.exam_schedule.findMany({
    where: {
      exam_date: {
        gt: Date.now(),
      },
    },
    select: {
      exam: {
        select: {
          exam_id: true,
          exam_name: true,
          exam_description: true,
          exam_course_url: true,
          organization_id: true,
        },
      },
    },
    orderBy: {
      exam_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (exams) {
    return exams;
  }
  return;
}

async function getAllPendingExamsCount() {
  const examsCount = await prisma.exam_schedule.count({
    where: {
      exam_date: {
        gt: Date.now(),
      },
    },
  });

  return examsCount;
}

async function updateExam(filter, data) {
  const exam = await prisma.exam.update({
    where: filter,
    data,
    select: examOutputData,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function deleteExam(filter) {
  const exam = await prisma.exam.delete({
    where: filter,
    select: examOutputData,
  });

  if (exam) {
    return exam;
  }
  return;
}

async function scheduleExam(data) {
  const scheduledExam = await prisma.exam_schedule.create({
    data,
    select: {
      exam_id: true,
      exam_date: true,
      start_time: true,
      end_time: true,
    },
  });

  if (scheduledExam) {
    return scheduledExam;
  }

  return;
}

async function findExamScheduleByExamId(examId) {
  const scheduledExam = await prisma.exam_schedule.findUnique({
    where: {
      exam_id: examId,
    },
    select: {
      exam_id: true,
      exam_date: true,
      start_time: true,
      end_time: true,
    },
  });

  if (scheduledExam) {
    return scheduledExam;
  }
  return;
}

async function findExamScheduleById(schedule_id) {
  const scheduledExam = await prisma.exam_schedule.findUnique({
    where: {
      schedule_id,
    },
    select: {
      exam_id: true,
      exam_date: true,
      start_time: true,
      end_time: true,
    },
  });

  if (scheduledExam) {
    return scheduledExam;
  }
  return;
}

async function updateExamSchedule(filter, data) {
  const scheduledExam = await prisma.exam_schedule.update({
    where: filter,
    data,
    select: {
      exam_id: true,
      exam_date: true,
      start_time: true,
      end_time: true,
    },
  });

  if (scheduledExam) {
    return scheduledExam;
  }
  return;
}

async function deleteExamSchedule(filter) {
  const scheduledExam = await prisma.exam_schedule.delete({
    where: filter,
  });

  if (scheduledExam) {
    return scheduledExam;
  }
  return;
}

module.exports = {
  createExam,
  findExamByExamId,
  getAllExams,
  getAllExamsCount,
  updateExam,
  deleteExam,
  getAllPendingExams,
  getAllPendingExamsCount,
  scheduleExam,
  findExamScheduleByExamId,
  updateExamSchedule,
  deleteExamSchedule,
  findExamScheduleById
};
