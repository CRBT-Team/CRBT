// remixed from https://github.com/vegeta897/snow-stamp/blob/main/src/convert.js

import dayjs from 'dayjs';

export const snowStamp = (snowflake: string) =>
  dayjs(parseInt(snowflake) / 4194304 + 1420070400000);
