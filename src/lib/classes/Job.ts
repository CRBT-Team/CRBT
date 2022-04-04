import { jobs } from '$lib/db';
import { Jobs } from '$lib/util/Jobs';

export class Job {
  public id: string;
  public name: string;
  public description: string;

  constructor(jobType: string) {
    this.id = jobType;

    const findJob = jobs[this.id];
    this.name = Jobs.TypeNames[findJob.name];
  }

  public getLevelFromExp(exp: number) {
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
}
