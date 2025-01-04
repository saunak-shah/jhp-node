const { prisma } = require("../prisma/client");

const groupOutputData = {
  group_id: true,
  created_at: true,
  updated_at: true,
  group_name: true,
  teacher_ids: true,
};

async function createGroup(data) {
  const group = await prisma.groups.create({
    data,
    select: groupOutputData,
  });

  if (group) {
    return group;
  }
  return;
}

async function findGroupById(groupId) {
  const group = await prisma.groups.findUnique({
    where: {
      group_id: groupId,
    },
    select: groupOutputData,
  });

  if (group) {
    return group;
  }
  return;
}

async function getAllGroups(
  searchKey,
  sortBy,
  organization_id,
  sortOrder = "asc",
  limit = 100,
  offset = 0
) {
  const queryParts = [
    `
          SELECT 
            g.group_id,
            g.group_name,
            g.teacher_ids,
            STRING_AGG(t.teacher_first_name || ' ' || t.teacher_last_name, ', ') AS teacher_names
          FROM groups g
          LEFT JOIN UNNEST(g.teacher_ids) AS new_teacher_id ON TRUE
          LEFT JOIN teacher t ON t.teacher_id = new_teacher_id
          WHERE t.organization_id = $1
        `,
  ];

  const params = [organization_id];
  if (searchKey) {
    queryParts.push(`AND g.group_name ILIKE $${params.length + 1}`);
    params.push(`%${searchKey}%`);
  }

  queryParts.push(`
    GROUP BY g.group_name, g.teacher_ids, g.group_id
    ORDER BY g.${sortBy || "group_name"} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
`);

  params.push(Number(limit), Number(offset));

  const rawQuery = queryParts.join(" ");
  const result = await prisma.$queryRawUnsafe(rawQuery, ...params);

  return result;
}

function buildWhereClause(organization_id, searchKey) {
  let whereClause;

  if (searchKey) {
    whereClause = {
      organization_id,
      OR: [
        {
          group_name: {
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
    group_name: "asc",
  };

  if (!sortOrder) {
    sortOrder = "asc";
  }

  if (sortBy) {
    orderClause = {
      [sortBy]: sortOrder,
    };
  }

  return orderClause;
}

async function getAllCoursesCount(organization_id, searchKey) {
  const groupsCount = await prisma.groups.count({
    where: buildWhereClause(organization_id, searchKey),
  });

  return groupsCount;
}

async function updateGroup(filter, data) {
  const groups = await prisma.groups.update({
    where: filter,
    data,
    select: groupOutputData,
  });

  if (groups) {
    return groups;
  }
  return;
}

async function deleteGroup(filter) {
  const groups = await prisma.groups.delete({
    where: filter,
    select: groupOutputData,
  });

  if (groups) {
    return groups;
  }
  return;
}

module.exports = {
  createGroup,
  findGroupById,
  getAllGroups,
  getAllCoursesCount,
  updateGroup,
  deleteGroup,
};
