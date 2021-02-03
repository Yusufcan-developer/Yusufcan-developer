//React
import React, { useState, useEffect } from "react";

//Redux
import { Popover, Modal } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

//Configs
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import * as SecureLS from 'secure-ls';
import moment from 'moment';
import 'moment/locale/tr';
moment.locale('tr');
var jwtDecode = require('jwt-decode');
var ls = new SecureLS({encodingType: 'aes',isCompression: false});

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
  };
  function confirm() {
    Modal.info({
      title: "Cache Yenileme",
      icon: <ExclamationCircleOutlined />,
      content: "Cache yenileme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz",
    });
  }
  //Get Notification
  async function getNotificationList() {
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
    let newGetNotificationUrl = siteConfig.api.security.getNotificationByUserId.replace('{userId}', uid);
    await fetch(`${newGetNotificationUrl}/?isRead=${false}&pageIndex=0&pageCount=10`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setQuantity(data.totalDataCount);
          setNotification(data.data);
        }
        else { setQuantity(0) }
      })
      .catch();
  }
  async function postNotificationIsred(notificationId) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    let newPostIsReadUrl = siteConfig.api.security.postIsRead.replace('{notificationId}', notificationId);
    await fetch(`${newPostIsReadUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
        }
      })
      .catch();
  }
  function selectedNotification(item) {
    postNotificationIsred(item.id);
    setVisiblity(visible => !visible);
    Modal.info({
      okText: 'Tamam',
      width: 500,
      title: item.notificationTypeName,
      content: (
        <div>
          <br />
          <p>{(moment(item.createdOn).format(siteConfig.dateFormatAddTime))}</p>
          <br />
          <p>{item.description}</p>
        </div>
      ),
      onOk() { window.location.reload(true);},
    });
  }

  async function getCutBalance() {
    const message='Test ediliyor';
    const getBalance = localStorage.setItem('cutBalanceDate',moment(moment().format('YYYY MM DD, hh:mm:ss a')));
    return confirm()
    
  }  

  const day = moment().day();
  if (day === 39 || day === 40) {
    const getBalance = localStorage.getItem('cutBalanceDate');
    if (!getBalance) { getCutBalance(); } else {
      const now = moment(moment().format('YYYY MM DD, hh:mm:ss a'));
      const hours = now.diff(getBalance, 'hours');
      if (hours >= 2) {
        getCutBalance();
      }
    }
  };
  const content = (
    <TopbarDropdownWrapper className="topbarNotification">
      <div className="isoDropdownHeader">
        <h3>
          <IntlMessages id="sidebar.notification" />
        </h3>
      </div>
      <Scrollbar style={{ height: 300 }}>
        <div className="isoDropdownBody">

          {_.map(notification, (item) => {
            return (
              <a className="isoDropdownListItem" key={item.notificationTypeName} onClick={event => {
                selectedNotification(item);
              }}>
                <h5>{(moment(item.createdOn).format(siteConfig.dateFormatAddTime))}</h5>
                <p>{item.description}</p>
              </a>
            )
          })}
        </div>
      </Scrollbar>
      <a className="isoViewAllBtn" href="/admin/notification?isRead=false">
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