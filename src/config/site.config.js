const apiUrl = 'http://192.168.0.140/b2b/api/';
//const apiUrl = 'http://localhost:5000/api/';

export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `Karya SMD © ${new Date().getFullYear()}`,
  enableAnimatedRoute: false,
  api: {
    products: apiUrl + 'carts/products',                                      //Ürünler:POST
    productDetail: apiUrl + 'carts/products/',                                //Ürün detay bilgisi: GET
    productGroup: apiUrl + 'carts/lookup/product-categories',                 //Ürün Gruplerı:GET
    productType: apiUrl + 'carts/lookup/product-types',                       //Ürün Tipleri:GET
    productInfoRedux: apiUrl + 'carts/carts',                                 //Ürün Bilgileri Redux:POST
    productInfoDatabase: apiUrl + 'carts/carts/',                            //Ürün Bilgileri Database:GET
    dimensions: apiUrl + 'carts/lookup/product-dimensions',                   //Ebatlar:GET
    series:apiUrl + 'carts/lookup/product-series',                            //Seriler:GET
    colors: apiUrl + 'carts/lookup/product-colors',                           //Renkler:GET
    surfaces: apiUrl + 'carts/lookup/product-surfaces',                       //Yüzeyler:GET
    productionStatusData: apiUrl + 'carts/lookup/product-production-status',  //Üretim Durumları:GET
    orders: apiUrl + 'Customers/orders',                                      //Sipariş Üst Bilgi:POST
    orderDetail: apiUrl + 'Customers/orders/',                                //Sipariş Kalem Bilgi:POST
    distributions: apiUrl + 'customers/distributions',                        //Dağıtım:POST
    deliveries: apiUrl + 'Customers/deliveries',                              //Sevkiyat:POST
    cheques: apiUrl + 'customers/cheques',                                    //Çek-Senet:POST
    letters: apiUrl + 'customers/letters',                                    //Teminat Mektupları:POST
    accounts: apiUrl + 'customers/accounts',                                  //Cari Listesi:POST
    transactions: apiUrl + 'customers/transactions',                          //Cari Hareketler:POST
    accountsTree: apiUrl + 'Customers/accounts-tree',                         //Bayi kodları(Tree) listesi:GET
    chequeTypes: apiUrl + 'Customers/lookup/cheque-types',                    //Çek türleri listesi:GET
    warehouse: apiUrl + 'carts/warehouse-balances/',                          //Ambar bilgisi: GET
    users: apiUrl + 'Users/users',                                            //Kullanıcılar:POST
    authenticate: apiUrl + 'Users/authenticate',                              //Kullanıcı Doğrulama:POST
  },
  dateFormat: 'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
