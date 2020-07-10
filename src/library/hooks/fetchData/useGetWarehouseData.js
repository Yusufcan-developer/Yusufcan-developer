// hooks.js
import { useState, useEffect } from "react";

function useGetWarehouseData(url) {
  const [data,setData]=useState([])
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);


  async function fetchUrl() {

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };

    fetch(`${url}`, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        console.log("Get : ", `${url}`);
        console.log("useGetWarehouseData Data :", data);
        console.log('xxxxx v',data.balances)
        setData(data.balances)
      })
      .catch();


    
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [ onChange]);
  return [ data, setOnChange];
}



export { useGetWarehouseData };
