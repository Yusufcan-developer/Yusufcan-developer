
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import history from '@iso/lib/helpers/history';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
var jwtDecode = require('jwt-decode');

export default function getInitData() {
  getInitData();

  async function getDatabaseProductInfo() {
    //Get Database to Redux Product Info
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const siteMode=getSiteMode();
    const token = jwtDecode(localStorage.getItem("id_token"));
    if (token === undefined) { return history.replace('/'); }
    const activeUser = localStorage.getItem("activeUser")
    let apiUrl='';
    if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?siteMode=${siteMode}`;}
      else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?siteMode=${siteMode}` }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(apiUrl, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        productInfo = data;
      })
      .catch(
      );
    return productInfo;
  }

  async function getInitData() {
    let productQuantity = [];
    if (localStorage.getItem("id_token")) {
      const cartProductQuantity = localStorage.getItem('cartProductQuantity');
      const productsData = await getDatabaseProductInfo();
      if (productsData !== 'Unauthorized') {
        // Database product code and product quantity send Redux  
        let sendReduxProductList = _.each(productsData.items, (item) => {
          item['quantity'] = item['amount'];
          delete item['amount'];
        });
        if (sendReduxProductList) {
          sendReduxProductList.forEach(product => {
            productQuantity.push({
              itemCode: product.itemCode,
              quantity: product.quantity,
              orderAmount: product.orderAmount,
              isPartial: product.isPartial,
              totalM2:product.totalM2,
            });
          });
        }
        localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
      }
    }
    return { productQuantity };
  }
}
