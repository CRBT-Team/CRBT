export const localeLower = (str: string, locale: string) =>
  str
    .toLocaleLowerCase(locale)
    .replaceAll(' ', '_')
    .replaceAll(/\(.*\)/g, '');
