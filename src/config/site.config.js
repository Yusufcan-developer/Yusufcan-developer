export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `KaryaSmd @ ${new Date().getFullYear()} , Inc`,
  enableAnimatedRoute: false,
  apiUrl: 'http://192.168.0.140/b2b/api/',
  localApiUrl: 'http://localhost:5000/api/',
  api: {
    products: 'http://192.168.0.140/b2b/api/carts/products',               //Ürünler:: POST
    orders: 'http://192.168.0.140/b2b/api/Customers/orders',               //Sipariş Üst Bilgi: POST
    orderDetail: 'http://192.168.0.140/b2b/api/Customers/orders/',               //Sipariş Kalem Bilgi: POST
    distributions: 'http://192.168.0.140/b2b/api/customers/distributions', //Dağıtım: POST
    deliveries: ' http://192.168.0.140/b2b/api/Customers/deliveries',       //Sevkiyat
    cheques: 'http://192.168.0.140/b2b/api/customers/cheques',             //Çek-Senet: POST
    letters: 'http://192.168.0.140/b2b/api/customers/letters',             //Teminat Mektupları: POST
    accounts: 'http://192.168.0.140/b2b/api/customers/accounts',           //Bayi Listesi: POST
    transactions: 'http://192.168.0.140/b2b/api/customers/transactions',   //Cari Hareketler: POST
    accountsTree:'http://192.168.0.140/b2b/api/Customers/accounts-tree',   //Bayi kodları(Tree) listesi :GET
  },
  dateFormat:'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
