import en_US from '../../data/languages/en-US.json';
import fr from '../../data/languages/fr.json';

const languages = {
  'en-US': en_US,
  fr: fr,
};

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
  // const path = `./data/languages/${language}.json`;

  // const data = JSON.parse(readFileSync(path, 'utf8'));

  const data = languages[language][name];

  // data.meta.options = new Map(
  //   data.meta.options.map(({ name, description, choices }) => [name, { description, choices }])
  // );

  return data as commandStrings;
};
