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
  const [imageGeneralFileNames,setImageGeneralFileNames]=useState();
  const [imageThumbBaseUrl,setImageThumbBaseUrl]=useState();
  const [imageMediumBaseUrl,setImageMediumBaseUrl]=useState();
  const [imageTechnicalFileNames,setImageTechnicalFileNames]=useState();
  const [imageOriginalBaseUrl,setImageOriginalBaseUrl]=useState();
  const [imageLargeBaseUrl,setImageLargeBaseUrl]=useState();
  const [m2Pallet,setM2Pallet]=useState();
  const [m2Box,setM2Box]=useState();
  const [data,setData]=useState();
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
        setData(data);
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
        setImageGeneralFileNames(data.imageGeneralFileNames);
        setImageTechnicalFileNames(data.imageTechnicalFileNames)
        setImageOriginalBaseUrl(data.imageOriginalBaseUrl);
        setImageLargeBaseUrl(data.imageLargeBaseUrl)
        setM2Pallet(data.m2Pallet);
        setM2Box(data.m2Box);
      })
      .catch();

    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchUrl();
  }, [onChange]);
  return [data,loading, description, itemCode, series, productionStatus, surface, color, dimension, productItem, type, rectifying, listPrice, imageUrl, unit, canBeSoldPartially, notes, campaign,imageThumbBaseUrl,imageMediumBaseUrl,imageGeneralFileNames,imageTechnicalFileNames,imageOriginalBaseUrl,imageLargeBaseUrl,m2Pallet,m2Box, setOnChange];
}



export { useGetProductItem };
