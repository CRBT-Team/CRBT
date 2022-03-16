export const trimURL = (url: string) => {
  // trim out the https part trailing slashes and the params
  return url
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/\?.*$/, '')
    .replace(/\/$/, '');
};
