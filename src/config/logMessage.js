import { CloudDownloadOutlined } from "@ant-design/icons";

export default {
    User: {
        login: 'Kullanıcı giriş yaptı',
        logout: 'Kullanıcı çıkış yaptı',
        browse:'Kullanıcılar listesi',
        search:'Kullanıclar listesi yeni arama',
        deleteError:' kullanıcı silme işlemi başarısızdır.',
        deleteSuccess:' Kullanıcı başarıyla silinmiştir.',
        changePasswordError:' Parola değiştirme işlemi başarısızdır.',
        changePasswordSuccess:' Parola başarıyla değiştirilmiştir.',
        saveUserError:' Kullanıcı kaydedilememiştir',
        saveUserSuccess:' Kullanıcı başarıyla kaydedilmiştir',
        addUser:'Yeni kullanıcı ekleme',
    },
    MainForm: {
        browse: 'DBS ve Cari toplamlar raporu listeleme',
        search: 'DBS ve Cari toplamlar raporu yeni arama',
    },
    Reports: {
        Order: {
            browse: 'Sipariş raporu listeleme',
            search: 'Sipariş raporu yeni arama',
            exportExcel: 'Sipariş raporu excel oluşturma',
        },
        Deliveries:
        {
            browse: 'Sevkiyat raporu listeleme',
            search: 'Sevkiyat raporu yeni arama',
            exportExcel: 'Sevkiyat raporu excel oluşturma'
        },
        TransactionAccount: {
            browse: 'Cari hareketler raporu listeleme',
            search: 'Cari hareketler raporu yeni arama',
            exportExcel: 'Cari hareketler raporu excel oluşturma'
        },
        Cheques:
        {
            browse: 'Çek ve Senet raporu listeleme',
            search: 'Çek ve Senet raporu yeni arama',
            exportExcel: 'Çek ve Senet raporu excel oluşturma'
        },
        Letters: 
        {
            browse: 'Teminat mektubu raporu listeleme',
            search: 'Teminat raporu yeni arama',
            exportExcel: 'Teminat mektubu raporu excel oluşturma'
        },
        Accounts:
        {
            browse:'Cari kayıtlar raporu listeleme',
            search: 'Cari kayıtlar raporu yeni arama',
            exportExcel: 'Cari kayıtlar raporu excel oluşturma'
        },
        Distributions:
        {
            browse:'Dağıtım listesi raporu listeleme',
            search: 'Dağıtım listesi raporu yeni arama',
            exportExcel: 'Dağıtım listesi raporu excel oluşturma'
        }
    },
    Carts:{
        browse:'Bayi sepet listeleme',
        search:'Bayi sepet listeleme yeni arama',
        selectedCart:' Bayi sepet oluşturulması için seçildi',
        addProduct:' Ürün sepete eklendi. Miktar ',
        removeProduct:' Ürün sepetten çıkarıldı.',
        decreaseProduct:' Ürünün miktarı azaltıldı. Miktar ',
        increaseProduct:' Ürünün miktarı arttırıldı.Miktar ',
        productList:'Sepet ürün listesi',
        deleteCart:'Sepet başarıyla silinmiştir.'
    },
    Products:{
        browse:'Ürün listeleme',

    },
    ProductDetail:
    {
        browse:'Ürün detayı',
    },
    Order:
    {
        browse:'Sipariş Oluşturma',
        saveOrderSuccess:' numaralı sipariş başarılı şekilde oluşturulmuştur.',
        saveOrderError:'Sipariş oluşturma işlemi başarısızdır.' + 'Hatanın sebep(leri) ',
    },
    Address:
    {
        browse:'Adres listesi',
        saveAddress:' adres başarılı şekilde oluşturulmuştur.',
    }
};
