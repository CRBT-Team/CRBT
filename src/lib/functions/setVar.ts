import { db, vars } from '$lib/db';

export async function setVar(variable: string, id: string, value: any): Promise<any> {
  if (!vars[variable]) throw new Error('Variable does not exist');

  try {
    return await db.from(variable).upsert({
      id,
      value,
    });
  } catch (err) {
    console.error(err);
  }
}
