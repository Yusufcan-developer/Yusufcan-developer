// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function usePostDBSTotalReport(url, reqBody) {
  const [data, setData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [dealerCodes, setDealerCodes] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [orderIdArray, setOrderIdArray] = useState();
  const [aggregates, setAggregatesOverall] = useState();

  async function fetchUrl() {
    const reqB = reqBody == null || reqBody == undefined ? { "dealerCodes": dealerCodes, "pageIndex": currentPage - 1, "pageCount": changePageSize } : reqBody;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };

    await fetch(url, requestOptions) //Order Fetch
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;
          const aggregatesOverall=data.aggregatesOverall;
          
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
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregates];
}

export { usePostDBSTotalReport };
