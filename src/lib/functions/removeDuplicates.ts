export function removeDuplicates<T extends any>(arr: T[]): T[] {
  return arr.filter((value, index, arr) => {
    const _value = JSON.stringify(value);
    return index === arr.findIndex((obj) => JSON.stringify(obj) === _value);
  });
}
