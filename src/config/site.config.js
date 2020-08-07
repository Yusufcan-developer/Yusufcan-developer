const apiUrl = 'http://192.168.0.140/b2b/api/';
//const apiUrl = 'http://localhost:5000/api/';

export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `Karya SMD © ${new Date().getFullYear()}`,
  enableAnimatedRoute: false,
  nullOrEmptySearchItem: '(YOK)',
  api: {
    products: apiUrl + 'b2b/products',                                      //Ürünler:POST
    productDetail: apiUrl + 'b2b/products/',                                //Ürün detay bilgisi: GET
    productGroup: apiUrl + 'b2b/lookup/product-categories',                 //Ürün Gruplerı:GET
    productType: apiUrl + 'b2b/lookup/product-types',                       //Ürün Tipleri:GET
    cartSave: apiUrl + 'b2b/carts',                                         //Ürün Bilgileri Redux:POST
    cartGetDefault: apiUrl + 'b2b/carts/default',                           //Ürün Bilgileri Database:GET
    cartGetByAccountNo: apiUrl + 'b2b/carts/account/',                      //Ürün Bilgileri Database:GET
    dimensions: apiUrl + 'b2b/lookup/product-dimensions',                   //Ebatlar:GET
    series: apiUrl + 'b2b/lookup/product-series',                           //Seriler:GET
    colors: apiUrl + 'b2b/lookup/product-colors',                           //Renkler:GET
    surfaces: apiUrl + 'b2b/lookup/product-surfaces',                       //Yüzeyler:GET
    productionQuality: apiUrl + 'b2b/lookup/product-qualities',             //Ürün Kalitesi:GET
    productionStatusData: apiUrl + 'b2b/lookup/product-production-status',  //Üretim Durumları:GET
    warehouse: apiUrl + 'b2b/warehouse-balances/',                           //Ambar bilgisi: GET


    orders: apiUrl + 'core/report/orders',                                      //Sipariş Üst Bilgi:POST
    orderDetail: apiUrl + 'core/report/order-line-items',                       //Sipariş Kalem Bilgi:GET
    distributions: apiUrl + 'core/report/distributions',                        //Dağıtım:POST
    deliveries: apiUrl + 'core/report/deliveries',                              //Sevkiyat:POST
    cheques: apiUrl + 'core/report/cheques',                                    //Çek-Senet:POST
    letters: apiUrl + 'core/report/letters',                                    //Teminat Mektupları:POST
    accounts: apiUrl + 'core/accounts',                                          //Cari Listesi:POST
    transactions: apiUrl + 'core/report/transactions',                          //Cari Hareketler:POST
    accountsTree: apiUrl + 'core/accounts-tree',                                 //Bayi kodları(Tree) listesi:GET
    chequeTypes: apiUrl + 'core/lookup/cheque-types',                             //Çek türleri listesi:GET
    users: apiUrl + 'security/users/search',                                     //Kullanıcılar:POST
    lookUpFieldCode: apiUrl + 'core/lookup/field-codes',                         //Lookup FieldCodes:GET
    lookUpRegionCode: apiUrl + 'core/lookup/region-codes',                       //Lookup RegionCodes:GET
    lookUpDealerCode: apiUrl + 'core/lookup/dealer-codes',                       //Lookup DealerCodes:GET
    roles: apiUrl + 'security/roles',                                            //Roles:GET
    getUser: apiUrl + 'security/users/',                                         //Kullanıcı Bilgisi:GET
    user: apiUrl + 'security/users',                                             //Kullanıcı:POST
    authenticate: apiUrl + 'security/authenticate',                              //Kullanıcı Doğrulama:POST
    changePassword: apiUrl + 'security/change-password',                         //Kullanıcı Doğrulama:POST
    deleteUser: apiUrl + 'security/users/',                                      //Kullanıcı Bilgisi:DELETE
    getAdress:apiUrl ,                      //Adres Bilgisi:GET
    //Kayıtlı sepetlerin listelenmesi
    cartGetAll: apiUrl + 'b2b/carts/all',                                  //Tüm sepetlerin listelenmesi
  },
  dateFormat: 'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
