import antdTr from 'antd/lib/locale-provider/tr_TR';
import appLocaleData from 'react-intl/locale-data/tr';
import trMessages from '../locales/tr_TR.json';
// import { getKeys, getValues } from '../conversion';
// getValues(enMessages);

const TrLang = {
  messages: {
    ...trMessages,
  },
  antd: antdTr,
  locale: 'tr',
  data: appLocaleData,
};
export default TrLang;
