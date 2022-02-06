const dayjs = require('dayjs');

let expiration;
let timeMS;
const w = 'tomorrow';

if (w.trim().toLowerCase().startsWith('tomorrow')) {
  const tomorrow = dayjs().add(1, 'day');
  const time = w.split(' ').length === 1 ? null : w.split(' ')[1];
  expiration = time ? dayjs(`${tomorrow.format('YYYY-MM-DD')}T${time}Z`) : tomorrow;
  timeMS = expiration.diff(dayjs());
}

console.log(expiration);
console.log(timeMS);
