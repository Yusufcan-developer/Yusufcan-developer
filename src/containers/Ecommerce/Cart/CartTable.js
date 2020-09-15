//React
import React, { useState, useEffect } from "react";
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Component
import Input from '@iso/components/uielements/input';
import Button from '@iso/components/uielements/button';
import SingleCart from '@iso/components/Cart/SingleCart';
import ProductsTable from './CartTable.styles';
import { direction } from '@iso/lib/helpers/rtl';
import { Menu, Dropdown } from "antd";

//Configs
import numberFormat from "@iso/config/numberFormat";
import siteConfig from "@iso/config/site.config";

//Style
import { DownOutlined } from '@ant-design/icons';

//Other Library
import _ from 'underscore';
var jwtDecode = require('jwt-decode');

const { changeProductQuantity } = ecommerceActions;
let totalCost = 0;

export default function CartTable({ style }) {
  const [cartData, setCartData] = useState();
  let history = useHistory();
  const dispatch = useDispatch();
  const { productQuantity, products } = useSelector(state => state.Ecommerce);

  async function allCartItemChangeOrderAmount() {
    let sendDatabaseProductList
    let products = localStorage.getItem('cartProducts');
    let productQuantity = localStorage.getItem('cartProductQuantity');
    products = JSON.parse(products);
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
            products = {};
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
                  isPartial:product.isPartial
                });
                products[product.itemCode] = product.item;
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            localStorage.setItem('cartProducts', JSON.stringify(products));
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
        // setCartData(data.items);
        totalCost = data.totalCost;
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
    return productQuantity.map(product => {
      const key = product.itemCode + (product.isPartial ? '-partial' : null);
      const inputId = product.isPartial ? 'Kutu' + product.itemCode : 'Palet' + product.itemCode;
      return (
        <SingleCart
          key={key}
          quantity={product.quantity}
          changeQuantity={changeQuantity}
          cancelQuantity={event => cancelQuantity(product)}
          productItem={products[product.itemCode]}
          isPartial={product.isPartial}
          inputId={inputId}
          {...products[product.itemCode]}
        />
      );
    });
  }

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
  }

  //Sepetten ürünün çıkarılması
  function cancelQuantity(productItem) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== productItem.itemCode) {
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
