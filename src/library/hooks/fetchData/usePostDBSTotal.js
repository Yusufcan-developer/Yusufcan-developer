// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function usePostDBSTotalReport(url, reqBody, searchUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [aggregates, setAggregatesOverall] = useState();
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
        if (data) {
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;
          const aggregatesOverall = data.aggregatesOverall;

          setData(data.data);
          setTotalDataCount(dataCount);
          setTotalPage(totalPages);
          setLoading(false);
          setOnChange(false);
          setAggregatesOverall(aggregatesOverall);
        }       
      })
      .catch();
}
  useEffect(() => {
    if (!_.isEqual(lastReqBody, searchUrl)) {
    setLoading(true);
    fetchUrl(); } else { setOnChange(false); }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregates];
}

export { usePostDBSTotalReport };
