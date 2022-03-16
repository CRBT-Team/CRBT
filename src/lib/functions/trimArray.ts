export const trimArray = (arr: string[], max: number = 10) => {
  if (arr.length > max) {
    const len = arr.length - max;
    arr = arr.slice(0, max);
    arr.push(`and ${len} more...`);
  }
  return arr;
};
