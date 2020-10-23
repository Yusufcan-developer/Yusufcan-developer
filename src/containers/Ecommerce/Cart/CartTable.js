//React
import React, { useState, useEffect } from "react";
import {  useHistory, Link } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Component
import Input from '@iso/components/uielements/input';
import ProductsTable from './CartTable.styles';
import { direction } from '@iso/lib/helpers/rtl';
import { Col, Row, Button } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import numberFormat from "@iso/config/numberFormat";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";

//Other Library
import { OrderTable } from '../Checkout/Checkout.styles';
import _ from 'underscore';
import getInitData from "../../../redux/ecommerce/config";
var jwtDecode = require('jwt-decode');

const { changeProductQuantity } = ecommerceActions;
let cartItem = null;
export default function CartTable({ style }) {

  useEffect(() => {
    postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, 'Sepet ürün listesi');  
  }, []);
  document.title = "Sepet - Seramiksan B2B";
  let history = useHistory();
  const [totalCost, setTotalCost] = useState();
  const [total, setTotal] = useState();
  const [totalVat, setTotalVat] = useState();
  const dispatch = useDispatch();
 const { productQuantity } = useSelector(state => state.Ecommerce);

  async function allCartItemChangeOrderAmount() {
    let sendDatabaseProductList;
    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);
    sendDatabaseProductList = _.each(productQuantity, (item) => {
      item.amount = item.quantity;
      // delete item['quantity'];
      item.orderAmount = item.amount;
    });
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let account = token.uname;
    if (activeUser != undefined) { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account };
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
                  isPartial: product.isPartial
                });
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));

          }
        }
        else {
        }
        history.push('/checkout');
        window.location.reload(false);
      })
      .catch();
  }
  //Get Cart
  async function getCartList() {

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
        const status = apiStatusManagement(response,true);
        return status;
      })
      .then(data => {
        cartItem = data.items;
        setTotalCost(data.totalOverallCost);
        setTotal(data.totalCost);
        setTotalVat(data.totalVat);
        getInitData();

      })
      .catch();
    return productInfo;
  }
  //Ürünlerin Getirilmesi
  function renderItems() {
    getCartList();
    if (!productQuantity || productQuantity.length === 0) {
      if (!productQuantity || productQuantity.length === 0) {
        return <React.Fragment> 
          <tr className="isoNoItemMsg" style={{ textAlign: 'center' }}>
            <div className="isoNoItemMsg">
              <div className="isoNoItemMsg">
                <span>Ürün Bulunamadı</span>
              </div>
              <div justify='center' className="isoNoItemMsg">
                <span> <a href="/products/categories" >
                  Sepete Ürün Eklemek İçin Tıklayınız
            </a></span>
              </div>
            </div>
          </tr>
        </React.Fragment>
     
      }     
    }
    if (cartItem !== null) {
      return productQuantity.map(product => {
        const key = product.itemCode + (product.isPartial ? '-partial' : null);
        const inputId = product.isPartial ? 'Kutu' + product.itemCode : 'Palet' + product.itemCode;
        let productItem;
        productItem = _.find(cartItem, function (item) { return item.itemCode == product.itemCode; });
        if (productItem !== undefined) {
          let totalVat = productItem.totalVat;
          productItem = productItem.item;
          const itemTotalCost = ((!product.isPartial ? productItem.listPrice * productItem.m2Pallet : productItem.partialPrice * productItem.m2Box) * product.quantity).toFixed(2);

          return (
            <tr>
              <td
                className="isoItemRemove"
                onClick={() => {
                  cancelQuantity(product);
                }}
              >
                <a href="# ">
                  <i className="ion-android-close" />
                </a>
              </td>
              <td className="isoItemImage">
                <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} style={{ maxHeight: '50px' }} />
              </td>
              <td className="isoItemName">
                <p style={{ marginBottom: '5px' }}>{product.type}</p>
                <h3>{productItem.itemCode} {'-'} {productItem.description}</h3>
              </td>
              <td className="isoItemPrice">
                {numberFormat(product.isPartial ? productItem.partialPrice : productItem.listPrice)} {"TL"}
              </td>
              <td className="isoItemUnit">
                {productItem.unit}
              </td>
              <td className="isoItemPalet">
                <Row justify="center" align="bottom">
                  <Col span={8} >
                    <Button type="primary" onClick={event => onRemoveBox(product)} style={{ color: 'white' }}>
                      -
              </Button>
                  </Col>
                  <Col span={8}>
                    <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{product.isPartial ? 'Kutu/Adet' : 'Palet'}</span>
                    <Input
                      min={1}
                      id={inputId}
                      style={{ textAlign: "right", maxHeight: "100px" }}
                      max={1000}
                      defaultValue={1}
                      value={product.quantity}
                      step={1}
                      onClick={event => onSelectAll(inputId)}
                      onChange={event => onChangeQuantity(event, product, product.isPartial)}
                    />
                  </Col>
                  <Col span={8} style={{ width: '100%' }}>
                    <Button type="primary" onClick={event => onAddBox(product)} style={{ color: 'white' }}>
                      +
              </Button>
                  </Col>
                </Row>
              </td>
              <td className="isoItemQuantity">
                {numberFormat(product.quantity * (!product.isPartial ? productItem.m2Pallet : productItem.m2Box))} {'(' + productItem.unit + ')'}
              </td>
              <td className="isoItemPriceTotal">{numberFormat(itemTotalCost)} TL</td>
            </tr>

          );
        }
      });
    }
  }
 
  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  //Redux product quantity change event
  function onChangeQuantity(event, productData, isPartial = false) {
    const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
    if (event.target.value > 0) {
      const product = productData;
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
      const newProductQuantity = [];
      let setQunatity;
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = parseInt(event.target.value);
          setQunatity=quantity;
          newProductQuantity.push({
            itemCode,
            quantity,
            isPartial,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
      postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode +productIsPartialTitle+ ' Ürünün miktarı arttırıldı.'+'Miktar '+setQunatity);
    }
  };

  function onRemoveBox(product) {
    const productIsPartialTitle = product.isPartial === true ? ' Parçalı' : ' Paletli';
    if (product.quantity !== 1) {
      const quantity=product.quantity - 1;
      changeQuantity(product.itemCode, product.quantity - 1, product.isPartial);
      postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode +productIsPartialTitle+ ' ürünün miktarı azaltıld.'+'Miktar '+quantity);
    }
  };

  function onAddBox(product) {
    const productIsPartialTitle = product.isPartial === true ? ' Parçalı' : ' Paletli';
    const quantity=product.quantity + 1;
    changeQuantity(product.itemCode, product.quantity + 1, product.isPartial);
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode +productIsPartialTitle+ ' ürünün miktarı arttırıldı.'+'Miktar '+quantity);
  };

  //Sepet miktarının değişikliği
  function changeQuantity(itemCode, quantity, isPartial) {    
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== itemCode || product.isPartial !== isPartial) {
        newProductQuantity.push(product);
      } else {
        newProductQuantity.push({
          itemCode,
          quantity,
          isPartial,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    getCartList();
  }

  //Sepetten ürünün çıkarılması
  function cancelQuantity(productItem) {
    const productIsPartialTitle = productItem.isPartial === true ? ' Parçalı' : ' Paletli';
    getCartList();
    const newProductQuantity = [];
    _.each(productQuantity, (product) => {
      if ((product.itemCode !== productItem.itemCode || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, productItem.itemCode + productIsPartialTitle+ ' Ürün sepetten çıkarıldı.');
  }

  //Sepetteki ürünlerin siparişe hazırlanması
  async function allProductToOrder() {
    //Sepette ki miktarların sipariş miktarına dönüştürülmesi
    await allCartItemChangeOrderAmount();
  }

  //Parçalı siparişlerin hazırlanması
  function orderPartial() {
    history.push('/orderPartial');
  }
  const classname = style != null ? style : '';
  return (
    <React.Fragment>
     <PageHeader>Sepet Detayı</PageHeader>
      <ProductsTable className={`isoCartTable ${classname}`}>
        <table className="sticky-column" style={{overflow:'scroll'}}>
        <thead>
          <tr >
            <th className="isoItemRemove" />
            <th className="isoItemImage" />
            <th className="isoItemName">Ürün</th>
            <th className="isoItemPrice">Birim Fiyat</th>
            <th className="isoItemUnit">Birim</th>
            <th className="isoItemPalet">Sepete Eklenen</th>
            <th className="isoItemQuantity">Miktar</th>
            <th className="isoItemPriceTotal">Tutar</th>
          </tr>
        </thead>

        <tbody>
          {renderItems()}
          <tr className="isoTotalBill">
            <td className="isoItemRemove" />
            <td className="isoItemImage" />
            <td className="isoItemName" />
            <td className="isoItemPrice" />
            <td className="isoItemUnit" />
            <td className="isoItemPalet" />
            <OrderTable className="isoOrderInfo">
                <div className="isoOrderTable">                  
                  <div className="isoOrderTableFooter">
                    <span>Toplam</span>
                    <span>{totalCost != undefined ? (numberFormat(total)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>KDV</span>
                    <span>{totalCost != undefined ? (numberFormat(totalVat)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>Genel Toplam</span>
                    <span>{totalCost != undefined ? (numberFormat(totalCost)) : (0)} TL</span>
                  </div>                 
                </div>
              </OrderTable>
          </tr>
         
        </tbody>
       
        <tfoot>
          <tr>
            <td
              style={{
                border: '1px',
                width: '100%',
                paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
              }}
            >
            </td>
            <td
              style={{
                paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
              }}
            >
            </td>
            <td>
              <Button onClick={allProductToOrder}>
                Tümünden Sipariş Oluştur
              </Button>
            </td>
            <td>
              <Button onClick={orderPartial} >
                Kısmi Sipariş Oluştur
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </ProductsTable>
    </React.Fragment>
  );
}
