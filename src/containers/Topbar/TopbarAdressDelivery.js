//React
import React, { useState } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Redux
import { Switch } from 'antd';

//Configs
import { setIsPointAddressDelivery } from '@iso/lib/helpers/setIsPointAddressDelivery';
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
    setIsPointAddressDelivery(value);

    params.delete('isPointAddress');
    params.append('isPointAddress', value); params.toString();

    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

    window.location.reload(false);
  }

  let isPointAddressDelivery = localStorage.getItem('isPointAddressDelivery');
  if (isPointAddressDelivery === 'true') { isPointAddressDelivery = true }
  else { isPointAddressDelivery = false }

  return (
    <Switch checked={isPointAddressDelivery} checkedChildren="Adrese teslim" unCheckedChildren="Adrese teslim" onChange={handleChangeAddressDelivery} />
  );
}
export default TopbarAdressDelivery;