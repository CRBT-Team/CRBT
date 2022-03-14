const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const main = async () => {
  console.log(new Date('07/05/2006').toISOString().split('T')[0]);
  // await prisma.profiles.update({
  //   where: { id: '327690719085068289' },
  //   data: {
  //     location: 'France',
  //   },
  // });
};

main();
