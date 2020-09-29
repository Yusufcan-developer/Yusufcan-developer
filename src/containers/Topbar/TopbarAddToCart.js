//React
import React, { useState, useEffect } from "react";
import { Link, useRouteMatch } from 'react-router-dom';

//Redux
import { useDispatch, useSelector } from 'react-redux';

//Component
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import Popover from '@iso/components/uielements/popover';
import SingleCart from '@iso/components/Cart/SingleCartModal';
import ecommerceAction from '@iso/redux/ecommerce/actions';
import { stripTrailingSlash } from '@iso/lib/helpers/utility';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

import TopbarCartWrapper from './TopbarCart.style';
//Fetch
import { useCartListData } from "@iso/lib/hooks/fetchData/useGetCartList";

//Configs
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';

//Configs
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');
const {
  initData,
  changeViewTopbarCart,
  changeProductQuantity,
} = ecommerceAction;
let cartItem=null;
export default function TopbarAddtoCart() {
  let { url } = useRouteMatch();
  url = stripTrailingSlash(url);
  const dispatch = useDispatch();
  const [totalPrice,setTotalPrice]=useState();
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const {
    productQuantity,
    products,
    loadingInitData,
    viewTopbarCart,
  } = useSelector(state => state.Ecommerce);

  let quantity;
  if (productQuantity) { quantity = productQuantity.length }
  else { quantity = 0 }
  function hide() {
    dispatch(changeViewTopbarCart(false));
  }
  function handleVisibleChange() {
    dispatch(changeViewTopbarCart(!viewTopbarCart));
  }
  React.useEffect(() => {
    if (!loadingInitData) {
      dispatch(initData());
    }
  }, [dispatch, loadingInitData]);
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
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (activeUser != undefined) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}`, requestOptions)
      .then(response => {
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        cartItem=data.items;
        setTotalPrice(data.totalCost);
      })
      .catch();
    return productInfo;
  }

  //Ürünler Listesinin render edilmesi SingleCart View js dosyasına yönlendiriliyor.
  function renderProducts() {
    getCartList();
    if (!productQuantity || productQuantity.length === 0) {
      return (
        <div className="isoNoItemMsg">
          <span>Sepetiniz Boş</span>
        </div>
      );
    }
    if(cartItem!==null){
    return productQuantity.map(product => {
      let productItem ;
      productItem = _.find(cartItem, function(item){ return item.itemCode ===product.itemCode &&item.isPartial===product.isPartial });
      if(productItem!==undefined){
      productItem=productItem.item;
      return (
        <TopbarCartWrapper className="isoCartItems">
      <div className="isoItemImage">
        <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} />
      </div>
      <div className="isoCartDetails">
        <h3>
          <a href="#!">{productItem.description}</a>
        </h3>
        <p className="isoItemPriceQuantity">
          <span>{numberFormat(productItem.listPrice)} TL</span>
          <span className="itemMultiplier">/</span>
          <span className="isoItemQuantity">{productItem.unit}</span>
          <span className="itemMultiplier"> </span>
          <span className="isoItemQuantity">{'('}{product.quantity} {product.isPartial === true ? 'Kutu' : 'Palet'}{')'}</span>
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
    }});
  }}

  //Miktar değişikliği
  function changeQuantity(objectID, quantity,isPartial) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== objectID) {
        newProductQuantity.push(product);
      } else {
        newProductQuantity.push({
          objectID,
          quantity,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
  }

  //Ürün iptal etme işlemi
  function cancelQuantity(productItem) {
    const newProductQuantity = [];
    _.each(productQuantity, (product, i) => {
      if ((product.itemCode !== productItem.itemCode  || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    getCartList();
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
        { quantity === 0 ? (
          ''
        ) : (
            <span>{quantity}</span>
          )}
      </div>
    </Popover>
  );
}
