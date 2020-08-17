// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';

function useCartListData(url, reqBody) {
  const [data, setData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);//Sipariş Kalem Bilgileri Verisi
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [onChange, setOnChange] = useState(false);
  let orderIdgetUrlItems='';
  async function fetchUrl() {
  
    const reqB = reqBody == null || reqBody==undefined ? {"pageIndex": currentPage - 1,"pageCount": changePageSize } : reqBody; 
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
    };
    const requestCartDetailOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
   
    await fetch(url, requestOptions) //Cart Fetch
      .then(response => {
        if (!response.ok)  {return localStorage.removeItem('id_token');} //Promise.reject(response);//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        if(data){    

    console.log('xxxx url',data)
        // const accountsNo = [];
        // const value = data.data.slice();
        // value.forEach((item, index) => {          
        //   item.key = index;
        //   accountsNo.push(item.accountNo);
        // });

       
        setData(data.data);  
        // setOrderIdArray(accountsNo);

        setLoading(false); 
        setOnChange(false);
        // _.each(accountsNo,(cartDetailItems,index)=> {
        
        //   orderIdgetUrlItems+=('orderNo='+cartDetailItems+'&&')
        // });
        // let orderDetailUrl=siteConfig.api.report.getOrderLineItems;
        // return fetch(`${orderDetailUrl}/?${orderIdgetUrlItems}`, requestCartDetailOptions) //Cart Detail Fetch
        // .then(response => {
        //   if (!response.ok) return Promise.reject(response);
        //   return response.json();
        // })
        // .then(data => {
        //   setOrderDetailData(data);
        // })
        // .catch();
        }
      })
      .catch();
  }  
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [ onChange]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, setOnChange];
}


export { useCartListData };
