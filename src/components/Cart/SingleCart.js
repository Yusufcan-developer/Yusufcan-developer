import React from 'react';
import { notification } from '../index';
import { Col, Row, Button } from "antd";
import IntlMessages from "@iso/components/utility/intlMessages";
import Input from '@iso/components/uielements/input';

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

  const onChange = value => {
    if (!isNaN(value.target.value)) {
      if (value.target.value !== quantity) {
        changeQuantity(productItem.itemCode, value.target.value);
      }
    } else {
      notification('error', 'Please give valid number');
    }
  };

  const totalPrice = (productItem.listPrice * quantity).toFixed(2);

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
        <img alt="#" src={productItem.imageUrl} />
      </td>
      <td className="isoItemName">
        <h3>{productItem.description}</h3>
        <p>{productItem.type}</p>
      </td>
      <td className="isoItemPrice">
        {productItem.listPrice.toFixed(2)} {"TL"}
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
              style={{ textAlign: "right" }}
              max={1000}
              defaultValue={1}
              value={quantity}
              step={1}
              onChange={onChange}
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
        {(quantity * productItem.m2Pallet).toFixed(2)}
      </td>
      <td className="isoItemPriceTotal">{totalPrice} TL</td>
    </tr>
  );
}
