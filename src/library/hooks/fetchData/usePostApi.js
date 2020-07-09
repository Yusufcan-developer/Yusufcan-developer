// hooks.js
import { useState, useEffect } from "react";

function useFetch(url, reqBody) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [totalDataCount, setTotalDataCount] = useState();
  const [onChange, setOnChange] = useState(false);
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [serialNumber, setSerialNumber] = useState();
  const [selectedCheckqueType, setSelectedCheckqueType]=useState();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [searchkey,setSearchKey]=useState();
  
  async function fetchUrl() {
  
    const reqB = reqBody == null || reqBody==undefined ? {"DealerCodes":dealerCodes,"Regioncodes":regionCodes,"FieldCodes":fieldCodes,"from":from,"to":to,"types":selectedCheckqueType,"keyword":searchkey,"serialNumbers":serialNumber, "pageIndex": currentPage - 1,"pageCount": changePageSize } : reqBody; 
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },

      body: JSON.stringify(reqBody)
    };
    console.log('xxxxx reqB',reqB)
    await fetch(url, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {        
        const value = data.data.slice();
        value.forEach((item, index) => {          
          item.key = index;
        });
        const totalPages = data.totalPages;
        const dataCount = data.totalDataCount;
        console.log("Data :", data );

        setTotalDataCount(dataCount);
        setTotalPage(totalPages);
        setData(value);
        setLoading(false); 
        setOnChange(false); 
      })
      .catch();

    // const response = await fetch(url);
    // const json = await response.json();
    // setData(json);
    // setLoading(false);
  }
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize,onChange]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange];
}


export { useFetch };
