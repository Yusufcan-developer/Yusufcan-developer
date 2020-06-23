import React from 'react';
import InputNumber from '../uielements/InputNumber';
import { notification } from '../index';

export default function({
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
    console.log('xxxx change value',value)
    console.log('xxxx quantity value',quantity)
    if (!isNaN(value)) {
      if (value !== quantity) {
        console.log('xxxx değisecek',productItem.itemCode);
        changeQuantity(productItem.itemCode, value);
      }
    } else {
      notification('error', 'Please give valid number');
    }
  };
  console.log('xxxx productItem asda ',productItem);
  const totalPrice = (productItem.listPrice * quantity).toFixed(2);
  console.log('xxxx dasdasd ',price);
  console.log('xxxx asdasdasdad',price)
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
        {/* <span className="itemPricePrefix">$</span> */}
        {productItem.listPrice.toFixed(2)} {"TL"}
      </td>
      <td className="isoItemQuantity">
        <InputNumber
          min={1}
          max={1000}
          value={quantity}
          step={1}
          onChange={onChange}
        />
      </td>
      <td className="isoItemPriceTotal">{totalPrice} TL</td>
    </tr>
  );
}
