import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import fake from './fake';
import getInitData from './config';
import _ from 'underscore';
import siteConfig from "@iso/config/site.config";
import history from '@iso/lib/helpers/history';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
var jwtDecode = require('jwt-decode');

export function* changedCard() {
  yield takeEvery(actions.CHANGE_CARDS, function* () { });
}
//Get database product Info to redux
export function* initData() {
  let productQuantity = localStorage.getItem('cartProductQuantity');
  productQuantity = JSON.parse(productQuantity);

  //Redux send data
  yield put({
    type: actions.UPDATE_DATA,
    productQuantity,
  });
}
export function* updateData({ productQuantity }) {

  localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
  yield put({
    type: actions.UPDATE_DATA,
    productQuantity,
  });

  //Redux product code and product quantity send database  
  let sendDatabaseProductList = _.each(productQuantity, (item) => {
    item['amount'] = item['quantity'];
    delete item['quantity'];
  });
  const token = jwtDecode(localStorage.getItem("id_token"));
  if(token===undefined){return  history.replace('/');}
  const activeUser = localStorage.getItem("activeUser")
  let account = token.uname;
  if (activeUser != undefined) { account = activeUser }
  const reqBody = { "items": sendDatabaseProductList,"accountNo": account };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
    },
    body: JSON.stringify(reqBody)
  };
  fetch(siteConfig.api.carts.postCart, requestOptions)
    .then(response => {
      if (!response.ok) (console.log(response.statusText));
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
