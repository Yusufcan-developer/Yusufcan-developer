const apiUrl='http://192.168.0.140/b2b/api/';
const localApiUrl= 'http://localhost:5000/api/';

export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `KaryaSmd @ ${new Date().getFullYear()} , Inc`,
  enableAnimatedRoute: false,
  api: {
    products:     apiUrl+'carts/products',               //Ürünler:: POST
    orders:       apiUrl+'Customers/orders',               //Sipariş Üst Bilgi: POST
    orderDetail:  apiUrl+'Customers/orders/',               //Sipariş Kalem Bilgi: POST
    distributions:apiUrl+'customers/distributions', //Dağıtım: POST
    deliveries:   apiUrl+'Customers/deliveries',       //Sevkiyat
    cheques:      apiUrl+'customers/cheques',             //Çek-Senet: POST
    letters:      apiUrl+'customers/letters',             //Teminat Mektupları: POST
    accounts:     apiUrl+'customers/accounts',           //Bayi Listesi: POST
    transactions: apiUrl+'customers/transactions',   //Cari Hareketler: POST
    accountsTree: apiUrl+'Customers/accounts-tree',   //Bayi kodları(Tree) listesi :GET
  },
  dateFormat:'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
