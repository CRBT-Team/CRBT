import pkg from '@prisma/client';

export const db = new pkg.PrismaClient({
  datasources: {
    db: {
      url: process.argv.includes('--dev') ? process.env.DB_DEV_URL : process.env.DATABASE_URL,
    },
  },
});

db.$connect().then(() => console.log('Connected to Prisma'));
