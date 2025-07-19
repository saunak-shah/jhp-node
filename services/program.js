const { prisma } = require("../prisma/client");

const programOutputData = {
  program_id: true,
  created_at: true,
  updated_at: true,
  program_name: true,
  file_url: true,
  program_starting_date: true,
  program_ending_date: true,
  program_description: true,
  program_location: true,
  is_active: true,
  registration_starting_date: true,
  registration_closing_date: true,
  created_by: true,
  organization_id: true,
};

async function createProgram(data) {
  const program = await prisma.program.create({
    data,
    select: programOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function findProgramByProgramId(programId) {
  const program = await prisma.program.findUnique({
    where: {
      program_id: programId,
    },
    select: programOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function getAllPrograms(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const programs = await prisma.program.findMany({
    where: buildWhereClause(organization_id, searchKey),
    select: programOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (programs) {
    return programs;
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
          program_name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          program_description: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          program_location: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          file_url: {
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

async function getAllProgramsCount(organization_id, searchKey) {
  const programsCount = await prisma.program.count({
    where: buildWhereClause(organization_id, searchKey),
  });

  return programsCount;
}

async function getAllPendingPrograms(limit, offset) {
  const programs = await prisma.program.findMany({
    where: {
      program_starting_date: {
        gt: Date.now(),
      },
    },
    select: programOutputData,
    orderBy: {
      program_starting_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (programs) {
    return programs;
  }
  return;
}

async function getAllPendingProgramsCount() {
  const programsCount = await prisma.program.count({
    where: {
      program_starting_date: {
        gt: Date.now(),
      },
    },
  });

  return programsCount;
}

async function getAllOngoingPrograms(limit, offset) {
  const programs = await prisma.program.findMany({
    where: {
      program_starting_date: {
        lt: Date.now(),
      },
      program_ending_date: {
        gt: Date.now(),
      },
    },
    select: programOutputData,
    orderBy: {
      program_starting_date: "asc",
    },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  if (programs) {
    return programs;
  }
  return;
}

async function getAllOngoingProgramsCount() {
  const programsCount = await prisma.program.count({
    where: {
      program_starting_date: {
        lt: Date.now(),
      },
      program_ending_date: {
        gt: Date.now(),
      },
    },
  });

  return programsCount;
}

async function updateProgram(filter, data) {
  const program = await prisma.program.update({
    where: filter,
    data,
    select: programOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

async function deleteProgram(filter) {
  const program = await prisma.program.delete({
    where: filter,
    select: programOutputData,
  });

  if (program) {
    return program;
  }
  return;
}

module.exports = {
  createProgram,
  findProgramByProgramId,
  getAllPrograms,
  getAllProgramsCount,
  updateProgram,
  deleteProgram,
  getAllPendingPrograms,
  getAllPendingProgramsCount,
  getAllOngoingPrograms,
  getAllOngoingProgramsCount,
};
