// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

var jwtDecode = require('jwt-decode');

function useGetCartCheckOut(addressCode, searchUrl, includeTransportation) {
  const [data, setData] = useState([]);
  const [onChangeFilter, setOnChangeFilter] = useState(false);
  const [lastReqBody, setLastReqBody] = useState();
  const [lastAddressCode, setLastAddressCode] = useState();
  async function fetchUrl() {

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const siteMode = getSiteMode();
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let apiUrl = '';
    if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includePallet=true&checkBalance=true&includeUpdateDetails=true&checkDependentProducts=true&siteMode=${siteMode}&addressCode=${addressCode}&includeTransportation=${includeTransportation}`; }
    else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includePallet=true&checkBalance=true&includeUpdateDetails=true&checkDependentProducts=true&siteMode=${siteMode}&addressCode=${addressCode}&includeTransportation=${includeTransportation}` }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(apiUrl, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setData(data);
        setLastReqBody(searchUrl);
        setLastAddressCode(addressCode);
        setOnChangeFilter(false);
      })
      .catch();
  }
  useEffect(() => {
    if ((!_.isEqual(lastReqBody, searchUrl))||(!_.isEqual(lastReqBody, addressCode))){
      fetchUrl();
    }
    else { setOnChangeFilter(false); }
  }, [onChangeFilter]);
  return [data, setOnChangeFilter];
}
export { useGetCartCheckOut };
