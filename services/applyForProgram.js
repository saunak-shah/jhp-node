const { prisma } = require("../prisma/client");

const appliedProgramOutputData = {
  student_apply_program_id: true,
  created_at: true,
  updated_at: true,
  reg_id: true,
  student_id: true,
  program_id: true,
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
  program: {
    select: {
      program_starting_date: true,
      program_ending_date: true,
      registration_starting_date: true,
      registration_closing_date: true,
      program_location: true,
      is_program_active: true,
      created_at: true,
      updated_at: true,
      program_id: true,
      program_name: true,
      file_url: true,
      program_description: true,
      created_by: true,
      organization_id: true,
    },
  },
};

async function applyForProgram(data) {
  const application = await prisma.student_apply_program.create({
    data,
    select: appliedProgramOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function findApplicationByRegistrationId(registrationId) {
  const application = await prisma.student_apply_program.findUnique({
    where: {
      reg_id: registrationId,
    },
    select: appliedProgramOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

function buildWhereClause(
  searchKey,
  programId = undefined,
  userId = undefined
) {
  let whereClause;

  if (programId) {
    whereClause = {
      program_id: parseInt(programId),
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
          program: {
            program_name: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          program: {
            program_description: {
              contains: searchKey,
              mode: "insensitive",
            },
          },
        },
        {
          program_location: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          program: {
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
  const applications = await prisma.student_apply_program.findMany({
    where: buildWhereClause(searchKey),
    select: appliedProgramOutputData,
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
  const applicationsCount = await prisma.student_apply_program.count({
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
  const applications = await prisma.student_apply_program.findMany({
    where: buildWhereClause(searchKey, undefined, userId),
    select: appliedProgramOutputData,
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
  const programsCount = await prisma.student_apply_program.count({
    where: buildWhereClause(searchKey, undefined, userId),
  });

  return programsCount;
}

async function getAllApplicationsByProgramId(
  searchKey,
  sortBy,
  programId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  try {
    const applications = await prisma.student_apply_program.findMany({
      where: buildWhereClause(searchKey, programId, undefined),
      select: appliedProgramOutputData,
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

async function getAllApplicationsByProgramIdToDownload(
  searchKey,
  sortBy,
  programId,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const applications = await prisma.student_apply_program.findMany({
    where: buildWhereClause(searchKey, programId, undefined),
    select: {
      student_apply_program_id: true,
      created_at: true,
      updated_at: true,
      student: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          gender: true,
        },
      },
      program: {
        select: {
          program_name: true,
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
      registration_id: application.student_apply_program_id,
      created_at: application.created_at,
      updated_at: application.updated_at,
      student_name:
        application.student.first_name + application.student.last_name,
      program: application.program.program_name,
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

async function getAllApplicationsByProgramIdCount(programId, searchKey) {
  const programsCount = await prisma.student_apply_program.count({
    where: buildWhereClause(searchKey, programId, undefined),
  });

  return programsCount;
}

async function getAllApplicationsByUserIdAndProgramId(userId, programId) {
  const programs = await prisma.student_apply_program.findMany({
    where: {
      student_id: userId,
      program_id: programId,
    },
    select: appliedProgramOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (programs) {
    return programs;
  }
  return;
}

async function updateApplication(filter, data) {
  const application = await prisma.student_apply_program.update({
    where: filter,
    data,
    select: appliedProgramOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

async function deleteApplication(filter) {
  const application = await prisma.student_apply_program.delete({
    where: filter,
    select: appliedProgramOutputData,
  });

  if (application) {
    return application;
  }
  return;
}

module.exports = {
  applyForProgram,
  findApplicationByRegistrationId,
  getAllApplications,
  getAllApplicationsCount,
  getAllApplicationsByProgramId,
  getAllApplicationsByProgramIdCount,
  getAllApplicationsByUserId,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByProgramIdToDownload,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserIdAndProgramId,
};
