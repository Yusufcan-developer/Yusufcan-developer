import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
//Configs
import siteConfig from "@iso/config/site.config";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { message } from "antd";

var jwtDecode = require('jwt-decode');


async function AllCartItemChangeOrderAmount() {
    let sendDatabaseProductList;
    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);
    sendDatabaseProductList = _.each(productQuantity, (item) => {
      item.amount = item.quantity;
      // delete item['quantity'];
      item.orderAmount = item.amount;
    });
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser");
    const siteMode = getSiteMode();
    let account = '';
    if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')|| (token.urole === 'dealersub')) { account = token.dcode; };

    if (typeof activeUser != 'undefined') { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account, "siteMode": siteMode };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.carts.postCart, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          if (data !== 'Unauthorized') {
            if (data.isSuccessful === false) {
              return message.error(data.message);
            } else {
              productQuantity = [];
              // Verileri Redux'a gönderme işlemi  
              let sendReduxProductList = _.each(data.items, (item) => {
                item.quantity = item.amount;
              });
              if (sendReduxProductList) {
                sendReduxProductList.forEach(product => {
                  productQuantity.push({
                    itemCode: product.itemCode,
                    quantity: product.quantity,
                    orderAmount: product.orderAmount,
                    isPartial: product.isPartial,
                    totalM2: product.totalM2
                  });
                });
              }
              localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            }
          }
        }
      })
      .catch();
  }
  
  export default AllCartItemChangeOrderAmount;