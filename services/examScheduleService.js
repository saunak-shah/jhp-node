const { prisma } = require("../prisma/client");

const courseOutputData = {
  schedule_id: true,
  course_id: true,
  registration_starting_date: true,
  registration_closing_date: true,
  location: true,
  start_time: true,
  end_time: true,
  total_marks: true,
  passing_score: true,
  created_at: true,
  is_exam_active: true
};

const examOutputData = {
  schedule_id: true,
  course_id: true,
  exam_name: true,
  registration_starting_date: true,
  registration_closing_date: true,
  location: true,
  start_time: true,
  end_time: true,
  total_marks: true,
  passing_score: true,
  created_at: true,
  is_exam_active: true,
  course: {
    select: {
      course_id: true,
      course_name: true,
      file_url: true,
      course_description: true
    },
  },
  student_apply_course: {
    select: {
      schedule_id: true,
      student_id: true,
      course_id: true,
      reg_id: true,
    },
  },
};

async function createExam(data) {
  const course = await prisma.exam_schedule.create({
    data,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function findExamByScheduleId(scheduleId) {
  const course = await prisma.exam_schedule.findUnique({
    where: {
      schedule_id: scheduleId,
    },
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function findExamByScheduleIdForReceipt(scheduleId) {
  const examScheduleReceipt = await prisma.student_apply_course.findFirst({
    where: {
      schedule_id: scheduleId
    },
    orderBy: {
      created_at: 'desc' // or any other timestamp field
    },  
    select: {
      reg_id: true,
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
      exam_schedule: {
        select: {
          schedule_id: true,
          course_id: true,
          registration_starting_date: true,
          registration_closing_date: true,
          location: true,
          start_time: true,
          end_time: true,
          total_marks: true,
          passing_score: true,
          created_at: true,
          course: {
            select: {
              course_id: true,
              course_name: true,
              file_url: true,
              course_description: true
            },
          },
        }
      }
    }
  });  
  if (examScheduleReceipt) {
    return examScheduleReceipt;
  }
  return;
}

async function getAllExamSchedule(
  searchKey,
  sortBy,
  filterObj,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const courses = await prisma.exam_schedule.findMany({
    where: buildWhereClause(filterObj, searchKey),
    select: examOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (courses) {
    return courses;
  }
  return;
}

function buildWhereClause(filterObj, searchKey) {
  let whereClause;
  if (filterObj.course_id) {
    whereClause = {
      course_id: parseInt(filterObj.course_id),
      is_exam_active: filterObj.is_exam_active
    };
  }

  /* if (organization_id) {
    whereClause = {
      ...whereClause,
      organization_id: parseInt(organization_id),
    };
  } */
  if (searchKey) {
    whereClause = {
      ...whereClause,
      OR: [
        {
          exam_name: {
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



async function updateExamScheduled(filter, data) {
  const course = await prisma.exam_schedule.update({
    where: filter,
    data,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}


async function deleteScheduledExam(filter) {
  const course = await prisma.exam_schedule.delete({
    where: filter,
    select: courseOutputData,
  });

  if (course) {
    return course;
  }
  return;
}

async function getAllExamScheduleCount(filterObj, searchKey) {
  const coursesCount = await prisma.exam_schedule.count({
    where: buildWhereClause(filterObj, searchKey),
  });

  return coursesCount;
}


async function getAllExamScheduleForStudent(
  searchKey,
  sortBy,
  filterObj,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const courses = await prisma.exam_schedule.findMany({
    where: {
      ...buildWhereClause(filterObj, searchKey),
      start_time: {
        gte: new Date(), // This ensures CURRENT_DATE <= start_time
      }, 
    },
    select: examOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (courses) {
    return courses;
  }
  return;
}

module.exports = {
  createExam,
  getAllExamSchedule,
  getAllExamScheduleCount,
  findExamByScheduleId,
  updateExamScheduled,
  deleteScheduledExam,
  getAllExamScheduleForStudent,
  findExamByScheduleIdForReceipt
};
