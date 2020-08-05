// hooks.js
import { useState, useEffect } from "react";

function useGetTreeData(url) {
  const [data, setData] = useState([]);
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
    
    await fetch(url,requestOptions)
      .then(response => {
        if (!response.ok) {return localStorage.removeItem('id_token');}
        return response.json();
      })
      .then(data => {        
        if(data){
        setData(data);
        setLoading(false);
      }})
      .catch();
  }
  useEffect(() => {
    setLoading(true);   
    fetchUrl();
  }, []);


  return [data, loading , setOnChange];
}


export { useGetTreeData };
