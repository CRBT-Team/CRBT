import { db } from '$lib/db';

export const Jobs = {
  LevelReqs: {
    1: 0,
    2: 800,
    3: 2400,
    4: 4800,
  },
  LevelNames: {
    1: 'Beginner',
    2: 'Apprentice',
    3: 'Journeyman',
    4: 'Master',
  },
  TypeNames: {
    FARMER: 'Farmer',
    CASHIER: 'Cashier',
    BAKER: 'Baker',
    COOK: 'Cook',
    DEVELOPER: 'Developer',
    DOCTOR: 'Doctor',
    TEACHER: 'Teacher',
    ENGINEER: 'Engineer',
    POLICE_OFFICER: 'Police Officer',
    FIREFIGHTER: 'Firefighter',
    NURSE: 'Nurse',
    LAWYER: 'Lawyer',
    MUSICIAN: 'Musician',
    ATHLETE: 'Athlete',
    STREAMER: 'Streamer',
    ARTIST: 'Artist',
    WRITER: 'Writer',
    INFLUENCER: 'Influencer',
  },
  TypeDescriptions: {
    FARMER: 'Harvest crops, and sell them for Purplets',
    CASHIER: 'Scan these barcodes and earn some Purplets',
    BAKER: 'Make cakes, bake bread, bread cakes and cake breads for Purplets 🍞',
    COOK: 'Cook delicious food from around the world!',
    DEVELOPER: 'Develop new software, games and all kinds of fun stuff',
    DOCTOR: 'Save people by healing their wounds and curing diseases and illnesses',
    TEACHER: 'Teach people how to be better people',
    ENGINEER: 'Build machines, tools and make the world a better place',
    POLICE_OFFICER: 'Protect people from crime and the law',
    FIREFIGHTER: 'Fight fires, protect the city and save lives',
    NURSE: 'Treat people and save lives',
    LAWYER: 'Sue people for their crimes and get them to pay their bills',
    MUSICIAN: 'Sing songs, play music and make music and build your musician career',
    ATHLETE: 'Compete in all kinds of sports and win Purplets for your achievements',
    STREAMER:
      'Stream your favorite games, make funny jokes and talk with your viewers to earn Purplets from them',
    ARTIST: 'Create art, make posters and other art and sell them for Purplets',
    WRITER: 'Write stories, write novels and write books and sell them for Purplets',
    INFLUENCER: 'Spread your message and get people to follow you',
  },
};

export function getLevelFromExp(exp: number) {
  let level = 1;
  for (const [key, value] of Object.entries(Jobs.LevelReqs)) {
    if (exp >= value) {
      level = parseInt(key);
    } else {
      break;
    }
  }
  return level;
}

db.users.create({
  data: {
    id: '',
  },
});
