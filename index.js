const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const main = async () => {
  console.log(
    ['e', 'a', 'b'].map((_) => [])

    // await prisma.polls.create({
    //   data: {
    //     id: '949329978972045382/951160253926481970',
    //     creator_id: '327690719085068289',
    //     voters: [
    //       { user_id: '327690719085068289', option_id: 2 },
    //       { user_id: '216136238426619904', option_id: 1 },
    //     ],
    //   },
    // })
  );
};

main();
