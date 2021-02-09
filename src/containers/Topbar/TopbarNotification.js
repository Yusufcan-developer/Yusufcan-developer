//React
import React, { useState, useEffect } from "react";

//Redux
import { Popover, Modal } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
import { usePostAccountBalancesReport } from "../../library/hooks/fetchData/usePostAccountBalances";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import enumerations from "@iso/config/enumerations";

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
  function confirm(quantity) {
    Modal.warning({
      title: "Kalan Hesap Kesim Bakiyesi",
      icon: <ExclamationCircleOutlined />,
      width:580,
      content:
        <React.Fragment>
          {"Kıymetli bayimiz, geçtiğimiz ay hesap kesim döneminden kalan bakiyeniz "}<strong>{numberFormat(quantity)}</strong> {" TL olup ayın 10'undan itibaren bu bakiyenin kapatılmaması halinde sevkiyatınızı "} <strong> durdurmak </strong>  {" zorunda kalacağımızı üzülerek bildiririz."}
        </React.Fragment>,
      okText: 'Kapat'
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

  async function getBalanceData(url, reqBody) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(url, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          const itemData = data.data[0];
          debugger
          if (867140.24 >= 3000) {
            postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, 'Hesap kesim bakiyesi bilgisi gösterildi');
            return confirm(itemData.monthlyAccountCutOffBalance);
          }
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
    const message = 'Kıymetli bayimiz, geçtiğimiz ay hesap kesim döneminden kalan bakiyeniz … TL olup ayın 10'+'undan itibaren bu bakiyenin kapatılmaması halinde sevkiyatınızı durdurmak zorunda kalacağımızı üzülerek bildiririz';
    const getBalance = localStorage.setItem('lastBalanceCheckDate', moment(moment().format('YYYY MM DD, hh:mm:ss a')));
    const token = jwtDecode(localStorage.getItem("id_token"));
    getBalanceData(`${siteConfig.api.report.postAccountBalances}`, { "dealerCodes": [token.dcode] });
  }  

  const day = moment().day();
  var date = moment(new Date(), "MM-DD-YYYY");
  if (date.date() === 9 || date.date() === 10) {
    const lastBalanceCheckDate = localStorage.getItem('lastBalanceCheckDate');
    if (!lastBalanceCheckDate) { getCutBalance(); } else {
      const now = moment(moment().format('YYYY MM DD, hh:mm:ss a'));
      const hours = now.diff(lastBalanceCheckDate, 'hours');
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