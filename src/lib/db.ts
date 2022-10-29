import pkg from '@prisma/client';

export const prisma = new pkg.PrismaClient();

prisma.$connect().then(() => console.log('Connected to Prisma'));
