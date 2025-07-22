const { prisma } = require("../prisma/client");
const { findApplicationByProgramIdAndUserId } = require("./applyForProgram");

const programOutputData = {
  program_id: true,
  created_at: true,
  updated_at: true,
  program_name: true,
  file_url: true,
  program_description: true,
  registration_starting_date: true,
  registration_closing_date: true,
  program_location: true,
  program_starting_date: true,
  program_ending_date: true,
  is_program_active: true,
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
  userId,
  sortOrder = "asc",
  limit = 100,
  offset = 0,
  is_program_active = true,
  fetch_for_student = false
) {
  const programs = await prisma.program.findMany({
    where: buildWhereClause(organization_id, searchKey, is_program_active),
    select: programOutputData,
    orderBy: buildOrderClause(sortBy, sortOrder),
    take: parseInt(limit),
    skip: parseInt(offset),
  });
  if (fetch_for_student && userId) {
    await Promise.all(programs.map(async (program) => {
      const isApplied = await findApplicationByProgramIdAndUserId(
        program.program_id,
        userId
      );
      program.status = isApplied ? "Applied" : "Not Applied";
    }));
  }
  if (programs) {
    return programs;
  }
  return;
}

function buildWhereClause(organization_id, searchKey, is_program_active) {
  let whereClause = {
    is_program_active,
  };

  if (searchKey) {
    whereClause = {
      ...whereClause,
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
    created_at: "desc",
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

async function getAllProgramsCount(organization_id, searchKey, is_program_active) {
  const programsCount = await prisma.program.count({
    where: buildWhereClause(organization_id, searchKey, is_program_active),
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
};
