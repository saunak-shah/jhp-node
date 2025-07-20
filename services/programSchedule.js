const { prisma } = require("../prisma/client");

const programScheduleOutputData = {
  schedule_id: true,
  program_id: true,
  registration_starting_date: true,
  registration_closing_date: true,
  program_location: true,
  created_at: true,
  program_starting_date: true,
  program_ending_date: true,
  is_program_active: true,
  program: {
    select: {
      program_id: true,
      program_name: true,
      file_url: true,
      program_description: true,
    },
  },
  student_apply_program: {
    select: {
      student_apply_program_id: true,
      schedule_id: true,
      student_id: true,
      reg_id: true,
    },
  },
};

async function createProgramSchedule(data) {
  const program = await prisma.program_schedule.create({
    data,
    select: programScheduleOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function findProgramScheduleByScheduleId(scheduleId) {
  const program = await prisma.program_schedule.findUnique({
    where: {
      schedule_id: scheduleId,
    },
    select: programScheduleOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function findProgramScheduleByScheduleIdForReceipt(scheduleId) {
  const programScheduleReceipt = await prisma.student_apply_program.findFirst({
    where: {
      schedule_id: scheduleId,
    },
    orderBy: {
      created_at: "desc", // or any other timestamp field
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
      program_schedule: {
        select: {
          schedule_id: true,
          program_id: true,
          program_starting_date: true,
          program_ending_date: true,
          registration_starting_date: true,
          registration_closing_date: true,
          program_location: true,
          is_program_active: true,
          created_at: true,
          program: {
            select: {
              program_id: true,
              program_name: true,
              file_url: true,
              program_description: true,
            },
          },
        },
      },
    },
  });
  if (programScheduleReceipt) {
    return programScheduleReceipt;
  }
  return;
}

async function getAllProgramSchedule(
  searchKey,
  sortBy,
  filterObj,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const programs = await prisma.program_schedule.findMany({
    where: buildWhereClause(filterObj, searchKey),
    select: programScheduleOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (programs) {
    return programs;
  }
  return;
}

function buildWhereClause(filterObj, searchKey) {
  let whereClause;
  if (filterObj.program_id) {
    whereClause = {
      program_id: parseInt(filterObj.program_id),
      is_program_active: filterObj.is_program_active,
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
          program: {
            program_name: {
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
    program_starting_date: "desc",
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

async function updateProgramScheduled(filter, data) {
  const program = await prisma.program_schedule.update({
    where: filter,
    data,
    select: programScheduleOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function deleteScheduledProgram(filter) {
  const program = await prisma.program_schedule.delete({
    where: filter,
    select: programScheduleOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function getAllProgramScheduleCount(filterObj, searchKey) {
  const programsCount = await prisma.program_schedule.count({
    where: buildWhereClause(filterObj, searchKey),
  });

  return programsCount;
}

async function getAllProgramScheduleForStudent(
  searchKey,
  sortBy,
  filterObj,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const programs = await prisma.program_schedule.findMany({
    where: {
      ...buildWhereClause(filterObj, searchKey),
    },
    select: programScheduleOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (programs) {
    return programs;
  }
  return;
}

async function getAllProgramScheduleForStudentCount(searchKey, filterObj) {
  const programsCount = await prisma.program_schedule.count({
    where: {
      ...buildWhereClause(filterObj, searchKey),
    },
  });

  if (programsCount) {
    return programsCount;
  }
  return;
}

module.exports = {
  createProgramSchedule,
  getAllProgramSchedule,
  getAllProgramScheduleCount,
  findProgramScheduleByScheduleId,
  updateProgramScheduled,
  deleteScheduledProgram,
  getAllProgramScheduleForStudent,
  getAllProgramScheduleForStudentCount,
  findProgramScheduleByScheduleIdForReceipt,
};
