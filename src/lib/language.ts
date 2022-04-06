import { existsSync, readFileSync } from 'fs';

type commandStrings = {
  // meta: {
  //   name: string;
  //   description: string;
  //   options?: Map<string, { description: string; choices: string[] }>;
  //   // options?: Map<string, [string, string] | [string, string, string[]]>;
  // };
  errors?: {
    [k: string]: string;
  };
  strings: {
    [k: string]: string;
  };
};

export const getStrings = (language: string, name: string) => {
  const path = `./data/languages/${language}/${name}.json`;
  const enPath = `./data/languages/en-US/${name}.json`;

  const dataDefault = JSON.parse(readFileSync(enPath, 'utf8'));
  const data = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : dataDefault;

  const merged = {};

  Object.keys(dataDefault).forEach((key) => {
    merged[key] = {};
    Object.keys(dataDefault[key]).forEach((key2) => {
      if (data[key][key2] === undefined) {
        merged[key][key2] = dataDefault[key][key2];
      } else {
        merged[key][key2] = data[key][key2];
      }
    });
  });

  // data.meta.options = new Map(
  //   data.meta.options.map(({ name, description, choices }) => [name, { description, choices }])
  // );

  return merged as commandStrings;
};
