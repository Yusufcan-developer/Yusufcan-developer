//Get Cart Listesi
async function getCartList() {
    //Get Database to Redux Product Info
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
  
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (activeUser != undefined) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }
  
    await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}`, requestOptions)
      .then(response => {
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        productInfo = data;
      })
      .catch();
    return productInfo;
  }