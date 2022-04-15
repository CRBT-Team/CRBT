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

export const getStrings = (language: string): typeof en_US => {
  const dataDefault = languages['en-US'];
  const data = languages[language];
  if (!data) {
    return dataDefault;
  }
  return deepMerge(dataDefault, data) as typeof en_US;
};
