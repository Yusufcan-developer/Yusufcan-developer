const actions = {
  INIT_DATA: 'FILTER_INIT_DATA',
  UPDATE_DATA: 'FILTER_UPDATE_DATA',
  CHANGE_VIEW: 'FILTER_CHANGE_VIEW',
  initData: () => ({ type: actions.INIT_DATA_SAGA }),
  changeView: view => ({
    type: actions.CHANGE_VIEW,
    view,
  }),
  changeFilter: productQuantity => {
    return (dispatch, getState) => {
      const { filters } = getState().Filters;
      console.log('xxxx aktarım filter',filters)
      dispatch({
        type: actions.UPDATE_DATA,
        filters,
        // productQuantity,
      });
    };
  },
  addToFilter: (filterType,value) => {
    return (dispatch, getState) => {
      const { filters } = getState().Filters;
      filters.push({ filterType, filterValue: value });
      dispatch({
        type: actions.UPDATE_DATA,
        filters,
        // productQuantity,
      });
    };
  },
};
export default actions;
