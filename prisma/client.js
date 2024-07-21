const { PrismaClient } = require("@prisma/client");
require('dotenv').config();

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query', 'error', 'info', 'warn']
})

module.exports = {prisma}