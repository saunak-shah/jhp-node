const { prisma } = require("../prisma/client");

const findUserSelection = {
  id: true,
  created_at: true,
  updated_at: true,
  org_id: true,
  first_name: true,
  last_name: true,
  father_name: true,
  phone_number: true,
  address: true,
  email: true,
  password: true,
  birth_date: true,
  gender: true,
  unique_id: true
}

async function createUser(data) {
  const user = await prisma.users.create({
    data,
  });

  if (user) {
    return user;
  }
  return;
}

async function findUserByUniqueId(unique_id) {
  const user = await prisma.users.findUnique({
    where: {
      unique_id
    },
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function findUserById(id) {
  const user = await prisma.users.findUnique({
    where: {
      id
    },
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function findUserByResetPasswordToken(token) {
  const user = await prisma.users.findFirst({
    where: {
      reset_password_token: token,
      reset_password_token_expiration: {
        gte: new Date()
      }
    },
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function findUserByResetEmailToken(unique_id, token) {
  const user = await prisma.users.findFirst({
    where: {
      unique_id,
      reset_email_token: token,
      reset_email_token_expiration: {
        gte: new Date()
      }
    },
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function findUserByEmail(email){
  const user = await prisma.users.findMany({
    where: {
      email
    },
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function updateUser(filter, data){
  const user = await prisma.users.update({
    where: filter,
    data,
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function deleteUser(filter){
  const user = await prisma.users.delete({
    where: filter,
    select: findUserSelection
  })

  if(user){
    return user;
  }
  return;
}

async function getAllUsers(limit, offset, nameFilter){
  const users = await prisma.users.findMany({
    where: {
      unique_id: {
        contains: nameFilter
      }
    },
    select: findUserSelection,
    orderBy: {
      birth_date: "asc"
    },
    take: limit,
    skip: offset
  })

  if(users){
    return users;
  }
  return;
}

async function isAdmin(userId){
  const user = await prisma.master_role.findUnique({
    where: {
      id: userId,
    },
  })

  if(user){
    return user;
  }
  return;
}

module.exports = {
  createUser,
  findUserByUniqueId,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  findUserByResetPasswordToken,
  findUserByResetEmailToken,
  deleteUser,
  getAllUsers,
  isAdmin
};
