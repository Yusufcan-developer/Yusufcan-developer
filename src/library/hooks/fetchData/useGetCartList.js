// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useCartListData(url, reqBody,searchUrl) {
  const [data, setData] = useState([]);
  const [cartDetail,setCartDetail]=useState();
  const [loading, setLoading] = useState(true);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [onChange, setOnChange] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState();
  const [lastReqBody, setLastReqBody] = useState();

  async function fetchUrl() {  
    
    setLastReqBody(searchUrl);
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
      const status = apiStatusManagement(response);
      return status;
    })
      .then(data => {
        if(data){    

        const accountsNo = [];
        const value = data.data.slice();
        value.forEach((item, index) => {          
          item.key = index;
          accountsNo.push(item.accountNo);
        });
       
        setData(data.data);
        setTotalDataCount(data.totalDataCount);
        setLoading(false); 
        setOnChange(false);
        _.each(accountsNo,(item)=> {        
          let cartDetailUrl=siteConfig.api.carts.getGetByAccountNo;
        
        return fetch(`${cartDetailUrl}${item}`, requestCartDetailOptions) //Cart Detail Fetch
        .then(response => {
          const status = apiStatusManagement(response);
          return status;
        })
        .then(data => {
          setCartDetail(data);
        })
        .catch();
        });
        
        }
      })
      .catch();
  }  
  useEffect(() => {
    if (!_.isEqual(lastReqBody, searchUrl)) {
    setLoading(true);
    fetchUrl(); } else { setOnChange(false); }
  }, [ onChange]);
  return [data, loading , setOnChange,cartDetail,totalDataCount];
}

export { useCartListData };
