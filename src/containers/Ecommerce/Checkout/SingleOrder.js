import React from 'react';
import numberFormat from "@iso/config/numberFormat";
export default function ({ productItem }) {
  const trimName = productItem.item.description ? productItem.item.description.substring(0, 30) : '';
  return (
    <div className="isoSingleOrderInfo">
      <p>
        <span style={{ color: '#000000' }}>{productItem.itemCode}</span>
        <span style={{ color: '#000000' }}>-</span>
        <span style={{ color: '#000000' }}>{trimName}</span>
        <span style={{ color: '#000000' }}>x</span>
        <span style={{ color: '#000000' }} className="isoQuantity">{productItem.orderAmount}</span>
        <ul style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
          {productItem.validationMessages.map((item) => (
            <li style={{ color: 'red', fontSize: 'smaller' }}> {item.Value}</li>))}
          </ul>
      </p>
      <span style={{ textAlign: 'right', minWidth: '100px' }} className="totalPrice">{numberFormat(productItem.orderCost)} TL</span>
    </div>
  );
}
