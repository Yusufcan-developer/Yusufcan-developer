//React
import React, { useState, useEffect } from "react";
import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';

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

//Configs
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import siteConfig from "@iso/config/site.config";
import getInitData from '../../redux/ecommerce/config';
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
    if (activeUser !== null) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}`, requestOptions)
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
        }
        else { setQuantity(0) }
      })
      .catch();
    return productInfo;
  }

  //Ürünler Listesinin render edilmesi SingleCart View js dosyasına yönlendiriliyor.
  function renderProducts() {
    getCartList();
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
        productItem = _.find(cartItem, function (item) { return item.itemCode === product.itemCode && item.isPartial === product.isPartial });
        if (productItem !== undefined) {
          productItem = productItem.item;
          return (
            <TopbarCartWrapper className="isoCartItems">
              <div className="isoItemImage">
                <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} />
              </div>
              <div className="isoCartDetails">
                <h3>
                  <a href="#!">{productItem.itemCode} - {productItem.description}</a>
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
        }
      });
    }
  }

  //Ürün iptal etme işlemi
  function cancelQuantity(productItem) {
    const newProductQuantity = [];
    _.each(productQuantity, (product, i) => {
      if ((product.itemCode !== productItem.itemCode || product.isPartial !== productItem.isPartial)) {
        newProductQuantity.push(product);
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
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
