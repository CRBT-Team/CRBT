import pkg from '@prisma/client';

export const db = new pkg.PrismaClient();

db.$connect().then(() => console.log('Connected to Prisma'));
