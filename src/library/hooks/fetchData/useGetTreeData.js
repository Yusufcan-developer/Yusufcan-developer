// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useGetTreeData(url, searchUrl) {
  const [data, setData] = useState([]);
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
    await fetch(url, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          setData(data);
        }
      })
      .catch();
  }
  useEffect(() => {
    if (!_.isEqual(lastReqBody, searchUrl)) {
      fetchUrl();
    }
  }, []);

  return [data];
}
export { useGetTreeData };
