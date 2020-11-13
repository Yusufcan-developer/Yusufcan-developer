//React
import React, { useState, useEffect } from "react";

//Redux
import { Popover } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
//Configs
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import Item from "antd/lib/list/Item";
var jwtDecode = require('jwt-decode');

export default function TopbarNotification() {
  const [visible, setVisiblity] = React.useState(false);
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const [quantity, setQuantity] = useState();
  const [notification, setNotification] = useState([]);
  
  useEffect(() => {
    getNotificationList();
  }, []);

  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  }
  ;
  //Get Notification
  async function getNotificationList() {
    let productInfo;
    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
    //   }
    // };
    // const token = jwtDecode(localStorage.getItem("id_token"));
    // const activeUser = localStorage.getItem("activeUser")
    // let uid = token.uid;

    // await fetch(`${siteConfig.api.security.getNotificationByUserId}${uid}/?isRead=${false}`, requestOptions)
    //   .then(response => {
    //     const status = apiStatusManagement(response, true);
    //     return status;
    //   })
    //   .then(data => {
    //     if (data !== 'Unauthorized1') {
    //       setQuantity(data.length);
    //       setNotification(data);
    //     }
    //     else { setQuantity(0) }
    //   })
    //   .catch();
    return productInfo;
  }
  
  const content = (
    <TopbarDropdownWrapper className="topbarNotification">
      <div className="isoDropdownHeader">
        <h3>
          <IntlMessages id="sidebar.notification" />
        </h3>
      </div>
      <div className="isoDropdownBody">
        {notification.map(item => (
          <a className="isoDropdownListItem" key={item.notificationTypeName} href="# ">
            <h5>{item.notificationTypeName}</h5>
            <p>{item.description}</p>
          </a>
        ))}
      </div>
      <a className="isoViewAllBtn" href="# ">
        <IntlMessages id="topbar.viewAll" />
      </a>
    </TopbarDropdownWrapper>
  );
  return (
    <Popover
      content={content}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomLeft"
    >
      <div className="isoIconWrapper">
        <i
          className="ion-android-notifications"
          style={{ color: customizedTheme.textColor }}
        />
        <span>{quantity}</span>
      </div>
    </Popover>
  );
}
