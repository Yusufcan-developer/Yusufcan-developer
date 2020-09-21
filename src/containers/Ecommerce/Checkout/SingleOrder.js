import React from 'react';
import numberFormat from "@iso/config/numberFormat";
export default function ({ productItem }) {
  const trimName = productItem.item.description ? productItem.item.description.substring(0, 30) : '';
  return (
    <div className="isoSingleOrderInfo">
      <p>
        <span>{productItem.itemCode}</span>
        <span>-</span>
        <span>{trimName}</span>
        <span>x</span>
        <span className="isoQuantity">{productItem.orderAmount}</span>
      </p>
      <span className="totalPrice">{numberFormat(productItem.orderCost)} TL</span>
    </div>
  );
}
