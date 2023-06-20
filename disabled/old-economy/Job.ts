import { jobs } from '$lib/env';
import { ms } from '$lib/functions/ms';

export const LevelReqs = {
    1: 0,
    2: 800,
    3: 2400,
    4: 4800,
  },
  LevelNames = {
    1: 'Beginner',
    2: 'Apprentice',
    3: 'Journeyman',
    4: 'Master',
  };

export class Job {
  public type: string;
  public income: number;
  public cooldown: number;
  public maxloss: number;
  public exp: number;
  public level: number;

  constructor(jobType: string, exp: number) {
    this.type = jobType;

    const findJob = jobs[this.type];
    this.exp = exp;
    this.level = this.getLevel();
    this.income = findJob.income[this.level - 1];
    this.cooldown = ms(findJob.cooldown[this.level - 1] + 'm');
    this.maxloss = findJob.maxloss;
  }

  public getLevel() {
    let level = 1;
    Object.entries(LevelReqs).forEach(([key, value]) => {
      level = this.exp >= value ? Number(key) : level;
    });
    return level;
  }
}
