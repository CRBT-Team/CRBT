const longForms = {
  second: 's',
  minute: 'm',
  hour: 'h',
  day: 'd',
  week: 'w',
  month: 'M',
  year: 'y',
};

const dates = {
  s: 1 * 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  M: 30 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
};

export function ms(time: string) {
  let ms = 0;
  let timeStr = time.replaceAll(' ', '');

  Object.keys(longForms).forEach((key) => {
    const regex = new RegExp(`${key}s?`, 'g');
    timeStr = timeStr.replace(regex, longForms[key]);
  });

  Object.keys(dates).forEach((key) => {
    const regex = new RegExp(`\\d+${key}`, 'g');
    timeStr = timeStr.replace(regex, (match) => {
      const num = parseInt(match.replace(key, ''));
      ms += num * dates[key];
      return '';
    });
  });

  return ms;
}

export function toShortForm(time: string) {
  let timeStr = time.replaceAll(' ', '');

  Object.keys(longForms).forEach((key) => {
    const regex = new RegExp(`${key}s?`, 'g');
    timeStr = timeStr.replace(regex, longForms[key]);
  });

  Object.keys(dates).forEach((key) => {
    const regex = new RegExp(`\\d+${key}`, 'g');
    timeStr = timeStr.replace(regex, (match) => {
      const num = parseInt(match.replace(key, ''));
      return `${num}${key}`;
    });
  });

  return timeStr;
}

export function isValidTime(time: string) {
  return !!ms(time);
  // Object.keys(longForms).forEach((key) => {
  //   const regex = new RegExp(`${key}s?`, 'g');
  //   time = time.replace(regex, longForms[key]);
  // });

  // return /^\d+\s?[smhdwMy]$/.test(time);
}
