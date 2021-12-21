import { db, vars } from '$lib/db';

export async function getVar(variable: string, id?: string): Promise<any> {
  if (!vars[variable]) throw new Error('Variable does not exist');
  if (id) {
    const res = (await db.from(variable).select('value').eq('id', id)).data[0];
    return res ? res.value : vars[variable];
  } else return vars[variable];
}
