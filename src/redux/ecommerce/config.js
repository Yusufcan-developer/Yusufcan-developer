import { isServer } from '@iso/lib/helpers/isServer';
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import history from '@iso/lib/helpers/history';
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import React, { useState, useEffect } from "react";
import authAction from '@iso/redux/auth/actions';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
var jwtDecode = require('jwt-decode');

const { logout } = authAction;
const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;

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
  const token = jwtDecode(localStorage.getItem("id_token"));
  if(token===undefined){return  history.replace('/');}
  const activeUser = localStorage.getItem("activeUser")
  let uname = token.uname;
  if (activeUser != undefined) { uname = activeUser }

  if (!token.uname) { return 'Unauthorized' }

  await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}`, requestOptions)
  .then(response => {
    const status = apiStatusManagement(response,true);
    return status;
})
    .then(data => {
      debugger
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
            orderAmount:product.orderAmount,
            isPartial:product.isPartial
          });
        });
      }

  localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
    } else { }
  }
  return { productQuantity };
}

export default getInitData();
