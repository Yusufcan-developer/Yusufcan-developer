//React
import React, { useState, useEffect } from "react";

//Redux
import { Popover, Modal } from 'antd';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

//Configs
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import numberFormat from "@iso/config/numberFormat";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import moment from 'moment';
import 'moment/locale/tr';
moment.locale('tr');
var jwtDecode = require('jwt-decode');

export default function TopbarDemands() {
  const [visible, setVisiblity] = React.useState(false);
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const [quantity, setQuantity] = useState();
  const [notification, setNotification] = useState([]);
  const history = useHistory();
  useEffect(() => {
    getActiveDemandList();
  }, []);

  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  };
 
  //Get Notification
  async function getActiveDemandList() {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uid = token.uid;
    let newGetNotificationUrl = siteConfig.api.lookup.getDemandActiveCount;
    await fetch(`${newGetNotificationUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setQuantity(data);
        }
        else { setQuantity(0) }
      })
      .catch();
  }
  
  function selectedNotification() {
    history.push(`${'/reports/demands/?smode=Normal'}`)
  }
 
  return (
    <Popover
      trigger="click"
      visible={false}
      onVisibleChange={handleVisibleChange}
      placement="bottomLeft"
    >
      <div className="isoIconWrapper">
        <i
          className="ion-android-document"
          style={{ color: customizedTheme.textColor }}
          onClick={event => {
                selectedNotification();
              }}
        />
        {<span>{quantity}</span>}
      </div>
    </Popover>

  );
}