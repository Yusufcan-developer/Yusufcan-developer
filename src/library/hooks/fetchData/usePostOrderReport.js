// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';

function usePostOrderReport(url, reqBody, searchUrl) {

  const [data, setData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [lastReqBody, setLastReqBody] = useState();
  const [aggregates, setAggregatesOverall] = useState();
  let orderIdgetUrlItems = '';
  async function fetchUrl() {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    const requestOrderDetailOptions = {
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

        if (data.data !== undefined) {
          const orderIdArrayH = [];
          const value = data.data.slice();
          value.forEach((item, index) => {
            item.key = index;
            orderIdArrayH.push(item.orderNo);
          });
          const dataCount = data.totalDataCount;
          const aggregatesOverall = data.aggregatesOverall;

          setTotalDataCount(dataCount);
          setData(value);
          setAggregatesOverall(aggregatesOverall);

          setLoading(false);
          setOnChange(false);
          setLastReqBody(searchUrl);
          _.each(orderIdArrayH, (orderDetailItems, index) => {
            orderIdgetUrlItems += ('orderNo=' + orderDetailItems + '&&')
          });

          let orderDetailUrl = siteConfig.api.report.getOrderLineItems;
          return fetch(`${orderDetailUrl}/?${orderIdgetUrlItems}`, requestOrderDetailOptions) //Order Detail Fetch
            .then(response => {
              const status = apiStatusManagement(response);
              return status;
            })
            .then(data => {
              setOrderDetailData(data);
            })
            .catch();
        }
        else {
          setLoading(false);
          setOnChange(false);
        }
      })
      .catch(setOnChange(false));
  }
  useEffect(() => {
    if ((reqBody.DealerCodes === undefined) && (reqBody.regionCodes === undefined) && (reqBody.fieldCodes === undefined)) {
      setLoading(false);
      setOnChange(false);
    }
    else {
      if (!_.isEqual(lastReqBody, searchUrl)) {
        setLoading(true);
        fetchUrl();
      } else { setOnChange(false); }
    }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderDetailData, aggregates];
}
export { usePostOrderReport };
