import Cache from 'node-cache';

export const cache = new Cache({
  stdTTL: 60 * 60 * 24,
  checkperiod: 60 * 60 * 24,
  useClones: false,
});

export async function fetchWithCache<T>(
  cacheKey: string,
  fetchMethod: () => Promise<T>,
  force = false,
  ttl: number = 60 * 3
): Promise<T> {
  const result = force ? await fetchMethod() : cache.get<T>(cacheKey) ?? (await fetchMethod());

  cache.set(cacheKey, result, ttl);

  return result;
}
