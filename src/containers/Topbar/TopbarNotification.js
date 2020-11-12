//React
import React, { useState, useEffect } from "react";
import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';

//Redux
import { Popover } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
//Configs
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import getInitData from '../../redux/ecommerce/config';
import enumerations from "@iso/config/enumerations";
var jwtDecode = require('jwt-decode');

const demoNotifications = [
  {
    id: 1,
    name: 'Uğur Çamoğlu',
    notification:
      'Bilgilendirme amaçlı yapılmıştır.Notification sistemi kontrol ediliyor',
  },
  {
    id: 2,
    name: 'Utku Öztürk',
    notification:
      'Bilgilendirme amaçlı yapılmıştır.Notification sistemi kontrol ediliyor',
  },
]
export default function TopbarNotification() {
  const [visible, setVisiblity] = React.useState(false);
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const [quantity, setQuantity]=useState();

  getNotificationList();

  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  }
  ;
  //Get Notification
  async function getNotificationList() {
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (activeUser !== null) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }
  
    await fetch(`${siteConfig.api.carts.getNotificationByUserId}${uname}?isRead=${false}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setQuantity(data.length);
        }
        else { setQuantity(0) }
      })
      .catch();
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
        {demoNotifications.map(notification => (
          <a className="isoDropdownListItem" key={notification.id} href="# ">
            <h5>{notification.name}</h5>
            <p>{notification.notification}</p>
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
