//React
import React, { useState, useEffect } from "react";
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Component
import Input from '@iso/components/uielements/input';
import ProductsTable from './CartTable.styles';
import { direction } from '@iso/lib/helpers/rtl';
import { Menu, Dropdown, Col, Row, Button } from "antd";

//Configs
import numberFormat from "@iso/config/numberFormat";
import siteConfig from "@iso/config/site.config";

//Style
import { DownOutlined } from '@ant-design/icons';

//Other Library
import _ from 'underscore';
var jwtDecode = require('jwt-decode');

const { changeProductQuantity } = ecommerceActions;
let cartItem=null;
export default function CartTable({ style }) {

  const [totalCost, setTotalCost] = useState();
  let history = useHistory();
  const dispatch = useDispatch();
  const { productQuantity } = useSelector(state => state.Ecommerce);

  async function allCartItemChangeOrderAmount() {
    let sendDatabaseProductList
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
        switch (response.status) {
          case 201:
            return response.json();
            break;
          case 400:
            return response.json();
            break;
          case 401:
            // Go to login
            break;
          case 404:
            // Show 404 page
            break;
          case 500:
            // Serveur Error redirect to 500
            break;
          default:
            // Unknow Error
            break;
        }
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
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        cartItem=data.items;
        setTotalCost(data.totalOverallCost);
      })
      .catch();
    return productInfo;
  }
  //Ürünlerin Getirilmesi
  function renderItems() {
    getCartList()
    if (!productQuantity || productQuantity.length === 0) {
      return <tr className="isoNoItemMsg">Ürün Bulunamadı</tr>;
    }
    if(cartItem!==null){
      debugger
    return productQuantity.map(product => {
      debugger   
      const key = product.itemCode + (product.isPartial ? '-partial' : null);
      const inputId = product.isPartial ? 'Kutu' + product.itemCode : 'Palet' + product.itemCode;
      let productItem ;           
      productItem = _.find(cartItem, function(item){ return item.itemCode ==product.itemCode; });
      if(productItem!==undefined){
      let totalVat=productItem.totalVat;
      productItem=productItem.item;
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
              <Col span={8} style={{ width: '100%' }} align="right">
                <Button type="primary" onClick={event => onRemoveBox(product)} style={{ color: 'white' }}>
                  -
              </Button>
              </Col>
              <Col span={8}>
                <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{product.isPartial ? 'Kutu/Adet' : 'Palet'}</span>
                <Input
                  min={1}
                  id={inputId}
                  style={{ textAlign: "right", maxHeight: "32px" }}
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
          <td className="isoItemOrderVat">
            {numberFormat(totalVat)}
          </td>
          <td className="isoItemPriceTotal">{numberFormat(itemTotalCost)} TL</td>
        </tr>

      );
    }});
  }}
  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  //Redux product quantity change event
  function onChangeQuantity(event, productData, isPartial = false) {
    if (event.target.value > 0) {
      const product = productData;
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
      const newProductQuantity = [];
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = parseInt(event.target.value);
          newProductQuantity.push({
            itemCode,
            quantity,
            isPartial,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
    }
  };

  function onRemoveBox(product) {
    if (product.quantity !== 1) {
      changeQuantity(product.itemCode, product.quantity - 1, product.isPartial);
    }
  };

  function onAddBox(product) {
    changeQuantity(product.itemCode, product.quantity + 1, product.isPartial);
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
    getCartList();
    const newProductQuantity = [];
    _.each(productQuantity, (product) => {
      if ((product.itemCode !== productItem.itemCode || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
  }

  //Sepetteki ürünlerin siparişe hazırlanması
  async function allProductToOrder() {
    //Sepette ki miktarların sipariş miktarına dönüştürülmesi
    await allCartItemChangeOrderAmount();
    history.push('/checkout');
  }

  //Parçalı siparişlerin hazırlanması
  function orderPartial() {
    history.push('/orderPartial');
  }
  const classname = style != null ? style : '';
  return (
    <ProductsTable className={`isoCartTable ${classname}`}>
      <table>
        <thead>
          <tr>
            <th className="isoItemRemove" />
            <th className="isoItemImage" />
            <th className="isoItemName">Ürün</th>
            <th className="isoItemPrice">Birim Fiyat</th>
            <th className="isoItemUnit">Birim</th>
            <th className="isoItemPalet">Sepete Eklenen</th>
            <th className="isoItemQuantity">Miktar</th>
            <th className="isoItemOrderVat">KDV Tutarı</th>
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
            <th className="isoItemUnit" />
            <td className="isoItemPalet" />
            <td className="isoItemOrderVat" />
            <td className="isoItemQuantity">Toplam Tutar</td>
            <td className="isoItemPriceTotal">{numberFormat(totalCost)} TL</td>
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
  );
}
