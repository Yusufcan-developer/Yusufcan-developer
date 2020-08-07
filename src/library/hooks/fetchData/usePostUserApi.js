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
  const [roleNames, setRoleNames] = useState();
  const [searchkey,setSearchKey]=useState();
  const [isActive,setIsActive]=useState();

  async function fetchUrl() {
  
    const reqB = reqBody == null || reqBody==undefined ? { "keyword": searchkey, "isActive": isActive,"roleNames": roleNames, "pageIndex": currentPage - 1,"pageCount": changePageSize } : reqBody; 
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },

      body: JSON.stringify(reqBody)
    };
    console.log('xxxx reqUser',reqBody);
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
  }
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize,onChange]);
  return [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange];
}


export { useFetch };
