import React from 'react';
import { Alert } from 'antd';
import { useSelector } from 'react-redux';
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
// import { postEndEditingBehalfOf } from "@iso/lib/hooks/fetchData/postEndEditingBehalfOf";
import enumerations from "../../config/enumerations";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');

export default function TopbarAlert(props) {
  const [visible, setVisiblity] = React.useState(false);
  const { showAlert, username } = props;
  const message = username + ' hesabına ait sepette işlem yapmaktasınız';
  const token = jwtDecode(localStorage.getItem("id_token"));
  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  }
  async function onClose() {
    const activeUser = localStorage.getItem("activeUser");
    await postEndEditingBehalfOf(activeUser);
    localStorage.removeItem('activeUser');
    localStorage.removeItem('cartProductQuantity');
    window.location.reload(true);
  };
  async function postEndEditingBehalfOf(accountNo) {
    try {
      const reqBody = {};
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        },
        body: JSON.stringify(reqBody)
      };
      let newEndBehalfOfUrl = siteConfig.api.carts.postEndEditingBehalfOf.replace('{accountNo}', accountNo);
      await fetch(`${newEndBehalfOfUrl}`, requestOptions)
        .then(response => {
          const status = apiStatusManagement(response);
          return status;
        })
        .then(data => {
          postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Browse, 'Aktif bayi kapatıldı.');
        })
        .catch();
    }
    catch (err) {
      console.log(err);
    }
  };
  return (
    <React.Fragment>
      {(showAlert) ? (
        <Alert message={message} type="info" showIcon closable banner
          onClose={onClose} />
      ) : ('')}
    </React.Fragment>
  );
};

