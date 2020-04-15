// hooks.js
import { useState, useEffect } from "react";

function useGetOrderItems(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [orderId, setOrderId] = useState();

  async function fetchUrl() {

    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };
    
    await fetch(url+orderId,requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {        
        
        console.log("useGetApi Data :", data );

        setData(data);
        setLoading(false);
      })
      .catch();
  }
  useEffect(() => {
    setLoading(true);
    if(orderId != null || orderId != undefined)
      fetchUrl();
  }, [orderId]);


  return [data, loading , setOnChange, setOrderId];
}


export { useGetOrderItems };
