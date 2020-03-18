// hooks.js
import { useState, useEffect } from "react";

function useFetch(url, reqBody) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setchangePageSize] = useState(10); // Bu ikisi formdan form dan gelicek veye default olucak
  const [currentPage, setcurrentPage] = useState(1);        //
  const [totalDataCount, setTotalDataCount] = useState();
  

  async function fetchUrl() {
  
    //  var reqB = reqBody == null || reqBody==undefined ? { "pageIndex": currentPage - 1,"pageCount": changePageSize  } : reqBody;  // default variable

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
        const value = data.data;
        const totalPages = data.totalPages;
        const dataCount = data.totalDataCount;
        console.log("Data :", data );

        setTotalDataCount(dataCount);
        setTotalPage(totalPages);
        setData(value);
        setLoading(false); 
      })
      .catch();

    // const response = await fetch(url);
    // const json = await response.json();
    // setData(json);
    // setLoading(false);
  }
  useEffect(() => {
    fetchUrl();
  }, []);
  return [data, loading ,totalPage, totalDataCount];
}


export { useFetch };
