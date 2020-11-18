// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useFetch(url, reqBody, searchUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [code, setCode] = useState();
  const [name, setName] = useState();
  const [lastReqBody, setLastReqBody] = useState();
  const [aggregates, setAggregatesOverall] = useState();

  async function fetchUrl() {

    setLastReqBody(searchUrl);
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
        if (data.data !== undefined) {
          const value = data.data.slice();
          value.forEach((item, index) => {
            item.key = index;
            setCode(item.dealerCode);
            setName(item.dealerName)
          });
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;
          const aggregatesOverall = data.aggregatesOverall;

          setTotalDataCount(dataCount);
          setTotalPage(totalPages);
          setData(value);
          setLoading(false);
          setOnChange(false);
          setAggregatesOverall(aggregatesOverall);
        } else {
          setLoading(false);
          setOnChange(false);
        }
      })
      .catch();
  }
  useEffect(() => {
    if ((reqBody.DealerCodes === undefined) & (reqBody.regionCodes === undefined) & (reqBody.fieldCodes === undefined)) {
      setLoading(false);
      setOnChange(false);
    }
    else {
      if (!_.isEqual(lastReqBody, searchUrl)) {
        setLoading(true);
        fetchUrl();
      }else { setOnChange(false); }
    }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregates, code, name];
}

export { useFetch };
