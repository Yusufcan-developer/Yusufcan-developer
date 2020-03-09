import Enlang from './entries/en-US';
import Trlang from './entries/tr_TR';

import { addLocaleData } from 'react-intl';

const AppLocale = {
  en: Enlang,
  tr: Trlang,
};
addLocaleData(AppLocale.en.data);
addLocaleData(AppLocale.tr.data);

export default AppLocale;
