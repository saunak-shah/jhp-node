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

const scheduleExamOutputData = {
  schedule_id: true,

  exam_id: true,
  exam_date: true,
  start_time: true,
  end_time: true,
  registration_starting_date: true,
  registration_closing_date: true,
  seats_available: true,
  exam_location: true,
  total_marks: true,
  passing_marks: true,
  scheduled_by: true,
  teacher: true,
  is_retake: true,
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
    updated_at: "desc",
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

async function getAllPendingExams(
  searchKey,
  sortBy,
  organizationId,
  sortOrder,
  limit,
  offset = 0
) {
  const exams = await prisma.exam_schedule.findMany({
    where: {
      exam_date: {
        gt: new Date(Date.now()).toISOString(),
      },
      ...buildWhereClause(organizationId, searchKey),
    },
    select: scheduleExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (exams) {
    return exams;
  }
  return;
}

async function getAllPendingExamsCount(organization_id, searchKey) {
  
  const examsCount = await prisma.exam_schedule.count({
    where: {
      exam_date: {
        gt: new Date(Date.now()).toISOString(),
      },
      ...buildWhereClause(organization_id, searchKey),
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

async function findExamsScheduleByExamId(examId) {
  const scheduledExam = await prisma.exam_schedule.findMany({
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
    select: scheduleExamOutputData,
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
    select: scheduleExamOutputData,
  });

  if (scheduledExam) {
    return scheduledExam;
  }
  return;
}

async function deleteExamSchedule(filter) {
  const scheduledExam = await prisma.exam_schedule.delete({
    where: filter,
    select: scheduleExamOutputData,
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
  findExamsScheduleByExamId,
  updateExamSchedule,
  deleteExamSchedule,
  findExamScheduleById,
};
