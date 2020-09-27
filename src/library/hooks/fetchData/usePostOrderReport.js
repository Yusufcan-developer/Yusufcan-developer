// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';
import moment from 'moment';
function usePostOrderReport(url, reqBody, searchUrl) {
  
  const [data, setData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [searchkey, setSearchKey] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [lastReqBody, setLastReqBody] = useState();
  let orderIdgetUrlItems = '';
  async function fetchUrl() {

    setLastReqBody(searchUrl);
    const reqB = reqBody == null || reqBody == undefined ? { "DealerCodes": dealerCodes, "Regioncodes": regionCodes, "FieldCodes": fieldCodes, "from": from, "to": to, "keyword": searchkey, "pageIndex": currentPage - 1, "pageCount": changePageSize } : reqBody;
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
          const totalPages = data.totalPages;
          const dataCount = data.totalDataCount;

          setTotalDataCount(dataCount);
          setTotalPage(totalPages);
          setData(value);

          setLoading(false);
          setOnChange(false);
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
      .catch();
  }
  useEffect(() => {
    if (!_.isEqual(lastReqBody, searchUrl)) {
      setLoading(true);
      fetchUrl();
    }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderDetailData];
}
export { usePostOrderReport };
