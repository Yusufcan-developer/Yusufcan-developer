// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';

function useOrderFollowData(url, reqBody) {
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
  
    const reqB = reqBody == null || reqBody==undefined ? {"DealerCodes":dealerCodes,"Regioncodes":regionCodes,"FieldCodes":fieldCodes,"from":from,"to":to,"keyword":searchkey, "pageIndex": currentPage - 1,"pageCount": changePageSize } : reqBody; 
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
   
    await fetch(url, requestOptions) //Order Fetch
      .then(response => {
        if (!response.ok)  {return localStorage.removeItem('id_token');} //Promise.reject(response);//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        if(data){    
        const orderIdArrayH = [];
        const value = data.data.slice();
        value.forEach((item, index) => {          
          item.key = index;
          orderIdArrayH.push(item.orderNo);
        });
        const totalPages = data.totalPages;
        const dataCount = data.totalDataCount;
        console.log("Data :", value );
        console.log("orderIdArrayHooks :", orderIdArrayH );

        setTotalDataCount(dataCount);
        setTotalPage(totalPages);
        setData(value);  
        setOrderIdArray(orderIdArrayH);

        setLoading(false); 
        setOnChange(false);
        _.each(orderIdArrayH,(orderDetailItems,index)=> {
        
          orderIdgetUrlItems+=('orderNo='+orderDetailItems+'&&')
        });
        let orderDetailUrl=siteConfig.api.orderDetail;
        return fetch(`${orderDetailUrl}/?${orderIdgetUrlItems}`, requestOrderDetailOptions) //Order Detail Fetch
        .then(response => {
          if (!response.ok) return Promise.reject(response);
          return response.json();
        })
        .then(data => {
          setOrderDetailData(data);
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
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray,orderDetailData];
}


export { useOrderFollowData };
