// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function usePostAccountBalancesReport(url, reqBody,searchUrl) {
  const [data, setData] = useState([]);
  const [aggregateData, setAggregateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [dealerCodes, setDealerCodes] = useState();
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
          const dealerCodeArray = [];
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;
          const aggregatesOverall = data.aggregatesOverall;
          const value = data.data.slice();
          value.forEach((item, index) => {
            item.key = index;
            dealerCodeArray.push(item.dealerCode);
          });
          setData(data.data);
          setTotalDataCount(dataCount);
          setTotalPage(totalPages);
          setAggregatesOverall(aggregatesOverall);
          setLoading(false);
          setOnChange(false);
          const reqAggregateBody = { "DealerCodes": dealerCodeArray,  "pageCount":1000000000 };
          const requestAggregateOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqAggregateBody)
          };
          if(dealerCodeArray.length>0){
          let aggregateUrl = siteConfig.api.report.postAggregate;
          return fetch(`${aggregateUrl}`, requestAggregateOptions)
            .then(response => {
              if (!response.ok) return Promise.reject(response);
              return response.json();
            })
            .then(data => {
              setAggregateData(data.data);
            })
            .catch();
        }
      }
      })
      .catch();
  }
  useEffect(() => {
    if (!_.isEqual(lastReqBody, searchUrl)) {
    setLoading(true);
    fetchUrl();
  } else { setOnChange(false); }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregates,aggregateData];
}
export { usePostAccountBalancesReport };
