// hooks.js
import { useState, useEffect } from "react";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';

function usePostFilter(url, reqBody) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changePageSize, setChangePageSize] = useState();
  const [currentPage, setCurrentPage] = useState();
  const [onChange, setOnChange] = useState(false);

  async function fetchUrl() {

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
      const status = apiStatusManagement(response);
      return status;
    })
      .then(data => {
        const filterData = _.uniq(data, false, function (item) { if (item === null || item === '') {return item = null } else {return item }});
        setData(filterData);
        setLoading(false); 
        setOnChange(false);
       }) .catch(error => console.log('hata',error));     
  }
  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [currentPage, changePageSize, onChange]);
  return [data, loading , setOnChange];
}
export { usePostFilter };
