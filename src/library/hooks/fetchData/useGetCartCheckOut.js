  // hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
var jwtDecode = require('jwt-decode');

function useGetCartCheckOut(url) {
  const [data, setData] = useState([]);
  const [onChangeFilter, setOnChangeFilter] = useState(false);

  async function fetchUrl() {

    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };
      const token = jwtDecode(localStorage.getItem("id_token"));
      const activeUser = localStorage.getItem("activeUser")
      let apiUrl='';
      if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includePallet=true&checkBalance=true&includeUpdateDetails=true`;}
      else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includePallet=true&checkBalance=true&includeUpdateDetails=true` }
      if (!token.uname) { return 'Unauthorized' }
    
    await fetch(apiUrl, requestOptions)
    .then(response => {
      const status = apiStatusManagement(response);
      return status;
    })
      .then(data => {   
        setData(data);
        setOnChangeFilter(false);
      })
      .catch();
  }
  useEffect(() => {  
    fetchUrl();
  }, [onChangeFilter]);
    return [data,setOnChangeFilter];
}
export { useGetCartCheckOut };
