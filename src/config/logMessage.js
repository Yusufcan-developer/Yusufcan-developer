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
        // addUser:'Yeni kullanıcı ekleme',
    },
    MainForm: {
        browse: 'DBS ve Cari toplamlar raporu sayfası ziyaret edildi.',
        // search: 'DBS ve Cari toplamlar raporu yeni arama',
    },
    Reports: {
        Order: {
            browse: 'Sipariş raporu sayfası ziyaret edildi.',
            // search: 'Sipariş raporu yeni arama',
            exportExcel: 'Sipariş raporu excele aktarıldı.',
        },
        Deliveries:
        {
            browse: 'Sevkiyat raporu sayfası ziyaret edildi.',
            // search: 'Sevkiyat raporu yeni arama',
            exportExcel: 'Sevkiyat raporu excele aktarıldı.'
        },
        TransactionAccount: {
            browse: 'Cari hareketler raporu sayfası ziyaret edildi.',
            // search: 'Cari hareketler raporu yeni arama',
            exportExcel: 'Cari hareketler raporu excele aktarıldı.'
        },
        Cheques:
        {
            browse: 'Çek ve Senet raporu raporu sayfası ziyaret edildi.',
            // search: 'Çek ve Senet raporu yeni arama',
            exportExcel: 'Çek ve Senet raporu excele aktarıldı.'
        },
        Letters: 
        {
            browse: 'Teminat mektubu raporu sayfası ziyaret edildi.',
            // search: 'Teminat raporu yeni arama',
            exportExcel: 'Teminat mektubu raporu excele aktarıldı.'
        },
        Accounts:
        {
            browse:'Cari kayıtlar raporu sayfası ziyaret edildi.',
            // search: 'Cari kayıtlar raporu yeni arama',
            exportExcel: 'Cari kayıtlar raporu excele aktarıldı.'
        },
        Distributions:
        {
            browse:'Dağıtım listesi raporu sayfası ziyaret edildi.',
            // search: 'Dağıtım listesi raporu yeni arama',
            exportExcel: 'Dağıtım listesi raporu excele aktarıldı.'
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
    },
    Demand:
    {
        browse:'Talep listesi',
        save:' talebi başarılı şekilde oluşturulmuştur. ',
        error:'talebi oluşturulamamıştır. ',
        updateError:'talebin durum güncellemesi başarısızdır. ',
        updateSuccess:'talebin durum güncellemesi başarılıdır. '
    },
    Rule:
    {
        save:'kural başarılı bir şekilde oluşturulmuştur. ',
        error:'kural oluşturma işlemi başarısızdır. ',
        delete:' nolu kural silme işlemi başarısızdır. ',
        successDelete:' nolu kural silme işlemi başarılıdır. ',
    }
};
