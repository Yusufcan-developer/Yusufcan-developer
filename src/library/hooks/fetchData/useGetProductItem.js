// hooks.js
import { useState, useEffect } from "react";

function useGetProductItem(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [productId, setProductId] = useState();
  

  async function fetchUrl() {

    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        }
      };

    const dataTable = [];
    
    console.log("productId Id :", productId);
    
  
      
      fetch(`${url}${productId}`, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {              
        console.log("Get : ", `${url}${productId}`); 
        console.log("useGetProductItem Data :", data );
        dataTable.push(data);       
      })
      .catch();

    
    setData(dataTable);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    if(productId != null || productId != undefined  )
      fetchUrl();
  }, productId);


  return [data, loading , setOnChange, setProductId];
}


export { useGetProductItem };
