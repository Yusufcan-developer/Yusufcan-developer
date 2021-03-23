//React
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Component
import Form from "@iso/components/uielements/form";
import Input from '@iso/components/uielements/input';
import ProductsTable from './CartTable.styles';
import { direction } from '@iso/lib/helpers/rtl';
import { Col, Row, Button, Modal, message } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { productAmountControl, productAmountControlDisabled } from '@iso/lib/helpers/productAmountControl';
import IntlMessages from "@iso/components/utility/intlMessages";

//Configs
import numberFormat from "@iso/config/numberFormat";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";
import logMessage from '@iso/config/logMessage';
import { DeleteOutlined } from '@ant-design/icons';
import viewType from '@iso/config/viewType';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

//Other Library
import { OrderTable } from '../Checkout/Checkout.styles';
import _ from 'underscore';
import getInitData from "../../../redux/ecommerce/config";
var jwtDecode = require('jwt-decode');

const { changeProductQuantity } = ecommerceActions;
let cartItem = null;
export default function CartTable({ style }) {
  const [cartChangeItem, setCartChangeItem] = useState(false);
  const view = viewType('CartTable');

  useEffect(() => {
    getCartList();
  }, [cartChangeItem]);
  document.title = "Sepet - Seramiksan B2B";
  let history = useHistory();
  const [totalCost, setTotalCost] = useState();
  const [total, setTotal] = useState();
  const [totalVat, setTotalVat] = useState();
  const [selectedAmout, setSelectedAmount] = useState(0);
  const [selectedPartialAmout, setSelectedPartialAmount] = useState(0);
  const [selectedProductItem, setSelectedProductItem] = useState();
  const [selectedIsPartial, setSelectedIsPartial] = useState();
  const [deleteCartVisible, setDeleteCartVisible] = useState(false);
  const [title, setTitle] = useState();
  const dispatch = useDispatch();
  const { productQuantity } = useSelector(state => state.Ecommerce);
  const [form] = Form.useForm();

  async function allCartItemChangeOrderAmount() {
    let sendDatabaseProductList;
    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);
    sendDatabaseProductList = _.each(productQuantity, (item) => {
      item.amount = item.quantity;
      // delete item['quantity'];
      item.orderAmount = item.amount;
    });
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser");
    const siteMode=getSiteMode();
    let account = '';
    if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) { account = token.dcode; };

    if (typeof activeUser != 'undefined') { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account, "siteMode":siteMode };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.carts.postCart, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          if (data !== 'Unauthorized') {
            if (data.isSuccessful === false) {
              return message.error(data.message);
            } else {
              productQuantity = [];
              // Verileri Redux'a gönderme işlemi  
              let sendReduxProductList = _.each(data.items, (item) => {
                item.quantity = item.amount;
              });
              if (sendReduxProductList) {
                sendReduxProductList.forEach(product => {
                  productQuantity.push({
                    itemCode: product.itemCode,
                    quantity: product.quantity,
                    orderAmount: product.orderAmount,
                    isPartial: product.isPartial
                  });
                });
              }
              localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            }
          }
          history.push('/checkout');
          window.location.reload(false);

        }
      })
      .catch();
  }
  //Get Cart
  async function getCartList() {
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const siteMode=getSiteMode();
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let apiUrl = '';
    if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includeUpdateDetails=true&siteMode=${siteMode}`; }
    else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includeUpdateDetails=true&siteMode=${siteMode}` }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(apiUrl, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        cartItem = data.items;
        setTotalCost(data.totalOverallCost);
        setTotal(data.totalCost);
        setTotalVat(data.totalVat);
        setCartChangeItem(false);
        getInitData();
      })
      .catch();
    return productInfo;
  }
  function onChange(e, item, isPartial) {
    if (!isNaN(e.target.value)) {
      if (isPartial) { parseInt(setSelectedPartialAmount(e.target.value)); setSelectedIsPartial(isPartial); setSelectedProductItem(item.itemCode); }
      else {
        setSelectedAmount(parseInt(e.target.value)); setSelectedIsPartial(isPartial); setSelectedProductItem(item.itemCode);
      }
    }
  }
  //Input Number return partial quantity value
  function inputNumberPartialQuantityValueNew(product, isPartial) {

    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial === isPartial);
    if ((selectedProductItem === product.itemCode) && (isPartial === selectedIsPartial)) {

      if (typeof selectedAmout === 'undefined') {
        if (selectedAmout < 1) {
          return selectedProduct.quantity;
        } else {
          { return selectedAmout }
        }

      }
      else {
        if (isPartial) {
          if (selectedPartialAmout < 1) {
            return selectedProduct.quantity;
          }
          else { return selectedPartialAmout }
        } else {
          if (selectedAmout < 1) {
            return selectedProduct.quantity;
          }
          else { return selectedAmout }
        }
      }
    }
    else {
      return selectedProduct.quantity;
    }
    setCartChangeItem(true);
  }

  //Ürünlerin Getirilmesi
  function renderItems() {
    if (!productQuantity || productQuantity.length === 0) {
      if (!productQuantity || productQuantity.length === 0) {
        return <React.Fragment>
          <tr className="isoNoItemMsg" style={{ textAlign: 'center' }}>
            <div className="isoNoItemMsg">
              <div className="isoNoItemMsg">
                <span>Ürün Bulunamadı</span>
              </div>
              <div justify='center' className="isoNoItemMsg">
                <span> <a href="/products/categories" >
                  Sepete Ürün Eklemek İçin Tıklayınız
            </a></span>
              </div>
            </div>
          </tr>
        </React.Fragment>

      }
    }
    if (cartItem !== null) {
      return productQuantity.map(product => {
        const key = product.itemCode + (product.isPartial ? '-partial' : null);
        const inputId = product.isPartial ? 'Kutu' + product.itemCode : 'Palet' + product.itemCode;
        let productItem;
        let products;
        productItem = _.find(cartItem, function (item) { return item.itemCode == product.itemCode; });
        if (typeof productItem !== 'undefined') {
          let totalVat = productItem.totalVat;
          let itemCode = productItem.itemCode;
          products = productItem;
          productItem = productItem.item;
          let itemTotalCost = 0;
          if (productItem !== null) {
            itemTotalCost = ((!product.isPartial ? productItem.listPrice * productItem.m2Pallet : productItem.partialPrice * productItem.m2Box) * product.quantity).toFixed(2);
          }
          return (
            <tr>
              <td className="isoItemRemove" onClick={() => { removeItem(product); }}>
                <a href="# ">
                  <i className="ion-android-close" />
                </a>
              </td>
              {productItem !== null ?
                <td className="isoItemImage">
                  <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} style={{ maxHeight: '50px' }} />
                </td> : null}
              {productItem !== null ?
                <td className="isoItemName">
                  <p style={{ marginBottom: '5px' }}>{product.type}</p>
                  <h3>{productItem.itemCode} {'-'} {productItem.description}</h3>
                  <ul style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                    {products.validationMessages.map((item) => (
                      <li style={{ color: 'red', fontSize: 'smaller' }}> {item.Value}</li>))}
                  </ul>
                </td>
                : <a href="#!">{itemCode + ' ürün logo tarafında silinmiştir. Sistem yöneticinize başvurunuz.'}</a>}
              {productItem !== null ?
                <td className="isoItemPrice">
                  {numberFormat(product.isPartial ? productItem.partialPrice : productItem.listPrice)} {"TL"}
                </td> : null}
              {productItem !== null ?
                <td className="isoItemUnit">
                  {productItem.unit}
                </td> : null}
              {productItem !== null ?
                <td className="isoItemPalet">
                  <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                    <Col span={6} style={{ width: '100%' }} align="right" >
                      <Button type="primary" onClick={event => onRemoveBox(product)} style={{ color: 'white' }}>
                        {<IntlMessages id="product.minus" />}
                      </Button>
                    </Col>
                    <Col span={12} align="middle">
                      <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{product.isPartial ? 'Kutu/Adet' : 'Palet'}</span>
                      <Input
                        min={1}
                        id={inputId}
                        style={{ textAlign: "right", maxHeight: '32px' }}
                        max={1000}
                        defaultValue={1}
                        value={inputNumberPartialQuantityValueNew(product, product.isPartial)}
                        step={1}
                        onClick={event => onSelectAll(inputId)}
                        onChange={event => onChange(event, product, product.isPartial)}
                        onBlur={event => onChangeQuantity(event, product, product.isPartial, productItem)}
                      />
                    </Col>
                    <Col span={6} style={{ width: '100%' }}>
                      <Button name={inputId} disabled={productAmountControlDisabled(productItem, product.isPartial, inputNumberPartialQuantityValueNew(product, product.isPartial))} type="primary" onClick={event => onAddBox(product, productItem)}>
                        {<IntlMessages id="product.plus" />}
                      </Button>
                    </Col>
                  </Row>
                </td> : null}
              {productItem !== null ?
                <td className="isoItemQuantity">
                  {numberFormat(product.quantity * (!product.isPartial ? productItem.m2Pallet : productItem.m2Box))} {'(' + productItem.unit + ')'}
                </td> : null}
              {productItem !== null ?
                <td className="isoItemPriceTotal">{numberFormat(itemTotalCost)} TL</td> : null}
            </tr>

          );
        }
      });
    }
  }

  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  //Redux product quantity change event
  function onChangeQuantity(event, productData, isPartial = false, productItem) {
    let inputAmount;
    const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
    if (event.target.value > 0) {
      const amountControl = productAmountControl(productItem, isPartial, parseInt(event.target.value));
      if (amountControl === -1) { inputAmount = event.target.value } else { inputAmount = amountControl }
      const product = productData;
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
      const newProductQuantity = [];
      let setQunatity;
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = parseInt(inputAmount);
          setQunatity = quantity;
          newProductQuantity.push({
            itemCode,
            quantity,
            isPartial,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
      setSelectedAmount(0);
      setSelectedPartialAmount(0);
      setCartChangeItem(true);
      postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.increaseProduct + setQunatity);
    }
  };

  function onRemoveBox(product) {
    const productIsPartialTitle = product.isPartial === true ? ' Parçalı' : ' Paletli';
    if (product.quantity !== 1) {
      const quantity = product.quantity - 1;
      changeQuantity(product.itemCode, product.quantity - 1, product.isPartial);
      postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.decreaseProduct + quantity);
    }
  };

  function onAddBox(product, productItem) {
    const productIsPartialTitle = product.isPartial === true ? ' Parçalı' : ' Paletli';
    const quantity = product.quantity + 1;
    const amountControl = productAmountControl(productItem, product.isPartial, parseInt(quantity));
    if (amountControl === -1) {
      changeQuantity(product.itemCode, product.quantity + 1, product.isPartial);
      postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.increaseProduct + quantity);
    }
  };

  //Sepet miktarının değişikliği
  function changeQuantity(itemCode, quantity, isPartial) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== itemCode || product.isPartial !== isPartial) {
        newProductQuantity.push(product);
      } else {
        newProductQuantity.push({
          itemCode,
          quantity,
          isPartial,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    setCartChangeItem(true);
  }


  //Sepetten ürünün çıkarılması
  function removeItem(productItem) {
    const productIsPartialTitle = productItem.isPartial === true ? ' Parçalı' : ' Paletli';
    setCartChangeItem(true);
    const newProductQuantity = [];
    _.each(productQuantity, (product) => {
      if ((product.itemCode !== productItem.itemCode || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, productItem.itemCode + productIsPartialTitle + logMessage.Carts.removeProduct);
  }

  //Sepetteki ürünlerin siparişe hazırlanması
  async function allProductToOrder() {
    //Sepette ki miktarların sipariş miktarına dönüştürülmesi
    await allCartItemChangeOrderAmount();
  }

  //Parçalı siparişlerin hazırlanması
  function orderPartial() {
    history.push('/orderPartial');
  }

  //Cart silme fetch işlemi
  async function deleteCart() {
    const newProductQuantity = [];
    dispatch(changeProductQuantity(newProductQuantity));
    setCartChangeItem(true);
  }

  //Sepet Silme işlemi
  async function handleCartDeleteOk() {
    await deleteCart();
    message.success('Sepet başarıyla silinmiştir.'); setDeleteCartVisible(false);
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, logMessage.Carts.deleteCart);
    return setCartChangeItem(true);
  };

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setDeleteCartVisible(false);
  };

  function removeCartItemShowModal() {

    const token = jwtDecode(localStorage.getItem("id_token"));
    if (typeof token === 'undefined') { return }
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (typeof activeUser != 'undefined') {
      uname = activeUser + ' hesabına ait sepetteki tüm ürünler silinecektir. Devam etmek istiyor musunuz?'
    } else {
      uname = 'Sepetinizdeki tüm ürünler silinecektir. Devam etmek istiyor musunuz?'
    }
    setTitle(uname);

    setDeleteCartVisible(true);
  }

  const classname = style != null ? style : '';
  return (
    <React.Fragment>
      <PageHeader>Sepet Detayı</PageHeader>
      <Col span={8} offset={16} align="right" >
        <Button type="primary" danger size="small" style={{ marginBottom: '5px' }}
          icon={<DeleteOutlined />} onClick={removeCartItemShowModal} >
          {<IntlMessages id="forms.button.cartAllRemove" />}
        </Button>
      </Col>
      <ProductsTable className={`isoCartTable ${classname}`}>
        <table className="sticky-column" style={{ overflow: 'auto' }}>
          <thead>
            <tr >
              <th className="isoItemRemove" />
              <th className="isoItemImage" />
              <th className="isoItemName">Ürün</th>
              <th className="isoItemPrice">Birim Fiyat</th>
              <th className="isoItemUnit">Birim</th>
              <th className="isoItemPalet">Sepete Eklenen</th>
              <th className="isoItemQuantity">Miktar</th>
              <th className="isoItemPriceTotal">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {renderItems()}
            <tr className="isoTotalBill">
              <td className="isoItemRemove" />
              <td className="isoItemImage" />
              <td className="isoItemName" />
              <td className="isoItemPrice" />
              <td className="isoItemUnit" />
              <td className="isoItemPalet" />
              <OrderTable className="isoOrderInfo">
                <div className="isoOrderTable">
                  <div className={view === 'MobileView' ? 'isoOrderTableFooterMobile' : "isoOrderTableFooter"} >
                    <span>Toplam</span>
                    <span>{typeof totalCost != 'undefined' ? (numberFormat(total)) : (0)} TL</span>
                  </div>
                  <div className={view === 'MobileView' ? 'isoOrderTableFooterMobile' : "isoOrderTableFooter"}>
                    <span>KDV</span>
                    <span>{typeof totalCost != 'undefined' ? (numberFormat(totalVat)) : (0)} TL</span>
                  </div>
                  <div className={view === 'MobileView' ? 'isoOrderTableFooterMobile' : "isoOrderTableFooter"}>
                    <span>Genel Toplam</span>
                    <span>{typeof totalCost != 'undefined' ? (numberFormat(totalCost)) : (0)} TL</span>
                  </div>
                </div>
              </OrderTable>
            </tr>

          </tbody>

          <tfoot>
            <tr>
              <td
                style={{
                  border: '1px',
                  width: '100%',
                  paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                  paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
                }}
              >
              </td>
              <td
                style={{
                  paddingRight: `${direction === 'rtl' ? '0' : '25px'}`,
                  paddingLeft: `${direction === 'rtl' ? '25px' : '0'}`,
                }}
              >
              </td>
              <td>
                <Button onClick={allProductToOrder}>
                  Tümünden Sipariş Oluştur
              </Button>
              </td>
              <td>
                <Button onClick={orderPartial} >
                  Kısmi Sipariş Oluştur
              </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </ProductsTable>
      <Modal
        visible={deleteCartVisible}
        title={"Dikkat! Sepet Silme"}
        okText="Sil"
        cancelText="İptal"
        maskClosable={false}
        onCancel={handleCancel}
        onOk={handleCartDeleteOk}
      >
        <p>{title}</p>
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: 'public',
          }}
        >
        </Form>
      </Modal>
    </React.Fragment>
  );
}

