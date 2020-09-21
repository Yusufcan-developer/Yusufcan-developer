  // hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');

function useGetCartCheckOut(url) {
  const [data, setData] = useState([]);
  const [loadingFilter, setLoading] = useState(true);
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
      let uname = token.uname;
      if (activeUser != undefined) { uname = activeUser }
      if (!token.uname) { return 'Unauthorized' }
    
    await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}?includePallet=true`, requestOptions)
      .then(response => {
        if (!response.ok)  {}
        return response.json();
      })
      .then(data => {        
        setData(data);
        setOnChangeFilter(false);
      })
      .catch();
  }
  useEffect(() => {
    setLoading(true);   
    fetchUrl();
  }, [onChangeFilter]);
    return [data,setOnChangeFilter];
}
export { useGetCartCheckOut };
