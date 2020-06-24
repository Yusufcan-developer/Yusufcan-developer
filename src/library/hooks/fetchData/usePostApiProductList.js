// hooks.js
import { useState, useEffect } from "react";

function useProductData(url, reqBody) {
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
  const [surface,setSurface]=useState([])
  const [productionStatus,setProductionStatus]=useState([])
  const [keyword,setKeyword]=useState()
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [orderIdArray, setOrderIdArray] = useState();

  async function fetchUrl() {
  
    const reqB = reqBody == null || reqBody==undefined ? {"keyword":keyword,"productionStatus":productionStatus,"surfaces":surface, "colors":color, "dimensions":dimension, "categories":productGroup, "pageIndex": currentPage - 1,"pageCount": changePageSize } : reqBody; 
   
   console.log('xxxx req',reqB)
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },

      body: JSON.stringify(reqBody)
    };
    console.log('xxxx req',requestOptions)
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
        console.log("Data :", value );
        console.log("orderIdArrayHooks :", orderIdArrayH );

        setTotalDataCount(dataCount);
        setTotalPage(totalPages);
        setData(value);  
        setOrderIdArray(orderIdArrayH);

        setLoading(false); 
        setOnChange(false); 

      })
      .catch(console.log('xxxx hata'));

    // const response = await fetch(url);
    // const json = await response.json();
    // setData(json);
    // setLoading(false);
  }

  
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize, onChange]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray];
}


export { useProductData };
