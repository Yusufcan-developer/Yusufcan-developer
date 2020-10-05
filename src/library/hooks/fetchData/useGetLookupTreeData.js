// hooks.js
import { useState, useEffect } from "react";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

function useGetLookupTreeData(url) {
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

    await fetch(url, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
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
  return [data, loading, setOnChange];
}

export { useGetLookupTreeData };
