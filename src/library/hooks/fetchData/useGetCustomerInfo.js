// hooks.js
import { useState, useEffect } from "react";

function useGetCustomerInfo(url) {
  let [getUserName, setUserName] = useState('');
  const [getLastName, setLastName] = useState();
  const [getCompanyName, setCompanyName] = useState();
  const [getEmail, setEmail] = useState();
  const [getPhone, setPhone] = useState();
  const [getCountry, setCountry] = useState();
  const [getCity, setCity] = useState();
  const [getAdress, setAdress] = useState();

  async function fetchUrl() {

    setUserName('ugur');
    setLastName('camoglu');
    setCompanyName('Karya SMD');
    setEmail('ugur.camoglu@karyasmd.com');
    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
    //   }
    // };

    // fetch(`${url}`, requestOptions)
    //   .then(response => {
    //     if (!response.ok) throw Error(response.statusText);
    //     return response.json();
    //   })
    //   .then(data => {
    //     console.log("Get : ", `${url}`);
    //     console.log("useGetProductItem Data :", data);
    //     setDescription(data.description)
    //     setItemCode(data.itemCode)
    //     setSeries(data.series)
    //     setProductionStatus(data.productionStatus)
    //     setSurface(data.surface);
    //     setColor(data.color);
    //     setDimension(data.dimension);
    //     setProductItem(data);
    //     setType(data.type);
    //     setRectifying(data.rectifying);
    //     setListPrice(data.listPrice);
    //     setImageUrl(data.imageUrl);
    //     setUnit(data.unit);
    //     setCanBeSoldPartially(data.canBeSoldPartially);
    //   })
    //   .catch();



    // setLoading(false);
  }

  useEffect(() => {
    fetchUrl();
  }, []);
  return [getUserName, getLastName, getCompanyName, getEmail, getPhone, getCountry, getCity, getAdress];
}



export { useGetCustomerInfo };
