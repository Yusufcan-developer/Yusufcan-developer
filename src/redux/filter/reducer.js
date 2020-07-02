import clone from 'clone';
import actions from './actions';

const initState = {
  loadingInitData: false,
  // view: 'gridView',
  // viewTopbarCart: false,
  // productQuantity: [],
  filters: [],
};
export default (state = initState, action) => {
  switch (action.type) {
    case actions.INIT_DATA:
      return {
        ...state,
        loadingInitData: true,
        filters: action.payload.filters,
        // products: action.payload.products,
      };
    // case actions.CHANGE_VIEW:
    //   return {
    //     ...state,
    //     view: action.view,
    //   };
    // case actions.VIEW_TOPBAR_CART:
    //   return {
    //     ...state,
    //     viewTopbarCart: action.viewTopbarCart,
    //   };
    case actions.UPDATE_DATA:
      return {
        ...state,
        filters: clone(action.filters),
        // productQuantity: clone(action.productQuantity),
      };
    default:
      return state;
  }
};
