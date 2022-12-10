const config = require("../config/db.config.js");

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const db = {};

db.prisma = prisma;

module.exports = db;
