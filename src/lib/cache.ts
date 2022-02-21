import Cache from 'node-cache';

export const cache = new Cache({
  stdTTL: 60 * 60 * 24,
  checkperiod: 60 * 60 * 24,
  useClones: false,
});
