const apiUrl = 'http://192.168.0.140/b2b/api/';
// const apiUrl = 'http://localhost:5000/api/';

export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `Karya SMD © ${new Date().getFullYear()}`,
  enableAnimatedRoute: false,
  nullOrEmptySearchItem: '(YOK)',
  api: {
    products: {
      postProducts: apiUrl + 'b2b/products',
      getProductDetail: apiUrl + 'b2b/products/',
    },
    lookup: {
      getProductCategories: apiUrl + 'b2b/lookup/product-categories',
      getProductTypes: apiUrl + 'b2b/lookup/product-types',
      getSeries: apiUrl + 'b2b/lookup/product-series',
      getColors: apiUrl + 'b2b/lookup/product-colors',
      getSurfaces: apiUrl + 'b2b/lookup/product-surfaces',
      getProductionQualities: apiUrl + 'b2b/lookup/product-qualities',
      productionStatusData: apiUrl + 'b2b/lookup/product-production-status',
      getDimensions: apiUrl + 'b2b/lookup/product-dimensions',
      getChequeTypes: apiUrl + 'core/lookup/cheque-types',
      getFieldCodes: apiUrl + 'core/lookup/field-codes',
      getRegionCodes: apiUrl + 'core/lookup/region-codes',
      getDealerCodes: apiUrl + 'core/lookup/dealer-codes',
      getAddresses: apiUrl + 'core/accounts/{dealerCodes}/addresses'
    },

    carts: {
      postCart: apiUrl + 'b2b/carts',
      cartGetDefault: apiUrl + 'b2b/carts/default',
      getGetByAccountNo: apiUrl + 'b2b/carts/account/',
      //Kayıtlı sepetlerin listelenmesi
      cartGetAll: apiUrl + 'b2b/carts/all',                                  //Tüm sepetlerin listelenmesi
    },
    report: {
      postOrders: apiUrl + 'core/report/orders',
      getOrderLineItems: apiUrl + 'core/report/order-line-items',
      postDistributions: apiUrl + 'core/report/distributions',
      postDeliveries: apiUrl + 'core/report/deliveries',
      postCheques: apiUrl + 'core/report/cheques',
      postLetters: apiUrl + 'core/report/letters',
      postTransactions: apiUrl + 'core/report/transactions',
    },
    users: {
      postUsers: apiUrl + 'security/users/search',
      postUser: apiUrl + 'security/users',
      deleteUser: apiUrl + 'security/users/',
    },
    security: {
      postAccounts: apiUrl + 'core/accounts',
      getAccountsTree: apiUrl + 'core/accounts-tree',
      getRoles: apiUrl + 'security/roles',
      getUser: apiUrl + 'security/users/',
      postAuthenticate: apiUrl + 'security/authenticate',
      postChangePassword: apiUrl + 'security/change-password',
    },
    warehouse: apiUrl + 'b2b/warehouse-balances/',

  },
  dateFormat: 'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
