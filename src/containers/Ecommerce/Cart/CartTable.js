//React
import React from 'react';
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
import {  Menu, Dropdown } from "antd";

//Configs
import numberFormat from "@iso/config/numberFormat";

//Style
import { DownOutlined } from '@ant-design/icons';

const { changeProductQuantity } = ecommerceActions;
let totalPrice = 0;

export default function CartTable({ style }) {
  
  let history = useHistory();
  const dispatch = useDispatch();
  const { productQuantity, products } = useSelector(state => state.Ecommerce);

  //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">Tümünü Sipariş Oluştur</Menu.Item>
    <Menu.Item key="2">Parçalı Sipariş</Menu.Item>
  </Menu>
);
 //Menü Secimlerine Göre Modal açma işlemleri
  //3 Adet Modal bulunmaktadır.Bunlar işlemler menüsü secimlerine göre Kullanıcı Düzenleme,Parola yenileme ve Kullanıcı silme modalları
  function handleMenuClick(value) {
    switch (value.key) {
      case '1':
        history.push('/checkout');
        break;
      case '2':
        history.push('/orderSectional');
        break;
      default:
        break;
    }
  }

  //Ürünlerin Getirilmesi
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

  //Sepet miktarının değişikliği
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
            <td className="isoItemPriceTotal">{numberFormat(totalPrice)} TL</td>
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
            <Dropdown overlay={menu} trigger={['hover'] }  >
          <Button >
            İşlemler  <DownOutlined />
          </Button>
        </Dropdown>
              {/* <Button type="primary">
               
              </Button> */}
            </td>
          </tr>
        </tfoot>
      </table>
    </ProductsTable>
  );
}
