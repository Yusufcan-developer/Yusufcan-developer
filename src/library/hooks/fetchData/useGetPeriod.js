// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useGetPeriod(url,searchUrl) {
  const [data, setData] = useState([]);
  const [loadingFilter, setLoading] = useState(true);
  const [onChangeFilter, setOnChangeFilter] = useState(false);
  const [lastReqBody, setLastReqBody] = useState();

  async function fetchUrl() {
    setLastReqBody(searchUrl);
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };
   
    await fetch(url,requestOptions)
    .then(response => {
      const status = apiStatusManagement(response);
      return status;
    })
      .then(data => {
        setData(data);
        setOnChangeFilter(false)
        setLoading(false);
      })
      .catch();
  }
  useEffect(() => {
    if ((!_.isEqual(lastReqBody, searchUrl))&&(url!=='undefined')) {
      setLoading(true);
      fetchUrl();
    }
  }, [onChangeFilter]);

  return [data, loadingFilter , setOnChangeFilter];
}

export { useGetPeriod };
