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
      getAddresses: apiUrl + 'core/accounts/{dealerCodes}/addresses',
      postProductCategories: apiUrl + 'b2b/lookup/product-categories',
      postProductTypes: apiUrl + 'b2b/lookup/product-types',
      postSeries: apiUrl + 'b2b/lookup/product-series',
      postColors: apiUrl + 'b2b/lookup/product-colors',
      postSurfaces: apiUrl + 'b2b/lookup/product-surfaces',
      postProductionQualities: apiUrl + 'b2b/lookup/product-qualities',
      postproductionStatusData: apiUrl + 'b2b/lookup/product-production-status',
      postDimensions: apiUrl + 'b2b/lookup/product-dimensions',

    },

    carts: {
      postCart: apiUrl + 'b2b/carts',
      cartGetDefault: apiUrl + 'b2b/carts/default',
      getGetByAccountNo: apiUrl + 'b2b/carts/account/',
      cartGetAll: apiUrl + 'b2b/carts/all',
      deleteCart: apiUrl + 'b2b/carts/account/',
    },
    report: {
      postOrders: apiUrl + 'core/report/orders',
      getOrderLineItems: apiUrl + 'core/report/order-line-items',
      postDistributions: apiUrl + 'core/report/distributions',
      postDeliveries: apiUrl + 'core/report/deliveries',
      postCheques: apiUrl + 'core/report/cheques',
      postLetters: apiUrl + 'core/report/letters',
      postTransactions: apiUrl + 'core/report/transactions',
      postDBSTotal: apiUrl + 'core/report/dbs-totals',
      postCariTotal: apiUrl + 'core/report/account-balances',
      postRegionalGoals: apiUrl + 'core/report/regional-goals',
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
    image: {
      getProductsOfImages: apiUrl + 'images/products-for-images',
      getTypes: apiUrl + 'images/types',
      getProductImages: apiUrl + 'images/products/{productCode}/images',
      uploadImage: apiUrl + 'images/upload',
      deleteImage: apiUrl + 'images/delete/',
      updateProduct: apiUrl + 'images/products/update',
      updateImageInfo: apiUrl + 'images/update/info',
      updateOrder: apiUrl + 'images/update/order'
    },
    warehouse: apiUrl + 'b2b/warehouse-balances/',

  },
  dateFormat: 'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
