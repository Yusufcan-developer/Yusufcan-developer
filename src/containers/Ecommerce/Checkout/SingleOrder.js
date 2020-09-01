import React from 'react';

export default function({ price, quantity, _highlightResult,productItem }) {
  const name = productItem.description;
  const totalPrice = (productItem.listPrice * quantity).toFixed(2);
  const trimName = productItem.description ? productItem.description.substring(0, 30) : '';
  return (
    <div className="isoSingleOrderInfo">
      <p>
      <span>{productItem.itemCode}</span>
      <span>-</span>
        <span>{trimName}</span>
        <span>x</span>
        <span className="isoQuantity">{quantity}</span>
      </p>
      <span className="totalPrice">{totalPrice} TL</span>
    </div>
  );
}
