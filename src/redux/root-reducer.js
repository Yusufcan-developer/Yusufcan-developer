import { combineReducers } from 'redux';
import App from '@iso/redux/app/reducer';
import Auth from '@iso/redux/auth/reducer';

import Ecommerce from '@iso/redux/ecommerce/reducer';
import ThemeSwitcher from '@iso/redux/themeSwitcher/reducer';
import Invoices from '@iso/redux/invoice/reducer';
import LanguageSwitcher from '@iso/redux/languageSwitcher/reducer';

export default combineReducers({
  Auth,
  App,
  ThemeSwitcher,
  LanguageSwitcher,

  Ecommerce,  
 
  Invoices,

});
