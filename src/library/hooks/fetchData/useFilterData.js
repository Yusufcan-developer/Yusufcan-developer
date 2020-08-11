// hooks.js
import { useState, useEffect } from "react";
import _ from 'underscore';

function useFilterData(url) {
  const [data, setData] = useState([]);
  const [loadingFilter, setLoading] = useState(true);
  const [onChangeFilter, setOnChangeFilter] = useState(false);

  async function fetchUrl() {

    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };
   
    await fetch(url,requestOptions)
      .then(response => {
        if (!response.ok)  {return localStorage.removeItem('id_token');}
        return response.json();
      })
      .then(data => {        
        const nullOrBlankData=_.filter(data, function (Item) {
          if (Item === null || Item === '') {
            return true;
          }
        });
        let filterData = _.filter(data, function (Item) {
          if (Item != null || Item != '') {
            return Item;
          }
        });
        if(nullOrBlankData.length>0){filterData.push(null);}
        setData(filterData);
        setOnChangeFilter(false)
        setLoading(false);
      })
      .catch();
  }
  useEffect(() => {
    setLoading(true);   
    fetchUrl();
  }, [onChangeFilter]);


  return [data, loadingFilter , setOnChangeFilter];
}


export { useFilterData };
