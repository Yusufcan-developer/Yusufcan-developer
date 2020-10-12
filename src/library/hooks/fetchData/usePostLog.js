// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function usePostLogFetch(url, reqBody, searchUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState();
  const [selectedLogSource, setSelectedLogSource] = useState();
  const [code, setCode] = useState();
  const [name, setName] = useState();
  const [searchKey, setSearchKey] = useState();
  const [lastReqBody, setLastReqBody] = useState();
  const [sortingField,setSortingField]=useState();
  const [sortingOrder,setSortingOrder]=useState();
  const [userIds, setUserIds] = useState();
  const [fromDate, setFrom] = useState();
  const [toDate, setTo] = useState();

  async function fetchUrl() {
    const reqB = reqBody == null || reqBody == undefined ? {  "logSources": selectedLogSource,"logTypes": selectedLogType,"userIds": userIds, "from": fromDate, "to": toDate, "keyword": searchKey,"pageIndex": currentPage - 1, "pageCount": changePageSize, "sortingField": sortingField, "sortingOrder": sortingOrder } : reqBody;
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

        const totalPages = data.totalPages;
        const dataCount = data.totalDataCount;

        setTotalDataCount(dataCount);
        setTotalPage(totalPages);
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
    if (!_.isEqual(lastReqBody, searchUrl)) {
      setLoading(true);
      fetchUrl();
    }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, code, name];
}

export { usePostLogFetch };
