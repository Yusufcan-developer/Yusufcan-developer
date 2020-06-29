const actions = {
  INIT_DATA: 'ECOMMERCE_INIT_DATA',
  INIT_DATA_SAGA: 'ECOMMERCE_INIT_DATA_SAGA',
  UPDATE_DATA: 'ECOMMERCE_UPDATE_DATA',
  UPDATE_DATA_SAGA: 'ECOMMERCE_UPDATE_DATA_SAGA',
  CHANGE_VIEW: 'ECOMMERCE_CHANGE_VIEW',
  VIEW_TOPBAR_CART: 'ECOMMERCE_VIEW_TOPBAR_CART',
  initData: () => ({ type: actions.INIT_DATA_SAGA }),
  changeView: view => ({
    type: actions.CHANGE_VIEW,
    view,
  }),
  changeViewTopbarCart: viewTopbarCart => {
    return {
      type: actions.VIEW_TOPBAR_CART,
      viewTopbarCart,
    };
  },
  changeProductQuantity: productQuantity => {
    return (dispatch, getState) => {
      const { products } = getState().Ecommerce;
      console.log('xxxx aktarım',products)
      console.log('xxxx m',productQuantity)
      dispatch({
        type: actions.UPDATE_DATA_SAGA,
        products,
        productQuantity,
      });
    };
  },
  addToCart: (product,quantity) => {
    return (dispatch, getState) => {
      const { products, productQuantity } = getState().Ecommerce;
      const itemCode = product.itemCode;
      productQuantity.push({ itemCode, quantity: quantity });
      products[itemCode] = product;
      dispatch({
        type: actions.UPDATE_DATA_SAGA,
        products,
        productQuantity,
      });
    };
  },
};
export default actions;
