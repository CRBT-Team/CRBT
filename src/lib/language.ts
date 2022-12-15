import { Interaction } from 'discord.js';
import bg from '../../data/languages/bg.json';
import cs from '../../data/languages/cs.json';
import da from '../../data/languages/da.json';
import de from '../../data/languages/de.json';
import el from '../../data/languages/el.json';
import en_GB from '../../data/languages/en-GB.json';
import en_US from '../../data/languages/en-US.json';
import es_ES from '../../data/languages/es-ES.json';
import fi from '../../data/languages/fi.json';
import fr from '../../data/languages/fr.json';
import hi from '../../data/languages/hi.json';
import hr from '../../data/languages/hr.json';
import hu from '../../data/languages/hu.json';
import it from '../../data/languages/it.json';
import ja from '../../data/languages/ja.json';
import ko from '../../data/languages/ko.json';
import lt from '../../data/languages/lt.json';
import nl from '../../data/languages/nl.json';
import no from '../../data/languages/no.json';
import pl from '../../data/languages/pl.json';
import pt_BR from '../../data/languages/pt-BR.json';
import ro from '../../data/languages/ro.json';
import ru from '../../data/languages/ru.json';
import sv_SE from '../../data/languages/sv-SE.json';
import th from '../../data/languages/th.json';
import tr from '../../data/languages/tr.json';
import uk from '../../data/languages/uk.json';
import vi from '../../data/languages/vi.json';
import zh_CN from '../../data/languages/zh-CN.json';
import zh_TW from '../../data/languages/zh-TW.json';
import { deepMerge } from './functions/deepMerge';

export const languages = {
  bg,
  cs,
  da,
  de,
  el,
  'en-GB': en_GB,
  'en-US': en_US,
  'es-ES': es_ES,
  fi,
  fr,
  hi,
  hr,
  hu,
  it,
  ja,
  ko,
  lt,
  nl,
  no,
  pl,
  'pt-BR': pt_BR,
  ro,
  ru,
  'sv-SE': sv_SE,
  th,
  tr,
  uk,
  vi,
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
};

type StringsStructure = typeof en_US;

function accessObjectValue<T extends any>(keysDotAccess: string, obj: T) {
  return keysDotAccess.split('.').reduce((o, i) => o?.[i], obj) as T | string;
}

// props to https://stackoverflow.com/a/47058976 for this wonderful type thing
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

type TopLevelKeys = keyof StringsStructure;
type DottedLanguageObjectStringPaths = Join<PathsToStringProps<StringsStructure>, '.'>;

type StringArgument = TopLevelKeys | DottedLanguageObjectStringPaths;

export function t<K extends StringArgument>(
  i: Interaction | string,
  stringKey: K,
  interpolations?: K extends DottedLanguageObjectStringPaths
    ? Record<string, { toString: () => string }>
    : never
): K extends TopLevelKeys ? StringsStructure[K] : string {
  const locale = typeof i === 'string' ? i : i.locale;
  const defaultData = accessObjectValue(stringKey, languages['en-US']);
  const localizedData = accessObjectValue(stringKey, languages[locale]);

  if (!locale || !languages[locale]) {
    return defaultData as any;
  }

  const string: string | StringsStructure =
    typeof defaultData === 'object' && !Array.isArray(defaultData)
      ? deepMerge(defaultData, localizedData)
      : localizedData || defaultData;

  if (interpolations && typeof string === 'string') {
    return Object.keys(interpolations).reduce(
      (interpolated, key) =>
        interpolated.replace(new RegExp(`{${key}}`, 'g'), `${interpolations[key]}`),
      string
    ) as any;
  } else {
    return string as any;
  }
}

export function getAllLanguages<K extends StringArgument>(
  stringKey: K,
  changeString?: K extends DottedLanguageObjectStringPaths
    ? (str: string, lang: string) => string
    : never
): {
  [k: string]: K extends TopLevelKeys ? StringsStructure[K] : string;
} {
  return Object.keys(languages).reduce((acc, lang) => {
    const translation = t(lang, stringKey);
    return {
      ...acc,
      [lang]:
        changeString && typeof translation === 'string'
          ? changeString(translation, lang)
          : translation,
    };
  }, {});
}
