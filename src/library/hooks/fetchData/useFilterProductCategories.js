// hooks.js
import { useState, useEffect } from "react";

function useFilterProductCategories(url, reqBody) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);

  async function fetchUrl() {

    const reqB = reqBody == null || reqBody==undefined ? { } : reqBody; 
   
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    
    await fetch(url,requestOptions)
      .then(response => {
        if (!response.ok) {return localStorage.removeItem('id_token');}
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch();
  }
  useEffect(() => {
    setLoading(true);   
    fetchUrl();
  }, []);


  return [data, loading , setOnChange];
}


export { useFilterProductCategories };
