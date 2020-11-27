// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function usePostNotificationFetch(url, reqBody, searchUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);

  const [lastReqBody, setLastReqBody] = useState();

  async function fetchUrl() {
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
        if (data !== undefined) {
          const value = data.data.slice();
          const dataCount = data.totalDataCount;

          setTotalDataCount(dataCount);
          setData(value);
          setLoading(false);
          setOnChange(false);
          setLastReqBody(searchUrl);
        } else {
          setLoading(false);
          setOnChange(false);
        }
      })
      .catch();
  }
  useEffect(() => {
    if (reqBody.notificationTypes === undefined) {
      setLoading(false);
      setOnChange(false);
    }
    else {
    if (!_.isEqual(lastReqBody, searchUrl)) {
      setLoading(true);
      fetchUrl();
    }
    else {
      setLoading(false);
      setOnChange(false);
    }
  }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange];
}

export { usePostNotificationFetch };
