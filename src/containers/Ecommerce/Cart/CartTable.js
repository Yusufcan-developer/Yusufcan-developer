import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Input from '@iso/components/uielements/input';
import Button from '@iso/components/uielements/button';
import SingleCart from '@iso/components/Cart/SingleCart';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import ProductsTable from './CartTable.styles';
import { direction } from '@iso/lib/helpers/rtl';

const { changeProductQuantity } = ecommerceActions;

let totalPrice = 0;
export default function CartTable({ style }) {
  const dispatch = useDispatch();
  const { productQuantity, products } = useSelector(state => state.Ecommerce);

  function renderItems() {
    totalPrice = 0;
    if (!productQuantity || productQuantity.length === 0) {
      return <tr className="isoNoItemMsg">Ürün Bulunamadı</tr>;
    }
    return productQuantity.map(product => {
      totalPrice += product.quantity * products[product.itemCode].listPrice;
      return (
        <SingleCart
          key={product.itemCode}
          quantity={product.quantity}
          changeQuantity={changeQuantity}
          cancelQuantity={event => cancelQuantity(product)}
          productItem={products[product.itemCode]}
          {...products[product.itemCode]}
        />
      );
    });
  }
  function changeQuantity(itemCode, quantity) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== itemCode) {
        
        newProductQuantity.push(product);
      } else {
        newProductQuantity.push({
          itemCode,
          quantity,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
  }
  function cancelQuantity(productItem) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== productItem.itemCode) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
  }
  const classname = style != null ? style : '';
  return (
    <ProductsTable className={`isoCartTable ${classname}`}>
      <table>
        <thead>
          <tr>
            <th className="isoItemRemove" />
            <th className="isoItemImage" />
            <th className="isoItemName">Ürün Adı</th>
            <th className="isoItemPrice">Birim Fiyat</th>
            <th className="isoItemPalet">Palet</th>
            <th className="isoItemQuantity">Miktar (m2)</th>
            <th className="isoItemPriceTotal">Toplam</th>
          </tr>
        </thead>

        <tbody>
          {renderItems()}
          <tr className="isoTotalBill">
            <td className="isoItemRemove" />
            <td className="isoItemImage" />
            <td className="isoItemName" />
            <td className="isoItemPrice" />
            <td className="isoItemPalet" />
            <td className="isoItemQuantity">Toplam Tutar</td>
            <td className="isoItemPriceTotal">{totalPrice.toFixed(2)} TL</td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td
              style={{
                border:'1px',
                width: '100%',
                paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
              }}
            >
              <Input size="large" placeholder="Kampanya Kodu" />
            </td>
            <td
              style={{
                paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
              }}
            >
              <Button>Uygula</Button>
            </td>
            <td>
              <Button type="primary">
                <Link to={'/checkout'}>Sipariş Oluştur</Link>
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </ProductsTable>
  );
}
