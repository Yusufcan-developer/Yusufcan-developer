import React from 'react';
import { useSelector } from 'react-redux';
import Button from '@iso/components/uielements/button';
import SingleOrderInfo from './SingleOrder';
import { OrderTable } from './Checkout.styles';

let totalPrice;

export default function OrderInfo() {
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  function renderProducts() {
    totalPrice = 0;
    return productQuantity.map(product => {
      totalPrice += product.quantity * products[product.itemCode].listPrice;
      return (
        <SingleOrderInfo
          key={product.objectID}
          quantity={product.quantity}
          productItem={products[product.itemCode]}
          {...products[product.itemCode]}
        />
      );
    });
  }
//Change First Name 
function saveOrder(event) {
};
  return (
    <OrderTable className="isoOrderInfo">
      <div className="isoOrderTable">
        <div className="isoOrderTableHead">
          <span className="tableHead">Ürün</span>
          <span className="tableHead">Toplam</span>
        </div>

        <div className="isoOrderTableBody">{renderProducts()}</div>
        <div className="isoOrderTableFooter">
          <span>Toplam</span>
          <span>{totalPrice.toFixed(2)} TL</span>
        </div>

        <Button type="primary" className="isoOrderBtn" onClick={event => saveOrder(event)}>
          Sipariş Oluştur
        </Button>
      </div>
    </OrderTable>
  );
}
