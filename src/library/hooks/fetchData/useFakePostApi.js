// hooks.js
import { useState, useEffect } from "react";
//import { orders } from "./dummyData/jsn";

function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [changePageSize, setChangePageSize] = useState(); // Bu ikisi formdan form dan gelicek veye default olacak
  const [currentPage, setCurrentPage] = useState();        // Bu ikisi formdan form dan gelicek veye default olacak
  const [totalDataCount, setTotalDataCount] = useState();
  

  async function fetchUrl() {


    await fetch(url)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {        
        const value = data.data;
        const totalPages = data.totalPages;
        const dataCount = data.totalDataCount;
        //console.log("Data :", data );
        console.log("data :", data );
        console.log("value :", value );

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
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount];
}


export { useFetch };
