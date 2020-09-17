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
  isPartial,
  products,
  inputId,
}) {
  const { productQuantity } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();
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
  // let totalPrice;
  // if (productItem.unit === 'AD') {
  //   totalPrice = (productItem.listPrice * quantity).toFixed(2);
  // } else {
  //   totalPrice = ((productItem.listPrice * quantity) * productItem.m2Pallet).toFixed(2);
  // }
  const totalCost = ((!isPartial ? productItem.listPrice * productItem.m2Pallet : productItem.partialPrice * productItem.m2Box) * quantity).toFixed(2);

  function onRemoveBox(product) {
    if (quantity !== 1) {
      changeQuantity(productItem.itemCode, quantity - 1, isPartial);
    }
  };

  function onAddBox(product) {
    changeQuantity(productItem.itemCode, quantity + 1, isPartial);
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
        <p style={{ marginBottom: '5px' }}>{productItem.type}</p>
        <h3>{productItem.itemCode} {'-'} {productItem.description}</h3>
      </td>
      <td className="isoItemPrice">
        {numberFormat(isPartial ? productItem.partialPrice : productItem.listPrice)} {"TL"}
      </td>
      <td className="isoItemUnit">
        {productItem.unit}
      </td>
      <td className="isoItemPalet">
        <Row justify="center" align="bottom">
          <Col span={8} style={{ width: '100%' }} align="right">
            <Button type="primary" onClick={event => onRemoveBox(productItem)} style={{ color: 'white' }}>
              -
            </Button>
          </Col>
          <Col span={8}>
            <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{isPartial ? 'Kutu/Adet' : 'Palet'}</span>
            <Input
              min={1}
              id={inputId}
              style={{ textAlign: "right", maxHeight: "32px" }}
              max={1000}
              defaultValue={1}
              value={quantity}
              step={1}
              onClick={event => onSelectAll(inputId)}
              onChange={event => onChangeQuantity(event, productItem, isPartial)}
            />
          </Col>
          <Col span={8} style={{ width: '100%' }}>
            <Button type="primary" onClick={event => onAddBox(productItem)} style={{ color: 'white' }}>
              +
            </Button>
          </Col>
        </Row>
      </td>
      <td className="isoItemQuantity">
        {numberFormat(quantity * (!isPartial ? productItem.m2Pallet : productItem.m2Box))} {'(' + productItem.unit + ')'}
      </td>
      <td className="isoItemPriceTotal">{numberFormat(totalCost)} TL</td>
    </tr>
  );
}
