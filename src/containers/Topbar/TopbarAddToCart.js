//React
import React, { useState, useEffect } from "react";
import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';


//Component
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import Popover from '@iso/components/uielements/popover';
import ecommerceAction from '@iso/redux/ecommerce/actions';
import { stripTrailingSlash } from '@iso/lib/helpers/utility';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
import TopbarCartWrapper from './TopbarCart.style';
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { Tooltip, Button } from "antd";

//Configs
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import getInitData from '../../redux/ecommerce/config';
import enumerations from "@iso/config/enumerations";
import {WarningTwoTone, InfoCircleTwoTone
} from '@ant-design/icons';

var jwtDecode = require('jwt-decode');
const {
  initData,
  changeViewTopbarCart,
  changeProductQuantity,
} = ecommerceAction;
let cartItem = null;
export default function TopbarAddtoCart() {
  let { url } = useRouteMatch();
  url = stripTrailingSlash(url);
  const dispatch = useDispatch();
  const queryString = require('query-string');
  const location = useLocation();
  const [quantity, setQuantity] = useState();
  const [topbarItemCartLastTotal, setTopbarItemCartLastTotal] = useState(-1);
  const [totalPrice, setTotalPrice] = useState();
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const {
    productQuantity,
    products,
    loadingInitData,
    viewTopbarCart,
  } = useSelector(state => state.Ecommerce);
  
  function hide() {
    dispatch(changeViewTopbarCart(false));
  }
  function handleVisibleChange() {
    dispatch(changeViewTopbarCart(!viewTopbarCart));
  }

  //Get Cart
  async function getCartList() {
    let productInfo;
    let updateTopbarCartItemTotal = 0;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    let apiUrl='';
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser"); 
    if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includeUpdateDetails=true`;}
    else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includeUpdateDetails=true` }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(apiUrl, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        cartItem = data.items;
        setTotalPrice(data.totalCost);
        if (data !== 'Unauthorized1') {
          setQuantity(cartItem.length);
          getInitData();//Send Redux Data;        
          //Redux Data refresh
          if ((productQuantity === null) || (quantity !== productQuantity.length)) {
            let productQuantity = localStorage.getItem('cartProductQuantity');
            productQuantity = JSON.parse(productQuantity); dispatch(initData({ productQuantity }));
          }
          //Son redux datasının topbar veritabanı ile eşleştirilmesi
          let reduxCart = localStorage.getItem('cartProductQuantity');
          reduxCart = JSON.parse(reduxCart);

          updateTopbarCartItemTotal = _.reduce(reduxCart, (memo, item) => {
            return memo + item.quantity;
          }, 0);
        }
        else { setQuantity(0) }
      })
      .catch();

    setTopbarItemCartLastTotal(updateTopbarCartItemTotal)
    return productInfo;
  }
  function renderUpdateNotes(productItem){
    let message=null;
    if(productItem.updaterType==='Self'){
      message=  null;
    }
    else if(productItem.updaterType==='NonDealerUser')
    {
      message=  <Tooltip trigger={["click", "hover"]} title={
        <div>
         {productItem.updateNotes}                        
        </div>} style={{margin:'-12px'}} color={"#108ee9"}>
        <Button type='link' size="small"
          icon={<WarningTwoTone twoToneColor="#FF0000"/>} >
        </Button>
      </Tooltip>
    }
    else if(productItem.updaterType==='DealerUser'){
      message=   <Tooltip trigger={["click", "hover"]} title={
        <div>
          {productItem.updateNotes}                            
        </div>} style={{margin:'-12px'}} color={"#108ee9"}>
        <Button type='link' size="small"
          icon={<InfoCircleTwoTone twoToneColor="#FF0000"/>} >
        </Button>
      </Tooltip>
    }
    return message;
  }
  //Ürünler Listesinin render edilmesi SingleCart View js dosyasına yönlendiriliyor.
  function renderProducts() {

    //Topbar kontrolünün birden fazla çalışmasını engelleme miktar kontrolleri.

    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);

    const reduxCartItemTotal = _.reduce(productQuantity, (memo, item) => {
      return memo + item.quantity;
    }, 0);

    if (reduxCartItemTotal !== topbarItemCartLastTotal) {
      getCartList();
    }

    if (!quantity || quantity.length === 0) {
      return (
        <div className="isoNoItemMsg">
          <span>Sepetiniz Boş</span>
        </div>
      );
    }
    if (cartItem !== null) {
      return cartItem.map(product => {
        let productItem;
        let products;
        productItem = _.find(cartItem, function (item) { return item.itemCode === product.itemCode && item.isPartial === product.isPartial });
        if (productItem !== undefined) {
          let itemCode=productItem.itemCode;
          products=productItem;
          productItem = productItem.item;
          return (
            <TopbarCartWrapper className="isoCartItems">
             {productItem!==null ?
              <div className="isoItemImage">
                <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} />
              </div>:null}
              <div className="isoCartDetails">
                {productItem !== null ?
                  <h3>
                    <a href="#!">{productItem.itemCode} - {productItem.description}</a>
                    <React.Fragment>
                    {renderUpdateNotes(products)}
                   </React.Fragment>
                  </h3>: <a href="#!">{itemCode + ' ürün logo tarafında silinmiştir. Sistem yöneticinize başvurunuz.'}</a>}
                <p className="isoItemPriceQuantity">
                  {productItem !== null ?
                    <span>{numberFormat(productItem.listPrice)} TL</span> : null}
                    {productItem !== null ?
                  <span className="itemMultiplier">/</span>:null}
                  {productItem !== null ?
                    <span className="isoItemQuantity">{productItem.unit}</span> : null}
                  <span className="itemMultiplier"> </span>
                  {productItem !== null ?
                    <span className="isoItemQuantity"> {'('}{product.quantity} {product.isPartial === true ? 'Kutu' : 'Palet'}{')'}</span>
                    : null}                   
                </p>
              </div>
              <a
                className="isoItemRemove"
                onClick={() => {
                  cancelQuantity(product);
                }}

                href="#!"
              >
                <i className="ion-android-close" />
              </a>

            </TopbarCartWrapper>
          );
        }
      });
    }
  }

  //Ürün iptal etme işlemi
  function cancelQuantity(productItem) {
    const productIsPartialTitle = productItem.isPartial === true ? ' Parçalı' : ' Paletli';
    const newProductQuantity = [];
    _.each(productQuantity, (product, i) => {
      if ((product.itemCode !== productItem.itemCode || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, productItem.itemCode + productIsPartialTitle + ' Ürün sepetten çıkarıldı.');
    getCartList();
    if (location.pathname === "/checkout") { return window.location.reload(false); }
  }

  const content = (
    <TopbarDropdownWrapper className="topbarAddtoCart">
      <div className="isoDropdownHeader">
        <h3>
          <IntlMessages id="sidebar.cart" />
        </h3>
      </div>
      <div className="isoDropdownBody isoCartItemsWrapper">
        <Scrollbar style={{ height: 300 }}>{renderProducts()}</Scrollbar>
      </div>
      <div className="isoDropdownFooterLinks">
        <Link to={`${url}/cart`} onClick={hide}>
        <IntlMessages id="topbar.viewCart" />
        </Link>
        <h3>
          <IntlMessages id="topbar.totalPrice" />:{' '}
          <span>{numberFormat(totalPrice)} TL</span>
        </h3>
      </div>
    </TopbarDropdownWrapper>
  );
  return (
    <Popover
      content={content}
      trigger="click"
      visible={viewTopbarCart}
      onVisibleChange={handleVisibleChange}
      placement="bottomLeft"
    >
      <div className="isoIconWrapper">
        <i
          className="ion-android-cart"
          style={{ color: customizedTheme.textColor }}
        />
        {quantity === 0 ? (
          ''
        ) : (
            <span>{quantity}</span>
          )}
      </div>
    </Popover>
  );
}
