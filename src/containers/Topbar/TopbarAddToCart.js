import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import IntlMessages from '@iso/components/utility/intlMessages';
import Scrollbar from '@iso/components/utility/customScrollBar';
import Popover from '@iso/components/uielements/popover';
import SingleCart from '@iso/components/Cart/SingleCartModal';
import ecommerceAction from '@iso/redux/ecommerce/actions';
import { stripTrailingSlash } from '@iso/lib/helpers/utility';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

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
      totalPrice += product.quantity * products[product.itemCode].listPrice;
      return (
        <SingleCart
          key={product.itemCode}
          quantity={product.quantity}
          name={'testler'}
          changeQuantity={changeQuantity}
          cancelQuantity={event => cancelQuantity(product)}
          productItem={products[product.itemCode]}
          {...products[product.itemCode]}
        />
      );
    });
  }
  function changeQuantity(objectID, quantity) {
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
  function cancelQuantity(productItem) {
    const newProductQuantity = [];
    productQuantity.forEach(product => {
      if (product.itemCode !== productItem.itemCode) {
        newProductQuantity.push(product);
      }
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
          <span>{totalPrice.toFixed(2)}  TL</span>
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
        {productQuantity.length === 0 ? (
          ''
        ) : (
            <span>{productQuantity.length}</span>
          )}
      </div>
    </Popover>
  );
}
