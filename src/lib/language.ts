//@ts-nocheck
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

export const languages: {
  [k: string]: typeof en_US;
} = {
  bg: deepMerge(en_US, bg),
  cs: deepMerge(en_US, cs),
  da: deepMerge(en_US, da),
  de: deepMerge(en_US, de),
  el: deepMerge(en_US, el),
  'en-GB': deepMerge(en_US, en_GB),
  'en-US': en_US,
  'es-ES': deepMerge(en_US, es_ES),
  fi: deepMerge(en_US, fi),
  fr: deepMerge(en_US, fr),
  hi: deepMerge(en_US, hi),
  hr: deepMerge(en_US, hr),
  hu: deepMerge(en_US, hu),
  it: deepMerge(en_US, it),
  ja: deepMerge(en_US, ja),
  ko: deepMerge(en_US, ko),
  lt: deepMerge(en_US, lt),
  nl: deepMerge(en_US, nl),
  no: deepMerge(en_US, no),
  pl: deepMerge(en_US, pl),
  'pt-BR': deepMerge(en_US, pt_BR),
  ro: deepMerge(en_US, ro),
  ru: deepMerge(en_US, ru),
  'sv-SE': deepMerge(en_US, sv_SE),
  th: deepMerge(en_US, th),
  tr: deepMerge(en_US, tr),
  uk: deepMerge(en_US, uk),
  vi: deepMerge(en_US, vi),
  'zh-CN': deepMerge(en_US, zh_CN),
  'zh-TW': deepMerge(en_US, zh_TW),
};

// export const getStrings = (language: string) => {
//   const dataDefault = languages['en-US'];
//   const data = languages[language] ?? dataDefault;

//   // deep merge dataDefault and data

//   return deepMerge(dataDefault, data) as typeof en_US;
// };
