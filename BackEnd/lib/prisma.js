const { PrismaClient } = require("@prisma/client");

// One shared client for the whole app; creating one per controller exhausts DB connections.
const prisma = new PrismaClient();

module.exports = prisma;
