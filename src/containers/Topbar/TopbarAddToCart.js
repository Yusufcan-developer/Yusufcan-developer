//React
import React from 'react';
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

//Configs
import numberFormat from "@iso/config/numberFormat";
import _ from 'underscore';

const {
  initData,
  changeViewTopbarCart,
  changeProductQuantity,
} = ecommerceAction;
let totalPrice;
export default function TopbarAddtoCart() {
  let { url } = useRouteMatch();
  url = stripTrailingSlash(url);
  const dispatch = useDispatch();
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

  //Ürünler Listesinin render edilmesi SingleCart View js dosyasına yönlendiriliyor.
  function renderProducts() {
    totalPrice = 0;
    if (!productQuantity || productQuantity.length === 0) {
      return (
        <div className="isoNoItemMsg">
          <span>Sepetiniz Boş</span>
        </div>
      );
    }
    return productQuantity.map(product => {
      totalPrice += (product.quantity * products[product.itemCode].listPrice)*products[product.itemCode].m2Pallet
      return (
        <SingleCart
          key={product.itemCode}
          quantity={product.quantity}
          changeQuantity={changeQuantity}
          cancelQuantity={event => cancelQuantity(product)}
          productItem={products[product.itemCode]}
          isPartial={product.isPartial}
          {...products[product.itemCode]}
        />
      );
    });
  }

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
    debugger
    const newProductQuantity = [];
    _.each(productQuantity, (product, i) => {
      if ((product.itemCode === productItem.itemCode) && (product.isPartial === productItem.isPartial)) {       
      }
      else{ newProductQuantity.push(product);}
    });
    dispatch(changeProductQuantity(newProductQuantity));    
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
          <span>{numberFormat(totalPrice)}  TL</span>
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
