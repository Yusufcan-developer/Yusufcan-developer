//React
import React, { useState, useEffect } from "react";

//Redux
import { Popover, Modal } from 'antd';
import { useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
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
    getActiveDemandList({"onlyActive": true,  "pageIndex": 0,"pageCount": 3});
  }, []);

  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  };
 
  //Get Notification
  async function getActiveDemandList(reqBody) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uid = token.uid;
    let newGetNotificationUrl = siteConfig.api.report.postDemandItems;
    await fetch(`${newGetNotificationUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setNotification(data.data);
          setQuantity(data.totalDataCount);
        }
        else { setQuantity(0) }
      })
      .catch();
  }

  function selectedNotification(demandNo) {
    // if (typeof demandNo !== 'undefined') {
    //   history.push(`${'/reports/demands/?smode=Normal&keyword=' + demandNo + ''}`);
    //   window.location.reload(false);
    // }
  }
  const content = (
    <TopbarDropdownWrapper className="topbarNotification">
      <div className="isoDropdownHeader">
        <h3>
          <IntlMessages id="sidebar.activeDemands" />
        </h3>
      </div>
      <Scrollbar style={{ height: 300 }}>
        <div className="isoDropdownBody">

          {_.map(notification, (item) => {
            return (
              <a className="isoDropdownListItem" key={item.notificationTypeName} >
                <h5>{(moment(item.date).format(siteConfig.dateFormatAddTime))}</h5>
                <p>{item.demandNo + ' '+ item.itemDescription}</p>
              </a>
            )
          })}
        </div>
      </Scrollbar>
      <a className="isoViewAllBtn" href="/reports/demands/?onlyActive=true">
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
          className="ion-android-document"
          style={{ color: customizedTheme.textColor }}
          // onClick={event => {
          //       selectedNotification();
          //     }}
        />
        {<span>{quantity}</span>}
      </div>
    </Popover>

  );
}