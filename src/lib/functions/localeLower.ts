export const localeLower = (str: string, locale: string) =>
  str
    .toLocaleLowerCase(locale)
    .replaceAll(' ', '_')
    .replaceAll(/[^-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/gu, '');
