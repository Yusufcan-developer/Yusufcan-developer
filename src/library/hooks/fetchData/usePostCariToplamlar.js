// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';

function usePostCariToplamlarReport(url, reqBody) {
  const [data, setData] = useState([]);
  const [aggregateData, setAggregateData] = useState([]);//Sipariş Kalem Bilgileri Verisi
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [searchkey, setSearchKey] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [orderIdArray, setOrderIdArray] = useState();
  let aggregateGetUrlItems = '';
  async function fetchUrl() {

    const reqB = reqBody == null || reqBody == undefined ? {"dealerCodes": dealerCodes, "pageIndex": currentPage - 1, "pageCount": changePageSize } : reqBody;
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
        if (!response.ok) { return response.statusText; } //Promise.reject(response);//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        if (data) {
          const dealerCodeArray = [];
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;
          const value = data.data.slice();
          value.forEach((item, index) => {
            item.key = index;
            dealerCodeArray.push(item.dealerCode);
          });
          setData(data.data);
          setTotalDataCount(dataCount);
          setTotalPage(totalPages);
          setLoading(false);
          setOnChange(false);

          const reqAggregateBody = { "DealerCodes": dealerCodeArray };
          const requestAggregateOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqAggregateBody)
          };
          let aggregateUrl = siteConfig.api.report.postAggregate;
          return fetch(`${aggregateUrl}`, requestAggregateOptions) //Order Detail Fetch
            .then(response => {
              if (!response.ok) return Promise.reject(response);
              return response.json();
            })
            .then(data => {
              setAggregateData(data.data);
            })
            .catch();
        }
      })
      .catch();
  }
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregateData];
}
export { usePostCariToplamlarReport };
