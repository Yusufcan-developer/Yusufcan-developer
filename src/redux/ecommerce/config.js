import { isServer } from '@iso/lib/helpers/isServer';
import siteConfig from "@iso/config/site.config";
import _ from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import React, { useState, useEffect } from "react";
import authAction from '@iso/redux/auth/actions';
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
  if (!token.uname) { return 'Unauthorized' }
  await fetch(`${siteConfig.api.carts.getGetByAccountNo}${token.uname}`, requestOptions)
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

async function getInitData() {
  let productQuantity = [];
  const products = {};
  if (localStorage.getItem("id_token")) {
    const cartProductQuantity = localStorage.getItem('cartProductQuantity');
    let cartProducts = localStorage.getItem('cartProducts');
    const productsData = await getDatabaseProductInfo();
    if (productsData !== 'Unauthorized') {
      // Database product code and product quantity send Redux  
      let sendReduxProductList = _.each(productsData.items, (item) => {
        item['quantity'] = item['amount'];
        delete item['amount'];
      });
      sendReduxProductList.forEach(product => {
        productQuantity.push({
          itemCode: product.itemCode,
          quantity: product.quantity,
        });
        products[product.itemCode] = product.item;
      });
    } else { }
  }

  localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
  localStorage.setItem('cartProducts', JSON.stringify(products));
  return { productQuantity, products };
}

export default getInitData();
