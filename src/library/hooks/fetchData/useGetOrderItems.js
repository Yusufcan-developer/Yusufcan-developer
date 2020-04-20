// hooks.js
import { useState, useEffect } from "react";

function useGetOrderItems(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [orderId, setOrderId] = useState([]);
  

  async function fetchUrl() {

    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };

    const dataTable = [];
    
    console.log("Order Id :", orderId);
    
    orderId.forEach((item, index) => {
      
      fetch(`${url}${item}`, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {              
        console.log("Get : ", `${url}${item}`); 
        console.log("useGetOrderItems Data :", data );
        dataTable.push(data);       
      })
      .catch();
    });

    
    setData(dataTable);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    if(orderId != null || orderId != undefined || orderId.length == 0 )
      fetchUrl();
  }, [orderId]);


  return [data, loading , setOnChange, setOrderId];
}


export { useGetOrderItems };
