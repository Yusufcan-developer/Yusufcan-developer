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
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [serialNumber, setSerialNumber] = useState();
  const [code, setCode] = useState();
  const [name, setName] = useState();
  const [selectedCheckqueType, setSelectedCheckqueType] = useState();
  const [selectedTransactionType, setSelectedTransactionType] = useState();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [searchkey, setSearchKey] = useState();
  const [lastReqBody, setLastReqBody] = useState();

  async function fetchUrl() {

    const reqB = reqBody == null || reqBody == undefined ? { "DealerCodes": dealerCodes, "Regioncodes": regionCodes, "FieldCodes": fieldCodes, "from": from, "to": to, "transactionTypes": selectedTransactionType, "types": selectedCheckqueType, "keyword": searchkey, "serialNumbers": serialNumber, "pageIndex": currentPage - 1, "pageCount": changePageSize } : reqBody;
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

export { useFetch };
