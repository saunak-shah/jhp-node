const { prisma } = require("../prisma/client");

const appliedExamOutputData = {
  application_id: true,
  created_at: true,
  updated_at: true,
  reg_id: true,
  schedule_id: true,
  schedule: {
    select: {
      schedule_id: true,
      created_at: true,
      exam_id: true,
      exam_date: true,
      start_time: true,
      end_time: true,
      exam_location: true,
      registration_starting_date: true,
      registration_closing_date: true,
      seats_available: true,
      total_marks: true,
      passing_marks: true,
      is_retake: true,
      exam: {
        select: {
          exam_id: true,
          exam_name: true,
          exam_description: true,
          is_active: true,
          exam_course_url: true,
          organization_id: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
  },
  student_id: true,
  student: {
    select: {
      student_id: true,
      first_name: true,
      last_name: true,
      father_name: true,
      phone_number: true,
      address: true,
      email: true,
      username: true,
      register_no: true,
    },
  },
  exam_result: {
    select: {
      reg_id: true,
      marks_obtained: true,
    },
  },
};

async function applyForExam(data) {
  const application = await prisma.student_apply_exam.create({
    data,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.student_apply_exam.findUnique({
    where: {
      reg_id: registrationId,
    },
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

function buildWhereClause(
  searchKey,
  scheduleId = undefined,
  userId = undefined
) {
  let whereClause;

  if (scheduleId) {
    whereClause = {
      schedule_id: parseInt(scheduleId),
    };
  }

  if (userId) {
    whereClause = {
      student_id: parseInt(userId),
    };
  }

  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          schedule: {
            exam: {
              exam_name: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          schedule: {
            exam: {
              exam_description: {
                contains: searchKey,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            first_name: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          student: {
            last_name: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          student: {
            father_name: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          student: {
            email: {
              contains: searchKey,
              mode: "insensitive",
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
    sortOrder = "desc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllApplications(
  searchKey,
  sortBy,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_exam.findMany({
    where: buildWhereClause(searchKey),
    select: appliedExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (applications) {
    return applications;
  }
  return;
}

async function getAllApplicationsCount(searchKey) {
  const applicationsCount = await prisma.student_apply_exam.count({
    where: buildWhereClause(searchKey),
  });
  return applicationsCount;
}

async function getAllApplicationsByUserId(
  searchKey,
  sortBy,
  userId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_exam.findMany({
    where: buildWhereClause(searchKey, undefined, userId),
    select: appliedExamOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (applications) {
    return applications;
  }
  return;
}

async function getAllApplicationsByUserIdCount(userId, searchKey) {
  const coursesCount = await prisma.student_apply_course.count({
    where: buildWhereClause(searchKey, undefined, userId),
  });

  return coursesCount;
}

async function getAllApplicationsByScheduleId(
  searchKey,
  sortBy,
  examId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  try {
    const applications = await prisma.student_apply_exam.findMany({
      where: buildWhereClause(searchKey, examId, undefined),
      select: appliedExamOutputData,
      orderBy: buildOrderClause(sortBy, sortOrder),
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    if (applications) {
      return applications;
    }
    return;
  } catch (error) {
    throw new Error(error?.message || "Unable to fetch applications");
  }
}

async function getAllApplicationsByScheduleIdToDownload(
  searchKey,
  sortBy,
  examId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_exam.findMany({
    where: buildWhereClause(searchKey, examId, undefined),
    select: {
      application_id: true,
      created_at: true,
      updated_at: true,
      reg_id: true,
      student: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          gender: true,
        },
      },
      schedule: {
        select: {
          exam: {
            select: {
              exam_name: true,
            },
          }
        },
      },
    },
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  const data = [];
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];
    data.push({
      registration_id: application.student_apply_course_id,
      created_at: application.created_at,
      updated_at: application.updated_at,
      student_name:
        application.student.first_name + application.student.last_name,
      exam: application.schedule.exam.exam_name,
      phone_number: application.student.phone_number,
      email: application.student.email,
      gender: application.student.gender,
    });
  }

  if (data && data.length > 0) {
    return data;
  }
  return;
}

async function getAllApplicationsByScheduleIdCount(examId, searchKey) {
  const examsCount = await prisma.student_apply_exam.count({
    where: buildWhereClause(searchKey, examId, undefined),
  });

  return examsCount;
}

async function getAllApplicationsByUserIdAndExamId(userId, examId) {
  const exams = await prisma.student_apply_exam.findMany({
    where: {
      student_id: userId,
      schedule: {
        exam_id: examId,
      }
    },
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (exams) {
    return exams;
  }
  return;
}

async function updateApplication(filter, data) {
  const application = await prisma.student_apply_exam.update({
    where: filter,
    data,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function deleteApplication(filter) {
  const application = await prisma.student_apply_exam.delete({
    where: filter,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

module.exports = {
  applyForExam,
  findApplicationByRegistrationId,
  getAllApplications,
  getAllApplicationsCount,
  getAllApplicationsByScheduleId,
  getAllApplicationsByScheduleIdCount,
  getAllApplicationsByUserId,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByScheduleIdToDownload,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndExamId,
};
