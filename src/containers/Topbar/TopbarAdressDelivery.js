//React
import React, { useState } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Redux
import { Switch } from 'antd';

//Configs
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import enumerations from "../../config/enumerations";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr';
moment.locale('tr');

const TopbarAdressDelivery = () => {

  const history = useHistory();
  const location = useLocation();
  const [newUrlParams, setNewUrlParams] = useState('')

  //Point address delivery change
  function handleChangeAddressDelivery(value) {
    const params = new URLSearchParams(location.search);
    params.delete('smode');
    if (value === true) {
      setSiteMode(enumerations.SiteMode.DeliverysPoint);params.append('smode', enumerations.SiteMode.DeliverysPoint); params.toString();
    } else { setSiteMode(enumerations.SiteMode.Normal);params.append('smode', enumerations.SiteMode.Normal); params.toString(); }

    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);
    localStorage.removeItem('cartProductQuantity');
    
    window.location.reload(false);
  }

  let isPointAddressDelivery = localStorage.getItem('siteMode');
  if (isPointAddressDelivery === enumerations.SiteMode.DeliverysPoint) { isPointAddressDelivery = true }
  else { isPointAddressDelivery = false }
  const siteMode = getSiteMode();

  return (
    <Switch checked={isPointAddressDelivery} style={{backgroundColor:siteMode !== enumerations.SiteMode.DeliverysPoint ? '#black' : '#2f9bff'}} checkedChildren="Parçalı Satış" unCheckedChildren="Parçalı Satış" onChange={handleChangeAddressDelivery} />
  );
}
export default TopbarAdressDelivery;