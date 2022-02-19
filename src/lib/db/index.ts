import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { PostgrestResponse } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache as nodeCache } from '../cache';
import { db as supabase } from './supabase';

export * from './config';
export { local } from './local';
export { vars } from './variables';

enum symbols {
  '==' = 'eq',
  '>' = 'gt',
  '<' = 'lt',
  '!=' = 'neq',
}

class CRBTDatabase {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }
  /**
   * @param {string} key The table and the column name. Seperate with "."
   * @param {T | T[]} value A partial value to update
   * @param {boolean} cache Whether to add the data to the cache (only uses the column name)
   * @param {[keyof T, '==' | '>' | '<', T[keyof T]]} filter To filter the value idk
   * @returns Promise
   */
  async set<T>(
    key: string,
    value: T,
    cache?: boolean,
    filter?: [keyof T, keyof typeof symbols, T[keyof T]]
  ): Promise<T> {
    const query = key.split('.');
    if (cache) {
      nodeCache.set(query.at(-1), value);
      return value;
    }

    return (
      (await this.db.from<T>(query[0]).insert(value))[symbols[filter[1]]](
        filter[0],
        filter[2]
      ) as PostgrestResponse<T>
    ).body[0];
  }

  async get<T>(
    key: string,
    filter?: [keyof T, keyof typeof symbols, T[keyof T]]
  ): Promise<T | Partial<T> | Partial<T>[]> {
    const query = key.split('.');

    const fromCache = nodeCache.get<T>(query.at(-1));
    if (fromCache) {
      return fromCache;
    }
    return (await this.db.from<T>(query[0]).select(query[0] ?? '*'))[symbols[filter[1]]](
      filter[0],
      filter[2]
    ).body;
  }

  async delete<T>() {}
}

export const db = new CRBTDatabase(supabase);

db.get<APIProfile>('profiles.color', ['crbt_banner', '==', '']);
