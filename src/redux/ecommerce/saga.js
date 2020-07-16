import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import fake from './fake';
import getInitData from './config';
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';


export function* changedCard() {
  yield takeEvery(actions.CHANGE_CARDS, function* () { });
}
//Get database product Info to redux
export function* initData() {
  let products = localStorage.getItem('cartProducts');
  let productQuantity = localStorage.getItem('cartProductQuantity');
  products = JSON.parse(products);
  productQuantity = JSON.parse(productQuantity);

  //Redux send data
  yield put({
    type: actions.UPDATE_DATA,
    products,
    productQuantity,
  });
}
export function* updateData({ products, productQuantity }) {

  localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
  localStorage.setItem('cartProducts', JSON.stringify(products));
  yield put({
    type: actions.UPDATE_DATA,
    products,
    productQuantity,
  });

  //Redux product code and product quantity send database  
  let sendDatabaseProductList = _.each(productQuantity, (item) => {
    item['amount'] = item['quantity'];
    delete item['quantity'];
  });

  const reqBody = { "items": sendDatabaseProductList };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
    },
    body: JSON.stringify(reqBody)
  };
  fetch(siteConfig.api.productInfoRedux, requestOptions)
    .then(response => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then(data => {
    })
    .catch();
}
export default function* () {
  yield all([

    takeEvery(actions.UPDATE_DATA_SAGA, updateData),
    takeEvery(actions.INIT_DATA_SAGA, initData),
  ]);
}
