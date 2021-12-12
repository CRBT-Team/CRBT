// remixed from https://github.com/vegeta897/snow-stamp/blob/main/src/convert.js

import dayjs from 'dayjs';

export function snowStamp(snowflake: string, epoch = DISCORD_EPOCH) {
  return dayjs(parseInt(snowflake) / 4194304 + epoch);
}
export const DISCORD_EPOCH = 1420070400000;
