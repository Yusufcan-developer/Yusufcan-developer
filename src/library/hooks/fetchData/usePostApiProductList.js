// hooks.js
import { useState, useEffect } from "react";
//Other Library
import _ from 'underscore';

function useProductData(url, reqBody,categorie,searchUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [productGroup,setProductGroup]=useState();
  const [dimension,setDimension]=useState([])
  const [color,setColor]=useState([])
  const [productStatus,setProductStatus]=useState([])
  const [surface,setSurface]=useState([])
  const [productionQuality, setProductionQuality] = useState([])
  const [salesStatus, setSalesStatus] = useState()
  const [keyword,setKeyword]=useState()
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [orderIdArray, setOrderIdArray] = useState();
  const [sortingField, setSortingField]=useState();
  const [sortingOrder, setSortingOrder]=useState();
  const [lastReqBody,setLastReqBody]=useState();

  async function fetchUrl() {
  
    setLastReqBody(searchUrl);
    const reqB = reqBody == null || reqBody==undefined ? {"keyword":keyword,"salesStatus": salesStatus, "surfaces":surface, "colors":color, "dimensions":dimension, "productStatus":productStatus, "categories":productGroup, "pageIndex": currentPage - 1,"pageCount": changePageSize, "sortingField": sortingField,"sortingOrder": sortingOrder } : reqBody; 
   
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
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {        
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
        // setOrderIdArray(orderIdArrayH);

        setLoading(false); 
        setOnChange(false);

       }) .catch(error => console.log('hata',error));
  }

  
  useEffect(() => {
    if (categorie !== undefined) {
      if (!_.isEqual(lastReqBody, searchUrl)) {
        setLoading(true);
        fetchUrl();
      }
    }
  }, [currentPage, changePageSize, onChange]);
  return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray];
}


export { useProductData };
