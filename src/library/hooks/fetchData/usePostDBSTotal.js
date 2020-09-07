// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';

function usePostDBSTotalReport(url, reqBody) {
  const [data, setData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);//Sipariş Kalem Bilgileri Verisi
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [searchkey,setSearchKey]=useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [orderIdArray, setOrderIdArray] = useState();
  let orderIdgetUrlItems='';
  async function fetchUrl() {
  
    const reqB = reqBody == null || reqBody==undefined ? {"pageIndex": currentPage - 1,"pageCount": changePageSize} : reqBody; 
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
        if (!response.ok)  {return response.statusText;} //Promise.reject(response);//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
          if (data) {
              const totalPages = data.totalPages;
              const dataCount = data.totalDataCount;
              setData(data.data);
              setTotalDataCount(dataCount);
              setTotalPage(totalPages);
              setLoading(false);
              setOnChange(false);      
    }
      })
      .catch();
  }  
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize, onChange]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray,orderDetailData];
}


export { usePostDBSTotalReport };
