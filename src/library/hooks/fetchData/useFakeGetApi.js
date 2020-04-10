// hooks.js
import { useState, useEffect } from "react";

function useGetApi(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [orderId, setOrderId] = useState();

  async function fetchUrl() {
    
    await fetch(url)
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
    fetchUrl();
  }, [orderId]);
  return [data, loading , setOnChange, orderId, setOrderId];
}


export { useGetApi };
