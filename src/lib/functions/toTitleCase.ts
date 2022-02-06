// declare interface String {
//   /**
//    * Converts a string to a title case
//    * @example 'hello world'.toTitleCase() // 'Hello World'
//    */
//   toTitleCase(): string;
// }
// String.prototype.toTitleCase = function () {
//   return this.split(' ')
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(' ');
// };

export function toTitleCase(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
