// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useGetRestrictedUser(url, reqBody) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [onChange, setOnChange] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState();
  const [lastReqBody, setLastReqBody] = useState();

  async function fetchUrl() {
    
    const reqB = reqBody == null || reqBody == undefined ? { "pageIndex": currentPage - 1, "pageCount": changePageSize } : reqBody;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
    };
    await fetch(url, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          setData(data.data);
          setTotalDataCount(data.totalDataCount);
          setLoading(false);
          setOnChange(false);
        }
      })
      .catch();
  }
  useEffect(() => {
      setLoading(true);
      fetchUrl();
  }, [onChange]);
  return [data, loading, setOnChange, totalDataCount];
}

export { useGetRestrictedUser };
