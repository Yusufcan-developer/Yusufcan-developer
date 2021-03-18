//React
import React, { useState, useEffect } from "react";

//Redux
import { Switch } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

//Configs
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import 'moment/locale/tr';
moment.locale('tr');
var jwtDecode = require('jwt-decode');

//AddressDelivery status change
function handleChangeAddressDelivery(value) {
    localStorage.setItem('isPointAddressDelivery', value);
    window.location.reload(false);
}

export default function TopbarAdressDelivery() {
  let isPointAddressDelivery = localStorage.getItem('isPointAddressDelivery');
  if(isPointAddressDelivery==='true'){isPointAddressDelivery=true}
  else{isPointAddressDelivery=false}

  return (    
    <Switch checked={isPointAddressDelivery} checkedChildren="Adrese teslim" unCheckedChildren="Adrese teslim" onChange={handleChangeAddressDelivery} />
  );
}