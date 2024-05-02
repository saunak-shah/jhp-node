const { prisma } = require("../prisma/client");

const findUserSelection = {
  userId: true,
  createdAt: true,
  updatedAt: true,
  orgId: true,
  firstName: true,
  lastName: true,
  middleName: true,
  fatherName: true,
  motherName: true,
  phoneNumber: true,
  whatsappNumber: true,
  email: true,
  password: true,
  birthDate: true,
  gender: true,
  uniqueId: true
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

async function findUserByUniqueId(uniqueId) {
  const user = await prisma.users.findUnique({
    where: {
      uniqueId
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
      resetPasswordToken: token,
      resetPasswordTokenExpiration: {
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

async function findUserByResetEmailToken(uniqueId, token) {
  const user = await prisma.users.findFirst({
    where: {
      uniqueId,
      resetEmailToken: token,
      resetEmailTokenExpiration: {
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

async function getAllUsers(){
  const users = await prisma.users.findMany({
    select: findUserSelection,
    orderBy: {
      birthDate: "asc"
    }
  })

  if(users){
    return users;
  }
  return;
}

async function isAdmin(userId){
  const user = await prisma.admin.findUnique({
    where: {
      userId,
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
  updateUser,
  deleteUser,
  findUserByResetPasswordToken,
  findUserByResetEmailToken,
  deleteUser,
  getAllUsers,
  isAdmin
};
