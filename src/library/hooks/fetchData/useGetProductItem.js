// hooks.js
import { useState, useEffect } from "react";

function useGetProductItem(url) {
  const [productItem, setProductItem] = useState()
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [description, setDescription] = useState();
  const [itemCode, setItemCode] = useState();
  const [series, setSeries] = useState();
  const [productionStatus, setProductionStatus] = useState();
  const [surface, setSurface] = useState();
  const [color, setColor] = useState();
  const [dimension, setDimension] = useState();
  const [type, setType] = useState();
  const [rectifying, setRectifying] = useState();
  const [listPrice, setListPrice] = useState();
  const [unit, setUnit] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [canBeSoldPartially, setCanBeSoldPartially] = useState();
  const [notes, setNotes] = useState();
  const [campaign,setCampaign]=useState();
  const [imageThumbBaseUrl,setImageThumbBaseUrl]=useState();
  const [imageMediumBaseUrl,setImageMediumBaseUrl]=useState();
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
        setDescription(data.description)
        setItemCode(data.itemCode)
        setSeries(data.series)
        setProductionStatus(data.productionStatus)
        setSurface(data.surface);
        setColor(data.color);
        setDimension(data.dimension);
        setProductItem(data);
        setType(data.type);
        setRectifying(data.rectifying);
        setListPrice(data.listPrice);
        setImageUrl(data.imageLargeBaseUrl + data.imageMainFileName);
        setUnit(data.unit);
        setCanBeSoldPartially(data.canBeSoldPartially);
        setNotes(data.notes);
        setCampaign(data.imageCampaignFileNames);
        setImageThumbBaseUrl(data.imageThumbBaseUrl);
        setImageMediumBaseUrl(data.imageMediumBaseUrl);
      })
      .catch();

    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [onChange]);
  return [loading, description, itemCode, series, productionStatus, surface, color, dimension, productItem, type, rectifying, listPrice, imageUrl, unit, canBeSoldPartially, notes, campaign,imageThumbBaseUrl,imageMediumBaseUrl, setOnChange];
}



export { useGetProductItem };
