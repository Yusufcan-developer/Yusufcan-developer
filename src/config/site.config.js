const apiUrl='http://192.168.0.140/b2b/api/';
const localApiUrl= 'http://localhost:5000/api/';

export default {
  siteName: 'SERAMİKSAN B2B',
  siteIcon: 'ion-flash',
  footerText: `Karya SMD © ${new Date().getFullYear()}`,
  enableAnimatedRoute: false,
  api: {
    products: apiUrl + 'carts/products',                  //Ürünler:: POST
    productGroup: apiUrl+'carts/lookup/product-categories',//Ürün Gruplerı :POST
    dimensions:apiUrl+'carts/lookup/product-dimensions',     //Boyutar       :POST
    colors:apiUrl+'carts/lookup/product-colors',      //Renkler       
    surfaces:apiUrl+'carts/lookup/product-surfaces',      //Yüzeyler  
    productionStatusData:apiUrl+'carts/lookup/product-production-status',      //Üretim Durumları   
    orders: apiUrl + 'Customers/orders',                  //Sipariş Üst Bilgi: POST
    orderDetail: apiUrl + 'Customers/orders/',            //Sipariş Kalem Bilgi: POST
    distributions: apiUrl + 'customers/distributions',    //Dağıtım: POST
    deliveries: apiUrl + 'Customers/deliveries',         //Sevkiyat
    cheques: apiUrl + 'customers/cheques',               //Çek-Senet: POST
    letters: apiUrl + 'customers/letters',              //Teminat Mektupları: POST
    accounts: apiUrl + 'customers/accounts',            //Cari Listesi: POST
    transactions: apiUrl + 'customers/transactions',    //Cari Hareketler: POST
    accountsTree: apiUrl + 'Customers/accounts-tree',   //Bayi kodları(Tree) listesi: GET
    users: apiUrl + 'Users/users',                     //Kullanıcılar: POST
  },
  dateFormat:'DD-MM-YYYY',
  google: {
    analyticsKey: 'UA-xxxxxxxxx-1',
  },
  dashboard: '/dashboard',
};
