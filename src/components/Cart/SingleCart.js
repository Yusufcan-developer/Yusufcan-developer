import React from 'react';
import { notification } from '../index';
import { Col, Row, Button } from "antd";
import IntlMessages from "@iso/components/utility/intlMessages";
import Input from '@iso/components/uielements/input';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Configs
import numberFormat from "@iso/config/numberFormat";

export default function ({
  price,
  quantity,
  image,
  objectID,
  cancelQuantity,
  changeQuantity,
  _highlightResult,
  productItem,
  products,
}) {
  const { productQuantity } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();

  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  function onChangeQuantity(event, productData) {
    if (event.target.value > 0) {
      const product = productData;
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      const newProductQuantity = [];
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = parseInt(event.target.value);
          newProductQuantity.push({
            itemCode,
            quantity,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
    }
  };
  let totalPrice;
if(productItem.unit==='AD'){totalPrice = (productItem.listPrice * quantity).toFixed(2);}
else{totalPrice = ((productItem.listPrice * quantity)*productItem.m2Pallet).toFixed(2);}
  

  function onRemoveBox(product) {
    if (quantity !== 1) {
      changeQuantity(productItem.itemCode, quantity - 1);
    }
  };

  function onAddBox(product) {
    changeQuantity(productItem.itemCode, quantity + 1);
  };

  return (
    <tr>
      <td
        className="isoItemRemove"
        onClick={() => {
          cancelQuantity(objectID);
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
        <h3>{productItem.itemCode} {'-'} {productItem.description}</h3>
        <p>{productItem.type}</p>
      </td>
      <td className="isoItemPrice">
        {numberFormat(productItem.listPrice)} {"TL"}
      </td>
      <td className="isoItemUnit">
        {productItem.unit}
      </td>
      <td className="isoItemPalet">
        <Row justify="center" align="middle">
          <Col span={8} style={{ width: '100%' }} align="right">
            <Button type="primary" onClick={event => onRemoveBox(productItem)}>
              {<IntlMessages id="-" />}
            </Button>
          </Col>
          <Col span={8}>
            <Input
              min={1}
              id={productItem.itemCode}
              style={{ textAlign: "right" }}
              max={1000}
              defaultValue={1}
              value={quantity}
              step={1}
              onClick={event => onSelectAll(productItem.itemCode)}
              onChange={event => onChangeQuantity(event, productItem)}
            />
          </Col>
          <Col span={8} style={{ width: '100%' }}>
            <Button type="primary" onClick={event => onAddBox(productItem)}>
              {<IntlMessages id="+" />}
            </Button>
          </Col>
        </Row>
      </td>
      <td className="isoItemQuantity">
        {numberFormat(quantity * productItem.m2Pallet)} {'('+productItem.unit+')'}
      </td>
      <td className="isoItemPriceTotal">{numberFormat(totalPrice)} TL</td>
    </tr>
  );
}
