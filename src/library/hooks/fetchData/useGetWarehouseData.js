// hooks.js
import { useState, useEffect } from "react";

function useGetWarehouseData(url) {
  const [data, setData] = useState([])
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
        if (!response.ok) {
          console.log('error log ', response.statusText);
          return null;
        }
        // throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        setData((data && data.balances) || [])
      })
      .catch();
      setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [onChange]);
  return [data, setOnChange];
}



export { useGetWarehouseData };
