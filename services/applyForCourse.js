const { prisma } = require("../prisma/client");

const appliedExamOutputData = {
  student_apply_course_id: true,
  created_at: true,
  updated_at: true,
  reg_id: true,
  course_id: true,
  student_id: true,
  status: true,
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
  course: {
    select: {
      course_id: true,
      course_name: true,
      file_url: true,
      course_description: true,
    },
  },
  result: {
    select: {
      reg_id: true,
      score: true,
      course_score: true,
      course_passing_score: true
    }
  }
};

async function applyForCourse(data) {
  const application = await prisma.student_apply_course.create({
    data,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.student_apply_course.findUnique({
    where: {
      student_apply_course: {
        reg_id: registrationId,
      },
    },
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

function buildWhereClause(searchKey, courseId = undefined, userId = undefined) {
  let whereClause;

  if (courseId) {
    whereClause = {
      schedule_id: parseInt(courseId),
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
          course: {
            course_name: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          course: {
            course_description: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          course: {
            file_url: {
              contains: searchKey,
              mode: "insensitive",
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
        {
          student: {
            address: {
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
  const applications = await prisma.student_apply_course.findMany({
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
  const applicationsCount = await prisma.student_apply_course.count({
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
  const applications = await prisma.student_apply_course.findMany({
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

async function getAllApplicationsByCourseId(
  searchKey,
  sortBy,
  examId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
 try {
   const applications = await prisma.student_apply_course.findMany({
     
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
    throw new Error(error?.message || 'Unable to fetch applications')
 }
}

async function getAllApplicationsByCourseIdToDownload(
  searchKey,
  sortBy,
  examId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_course.findMany({
    where: buildWhereClause(searchKey, examId, undefined),
    select: {
      student_apply_course_id: true,
      reg_id: true,
      created_at: true,
      updated_at: true,
      exam_schedule:{
        select:{
          exam_name: true,
          start_time: true,
          end_time: true,
          total_marks: true,
          passing_score: true,
        }
      },
      result: {
        select: {
          score: true
        }
      },      
      student: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          gender: true,
        },
      },
      course: {
        select: {
          course_name: true,
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
      registration_id: application.reg_id,
      student_name:
        application.student.first_name + application.student.last_name,
      course: application.course.course_name,
      exam_name: application.exam_schedule.exam_name,
      phone_number: application.student.phone_number,
      email: application.student.email,
      created_at: application.created_at,
      start_time: application.exam_schedule.start_time,
      end_time: application.exam_schedule.end_time,
      total_marks: application.exam_schedule.total_marks,
      passing_score: application.exam_schedule.passing_score,
      score: application.result[0]?.score,
    });
  }

  if (data && data.length > 0) {
    return data;
  }
  return;
}

async function getAllApplicationsByCourseIdCount(examId, searchKey) {
  const coursesCount = await prisma.student_apply_course.count({
    where: buildWhereClause(searchKey, examId, undefined),
  });

  return coursesCount;
}

async function getAllApplicationsByUserIdAndCourseId(userId, courseId, scheduleId) {
  const courses = await prisma.student_apply_course.findMany({
    where: {
      student_id: userId,
      course_id: courseId,
      schedule_id: scheduleId,
    },
    select: appliedExamOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (courses) {
    return courses;
  }
  return;
}

async function updateApplication(filter, data) {
  const application = await prisma.student_apply_course.update({
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
  const application = await prisma.student_apply_course.delete({
    where: filter,
    select: appliedExamOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

module.exports = {
  applyForCourse,
  findApplicationByRegistrationId,
  getAllApplications,
  getAllApplicationsCount,
  getAllApplicationsByCourseId,
  getAllApplicationsByCourseIdCount,
  getAllApplicationsByUserId,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByCourseIdToDownload,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndCourseId,
};
