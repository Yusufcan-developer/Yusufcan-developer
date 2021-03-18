//React
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';

//Components
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import Box from '@iso/components/utility/box';
import { CheckoutContents } from './Checkout.styles';
import Button from '@iso/components/uielements/button';
import SingleOrderInfo from './SingleOrder';
import { OrderTable } from './Checkout.styles';
import InputBox from './InputBox';
import CascaderBox from './CascaderBox';
import IntlMessages from '@iso/components/utility/intlMessages';
import { BillingFormWrapper } from './Checkout.styles';
import siteConfig from "@iso/config/site.config";
import { Col, Modal, Table, Input, Space, message, Alert, Select } from "antd";
import Form from "@iso/components/uielements/form";

//Fetch
import { useGetCartCheckOut } from "@iso/lib/hooks/fetchData/useGetCartCheckOut";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Styles
import { PlusOutlined } from '@ant-design/icons';
import {
  Fieldset,
} from '../../FirestoreCRUD/Article/Article.styles';

//Other Library
import _ from 'underscore';
import numberFormat from "@iso/config/numberFormat";
import 'moment/locale/tr'
import moment from 'moment';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";
import logMessage from '@iso/config/logMessage';

moment.locale('tr')
var jwtDecode = require('jwt-decode');

let createOrderNo = 'xxxx';
export default function () {
  const provinceData = ['İzmir', 'İstanbul'];
  const cityData = {
    İzmir: ['Konak', 'Balçova', 'Karşıyaka'],
    İstanbul: ['Bakırköy', 'Kadıköy', 'Tuzla'],
  };

  const cityArray = [

    {
      label: 'ADANA',
      value: "ADANA"
    },
    {
      label: 'ADIYAMAN',
      value:
        "ADIYAMAN"
    },
    {
      label: 'AFYONKARAHİSAR',
      value:
        "AFYONKARAHİSAR"
    },
    {
      label: 'AĞRI',
      value:
        "AĞRI"
    },
    {
      label: 'AMASYA',
      value:
        "AMASYA"
    },
    {
      label: 'ANKARA',
      value: "ANKARA"
    },
    {
      label: 'ANTALYA',
      value: "ANTALYA"
    },
    {
      label: 'ARTVİN',
      value: "ARTVİN"
    },
    {
      label: 'AYDIN',
      value: "AYDIN"
    },
    {
      label: 'BALIKESİR',
      value: "BALIKESİR"
    },
    {
      label: 'BİLECİK',
      value: "BİLECİK"
    },
    {
      label: 'BİNGÖL',
      value: "BİNGÖL"
    }, {
      label: 'BİTLİS',
      value: "BİTLİS"
    },
    {
      label: 'BOLU',
      value: "BOLU"
    }, {
      label: 'BURDUR',
      value: "BURDUR"
    },
    {
      label: 'BURSA',
      value: "BURSA"
    }, {
      label: 'ÇANAKKALE',
      value: "ÇANAKKALE"
    },
    {
      label: 'ÇANKIRI',
      value: "ÇANKIRI"
    }, {
      label: 'ÇORUM',
      value: "ÇORUM"
    },
    {
      label: 'DENİZLİ',
      value: "DENİZLİ"
    }, {
      label: 'DİYARBAKIR',
      value: "DİYARBAKIR"
    },
    {
      label: 'EDİRNE',
      value: "EDİRNE"
    }, {
      label: 'ELAZIĞ',
      value: "ELAZIĞ"
    },
    {
      label: 'ERZİNCAN',
      value: "ERZİNCAN"
    }, {
      label: 'ERZURUM',
      value: "ERZURUM"
    },
    {
      label: 'ESKİŞEHİR',
      value: "ESKİŞEHİR"
    }, {
      label: 'GAZİANTEP',
      value: "GAZİANTEP"
    },
    {
      label: 'GİRESUN',
      value: "GİRESUN"
    }, {
      label: 'GÜMÜŞHANE',
      value: "GÜMÜŞHANE"
    },
    {
      label: 'HAKKARİ',
      value: "HAKKARİ"
    }, {
      label: 'HATAY',
      value: "HATAY"
    },
    {
      label: 'ISPARTA',
      value: "ISPARTA"
    }, {
      label: 'MERSİN',
      value: "MERSİN"
    },
    {
      label: 'İSTANBUL',
      value: "İSTANBUL",
      children: [
        {
          value: 'Bakırköy',
          label: 'Bakırköy',
          children: [
            {
              value: 'Ataköy',
              label: 'Ataköy',
              code: 453400,
            },
          ],
        },
      ],
    }, {
      label: 'İZMİR',
      value: "İZMİR",
      children: [
        {
          value: 'Konak',
          label: 'Konak',
          children: [
            {
              value: 'Eşrefpaşa',
              label: 'Eşrefpaşa',
              code: 752100,
            },
          ],
        },
      ],
    },
    {
      label: 'KARS',
      value: "KARS"
    }, {
      label: 'KASTAMONU',
      value: "KASTAMONU"
    },
    {
      label: 'KAYSERİ',
      value: "KAYSERİ"
    }, {
      label: 'KIRKLARELİ',
      value: "KIRKLARELİ"
    },
    {
      label: 'KIRŞEHİR',
      value: "KIRŞEHİR"
    }, {
      label: 'KOCAELİ',
      value: "KOCAELİ"
    },
    {
      label: 'KONYA',
      value: "KONYA"
    }, {
      label: 'KÜTAHYA',
      value: "KÜTAHYA"
    },
    {
      label: 'MALATYA',
      value: "MALATYA"
    }, {
      label: 'MANİSA',
      value: "MANİSA"
    },
    {
      label: 'KAHRAMANMARAŞ',
      value: "KAHRAMANMARAŞ"
    }, {
      label: 'MARDİN',
      value: "MARDİN"
    },
    {
      label: 'MUĞLA',
      value: "MUĞLA"
    }, {
      label: 'MUŞ',
      value: "MUŞ"
    },
    {
      label: 'NEVŞEHİR',
      value: "NEVŞEHİR"
    }, {
      label: 'NİĞDE',
      value: "NİĞDE"
    },
    {
      label: 'ORDU',
      value: "ORDU"
    }, {
      label: 'RİZE',
      value: "RİZE"
    },
    {
      label: 'SAKARYA',
      value: "SAKARYA"
    }, {
      label: 'SAMSUN',
      value: "SAMSUN"
    },
    {
      label: 'SİİRT',
      value: "SİİRT"
    }, {
      label: 'SİNOP',
      value: "SİNOP"
    },
    {
      label: 'SİVAS',
      value: "SİVAS"
    }, {
      label: 'TEKİRDAĞ',
      value: "TEKİRDAĞ"
    },
    {
      label: 'TOKAT',
      value: "TOKAT"
    }, {
      label: 'TRABZON',
      value: "TRABZON"
    },
    {
      label: 'TUNCELİ',
      value: "TUNCELİ"
    }, {
      label: 'ŞANLIURFA',
      value: "ŞANLIURFA"
    },
    {
      label: 'UŞAK',
      value: "UŞAK"
    }, {
      label: 'VAN',
      value: "VAN"
    },
    {
      label: 'YOZGAT',
      value: "YOZGAT"
    }, {
      label: 'ZONGULDAK',
      value: "ZONGULDAK"
    },
    {
      label: 'AKSARAY',
      value: "AKSARAY"
    }, {
      label: 'BAYBURT',
      value: "BAYBURT"
    },
    {
      label: 'KARAMAN',
      value: "KARAMAN"
    }, {
      label: 'KIRIKKALE',
      value: "KIRIKKALE"
    },
    {
      label: 'BATMAN',
      value: "BATMAN"
    }, {
      label: 'ŞIRNAK',
      value: "ŞIRNAK"
    },
    {
      label: 'BARTIN',
      value: "BARTIN"
    }, {
      label: 'ARDAHAN',
      value: "ARDAHAN"
    },
    {
      label: 'IĞDIR',
      value: "IĞDIR"
    }, {
      label: 'YALOVA',
      value: "YALOVA"
    },
    {
      label: 'KARABüK',
      value: "KARABüK"
    }, {
      label: 'KİLİS',
      value: "KİLİS"
    },
    {
      label: 'OSMANİYE',
      value: "OSMANİYE"
    }, {
      label: 'DÜZCE',
      value: "DÜZCE"
    },

  ]
  
  let options = [
    {
      value: 'Adana',
      label: 'Adana',
      children: [
        {
          value: 'Konak',
          label: 'Konak',
          children: [
            {
              value: 'Eşrefpaşa',
              label: 'Eşrefpaşa',
              code: 752100,
            },
          ],
        },
      ],
    },
    {
      value: 'İzmir',
      label: 'İzmir',
      children: [
        {
          value: 'Konak',
          label: 'Konak',
          children: [
            {
              value: 'Eşrefpaşa',
              label: 'Eşrefpaşa',
              code: 752100,
            },
          ],
        },
      ],
    },
    {
      value: 'İstanbul',
      label: 'İstanbul',
      children: [
        {
          value: 'Bakırköy',
          label: 'Bakırköy',
          children: [
            {
              value: 'Ataköy',
              label: 'Ataköy',
              code: 453400,
            },
          ],
        },
      ],
    },
  ];

  document.title = "Sipariş Onayı - Seramiksan B2B";
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState();
  const [town, setTown] = useState();
  const [visible, setVisible] = useState();
  const [createOrderQuestionVisible, setCreateOrderQuestionVisible] = useState();
  const [form] = Form.useForm();
  const [hasOrderSavePermission, setHasOrderSavePermission] = useState();
  const [user, setUser] = useState();
  const [adress, setAdress] = useState();
  const [addressCode, setAddressCode] = useState();
  const [adressItem, setAdressItem] = useState();
  const [addressFilterData, setAddressFilterData] = useState();
  const [loadingButton, setLoadingButton] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [createAddress, setCreateAddress] = useState(false);
  const [successOrderSave, setSuccessOrderSave] = useState(false);
  const [addressTitle, setAddressTitle] = useState();
  const [address1, setAddress1] = useState();
  const [address2, setAddress2] = useState();
  const [itemsWaitingManufacturing, setItemsWaitingManufacturing] = useState();
  const [cities, setCities] = useState(cityData[provinceData[0]]);
  const [secondCity, setSecondCity] = useState(
    cityData[provinceData[0]][0]
  );
  const history = useHistory();

  const [data, changeCart] = useGetCartCheckOut();
  const token = jwtDecode(localStorage.getItem("id_token"));
  const activeUser = localStorage.getItem("activeUser");
  const { Option } = Select;
  let account = token.uname;



  let createAddressButtonVisible = true;
  if (activeUser != undefined) { account = activeUser }
  //Adres bilgileri için token değerinin alınıp user Id bölümü çözümleniyor.
  useEffect(() => {
    const token = jwtDecode(localStorage.getItem("id_token"));
    getInitData(token.uid);
    postSaveLog(enumerations.LogSource.Order, enumerations.LogTypes.Browse, logMessage.Order.browse);
  }, []);

  //Get Products
  function renderProducts() {
    if (data !== undefined) {
      debugger
      const productList = _.filter(data.items, function (item) { return item.orderAmount > 0; });
      return productList.map(product => {
        return (
          <SingleOrderInfo
            key={product.objectID}
            productItem={product}
          />
        );
      });
    }
  }
  //Change First Name 
  function saveOrderQuestionModal() {
    if (adressItem) {
      setCreateOrderQuestionVisible(true);
    } else { message.warning('Lütfen sevk adresi seçiniz!') }
  };

  function saveOrder() {
    setCreateOrderQuestionVisible(false);
    postSaveOrder();
  }

  //Change Phone 
  const onChangePhone = e => {
    setPhone(e.target.value);
  };

  //Change City 
  const onChangeCity = e => {
    setCity(e.target.value);
  };

  function handleCancelOrderSave() {
    history.push(`${'/products/categories'}`)
    window.location.reload(false);
    setVisible(true);
    setCreateOrderQuestionVisible(false);
    setSuccessOrderSave(false);
  }

  //Adres Modal iptal işlemi
  function handleCancel() {
    setVisible(false);
    setCreateOrderQuestionVisible(false);
    setSuccessOrderSave(false);
  };

  //Adres Modal açma
  function handleShowModal() {
    setVisible(true);
    postSaveLog(enumerations.LogSource.Address, enumerations.LogTypes.Browse, logMessage.Address.browse);
  };

  //Yeni Adres Oluşturma Bölümü
  const onChangeAddressTitle = e => {
    setAddressTitle(e.target.value);
  }

  const onChangeAddress1 = e => {
    setAddress1(e.target.value);
  }

  const onChangeAddress2 = e => {
    setAddress2(e.target.value);
  }

  const onChangeAddressCity = e => {
    setCity(e.target.value);
  }

  const onChangeAddressTown = e => {
    setTown(e.target.value);
  }

  function onCreateAddress() {
    setCity();
    setTown();
    setAddressTitle();
    setAddress1();
    setAddress2();
    setPhone();
    setCreateAddress(true);
  }

  //Search Adress Filter
  function addressFilterSearch(value) {
    if (value) {
      const filterTable = adress.filter(o =>
        Object.keys(o).some(k =>
          String(o[k])
            .toLocaleLowerCase('tr')
            .includes(value.toLocaleLowerCase('tr'))
        )
      );
      setAddressFilterData(filterTable);
    }
    else { setAddressFilterData('') }
  };

  function orderPreview() {
    history.push(`${'/reports/orders'}/?keyword=${createOrderNo}&pgsize=10&pgindex=1`)
    window.location.reload(false);
  }

  //get user by id
  async function getByUserId(userId) {
    let userData;
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.security.getUser}${userId}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setUser(data);
        userData = data;
      })
      .catch();
    return userData;
  }

  //get adress
  async function getAdress() {

    const token = jwtDecode(localStorage.getItem("id_token"));
    const dealerCodes = token.dcode;
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(siteConfig.api.lookup.getAddresses.replace('{dealerCodes}', dealerCodes), requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setAdress(data);
        }
        else { setAdress([]) }
      })
      .catch();
  }

  //get has save order permission
  async function getHasSaveOrderPermission() {
    let userData;
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.carts.getHasSaveOrderPermission}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setHasOrderSavePermission(data);
      })
      .catch();
    return userData;
  }

  //get adress and user id function
  async function getInitData(userId) {
    await getHasSaveOrderPermission();
    await getByUserId(userId);
    await getAdress();
  }

  //Sipariş temizleme işlemi
  async function clearOrder() {
    setLoadingButton(true);
    let sendDatabaseProductList
    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);
    sendDatabaseProductList = _.each(productQuantity, (item) => {
      item['orderAmount'] = 0;
      item['amount'] = item['quantity'];
      // delete item['quantity'];
    });
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let account = token.uname;
    if (activeUser != undefined) { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.carts.postCart, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          if (data !== 'Unauthorized') {
            productQuantity = [];
            // Verileri Redux'a gönderme işlemi  
            let sendReduxProductList = _.each(data.items, (item) => {
              item['quantity'] = item['amount'];
            });
            if (sendReduxProductList) {
              sendReduxProductList.forEach(product => {
                productQuantity.push({
                  itemCode: product.itemCode,
                  quantity: product.quantity,
                  orderAmount: 0,
                  isPartial: product.isPartial
                });
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            changeCart(true);
          }
        }
        else {

        }
      })
      .catch();
    setLoadingButton(false);
  }

  //post address
  async function postSaveAddress() {
    const token = jwtDecode(localStorage.getItem("id_token"));
    const dealerCodes = token.dcode;
    if ((addressTitle === undefined) || (address1 === undefined) || (city === undefined) || (town === undefined) || (address2 === undefined)) { return message.error('Lütfen zorunlu alanları giriniz.'); }
    setConfirmLoading(true);
    const reqBody = { "id": 0, "addressCode": '', "dealerId": 0, "dealerCode": dealerCodes, "addressTitle": addressTitle, "address1": address1, "city": city, "town": town, "countryCode": 'TR', "countryName": 'Türkiye', 'phone': phone }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.carts.postSaveAddress, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setAdressItem(data.addressTitle); setPhone(data.phone); setCity(data.city); setAddressCode(data.addressCode);
        setVisible(false);
        setCreateAddress(false);
        message.success('Adres bilgisi başarılı bir şekilde kayıt edilmiştir.');
        getAdress();
        postSaveLog(enumerations.LogSource.Address, enumerations.LogTypes.Add, data.addressTitle + logMessage.Address.saveAddress);
      })
      .catch(setConfirmLoading(false));
    setConfirmLoading(false);
  }

  //Save Order
  async function postSaveOrder() {
    const token = jwtDecode(localStorage.getItem("id_token"));
    const dealerCodes = token.dcode;
    setConfirmLoading(true);
    const reqBody = {}
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    let newSaveOrderUrl = siteConfig.api.carts.postSaveOrder.replace('{accountNo}', dealerCodes);
    newSaveOrderUrl = newSaveOrderUrl.replace('{addressCode}', addressCode);
    await fetch(`${newSaveOrderUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data !== undefined) {
          if (data.isSuccessful) {
            setItemsWaitingManufacturing(data.itemsWaitingManufacturing);
            createOrderNo = data.orderNo; setSuccessOrderSave(true);
            postSaveLog(enumerations.LogSource.Order, enumerations.LogTypes.Add, data.orderNo + logMessage.Order.saveOrderSuccess);
          } else {
            message.warning(data.message, 10);
            postSaveLog(enumerations.LogSource.Order, enumerations.LogTypes.Add, logMessage.Order.saveOrderError + data.message);
          }
        }
      })
      .catch();
    setConfirmLoading(false);
  }

  let columns = [
    {
      title: "Adres Kodu",
      dataIndex: "addressCode",
      key: "addressCode",
    },
    {
      title: "Adres Başlığı",
      dataIndex: "addressTitle",
      key: "addressTitle",
    },
    {
      title: "Adres 1",
      dataIndex: "address1",
      key: "address1",
    },
    {
      title: "Adres 2",
      dataIndex: "address2",
      key: "address2",
    },
    {
      title: "Şehir",
      dataIndex: "city",
      key: "city",
    },
    {
      title: 'İşlem',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: () => <a>Seç</a>,
    },
  ];

  if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
    createAddressButtonVisible = false;
  }
  const handleProvinceChange = (value) => {
    setCities(cityData[value]);
    setSecondCity(cityData[value][0]);
  };

  const onSecondCityChange = (value) => {
    setSecondCity(value);
  };

  function handleAreaClick(e, label, option) {
    e.stopPropagation();
    console.log('clicked', label, option);
  }

  const displayRender = (labels, selectedOptions) =>
    labels.map((label, i) => {
      const option = selectedOptions[i];
      if (i === labels.length - 1) {
        return (
          <span key={option.value}>
            {label} (<a onClick={e => handleAreaClick(e, label, option)}>{option.code}</a>)
          </span>
        );
      }
      return <span key={option.value}>{label} / </span>;
    });
  return (
    <CheckoutContents>
      <LayoutWrapper className="isoCheckoutPage">
        <Box>
          <div className="isoBillingAddressWrapper">
            {hasOrderSavePermission !== true ? <Alert
              message="Uyarı"
              description="Sipariş oluşturma yetkiniz bulunmamaktadır."
              type="warning"
              showIcon style={{ width: '500px', margin: '15px auto' }}
            /> : null}
            <h3 className="isoSectionTitle">Sipariş Detayı</h3>
            <div className="isoBillingSection">
              {/* Müşteri Bilgileri */}
              <BillingFormWrapper className="isoBillingForm">
                <Modal
                  width={1250}
                  visible={visible}
                  title={"Sevk Adresleri"}
                  cancelText="İptal"
                  maskClosable={false}
                  onCancel={handleCancel}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{
                      modifier: 'public',
                    }}
                  >
                    <Col span={8} offset={16} align="right" >
                      <Button type="primary" size="small" style={{ marginBottom: '5px' }}
                        icon={<PlusOutlined />} disabled={createAddressButtonVisible} onClick={onCreateAddress} >
                        {<IntlMessages id="forms.button.createAddress" />}
                      </Button>
                    </Col>
                    <Input.Search
                      style={{ margin: "0 0 10px 0" }}
                      placeholder="Arama yapabilirsiniz"
                      enterButton
                      onSearch={addressFilterSearch}
                    />
                    <Table
                      columns={columns}
                      dataSource={addressFilterData == null || addressFilterData == '' ? adress : addressFilterData}
                      onRow={(record, rowIndex) => {
                        return {
                          onClick: event => { setAddressCode(record.addressCode); setCountry(record.countryCode + '-' + record.countryName); setAdressItem(record.addressCode + '-' + record.addressTitle); setPhone(record.phone); setCity(record.city); setAddress1(record.address1); setAddress2(record.address2); setVisible(false) },
                        };
                      }}
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                      size="medium"
                      bordered={false}
                    />
                  </Form>
                </Modal>
                {/* Yeni Adres oluşturma işlemi */}
                <Modal
                  visible={createAddress}
                  onClose={() => setCreateAddress(false)}
                  title={'Yeni Adres Oluşturma'}
                  okText={'Kaydet'}
                  confirmLoading={confirmLoading}
                  onOk={() => postSaveAddress()}
                  onCancel={() => setCreateAddress(false)}

                >
                  <Form>
                    <Fieldset className="isoInputFieldset">
                      <InputBox
                        label="Adres Başlığı (Firma Unvanı / İlçe /İl)"
                        placeholder="Firma Unvanı / İlçe /İl"
                        rows={5}
                        value={addressTitle}
                        onChange={onChangeAddressTitle}
                        important
                      />
                    </Fieldset>

                    <Fieldset>
                      <InputBox
                        label="Adres 1"
                        rows={5}
                        placeholder="Adres 1 Giriniz"
                        value={address1}
                        onChange={onChangeAddress1}
                        important
                      />
                    </Fieldset>

                    <Fieldset>
                      <InputBox
                        label="İlgili (İlgili kişi / Cep Telefonu)"
                        placeholder="İlgili kişi / Cep Telefonu"
                        value={address2}
                        onChange={onChangeAddress2}
                        important
                      />
                    </Fieldset>
                    <Fieldset>
                      <InputBox
                        label="Telefon"
                        placeholder="Telefon Giriniz"
                        value={phone}
                        onChange={onChangePhone}
                      />
                    </Fieldset>
                    <Fieldset>
                      <CascaderBox
                        label={'İl / İlçe / Köy'}
                        placeholder={'İl/İlçe/Köy seçiniz'}
                        options={cityArray}
                        displayRender={displayRender}
                        style={{ width: '100%' }}
                      />
                    </Fieldset>
                  </Form>
                </Modal>
                <Modal
                  title={'Siparişiniz Başarıyla Oluşturuldu'}
                  visible={successOrderSave}
                  okText={'Siparişi Görüntüle'}
                  onOk={orderPreview}
                  onCancel={handleCancelOrderSave}
                >
                  <React.Fragment>
                    <p>Siparişiniz <strong>{createOrderNo}</strong> numarasıyla kaydedildi. Siparişlerinizi Raporlar / Siparişler menüsünden görüntüleyebilirsiniz.</p>
                    {
                      itemsWaitingManufacturing && itemsWaitingManufacturing.length > 0 ? (
                        <React.Fragment>
                          <p style={{ margin: '10px 0 10px 0' }}>Aşağıda listelenen ürün(ler) üretimden sonra sevkedilecektir:</p>
                          <ul style={{ listStylePosition: 'inside', listStyleType: 'initial' }}>
                            {itemsWaitingManufacturing.map(item => { return (<li><strong>{item.itemCode}</strong> - {item.description}</li>) })}
                          </ul>
                        </React.Fragment>
                      ) : null
                    }
                  </React.Fragment>

                </Modal>
                <Modal
                  visible={createOrderQuestionVisible}
                  title={"Sipariş Onayı"}
                  okText="Tamam"
                  cancelText="İptal"
                  maskClosable={false}
                  onCancel={handleCancel}
                  onOk={saveOrder}
                >
                  <p>Sipariş kaydettikten sonra değişiklik yapılamayacaktır. Kaydettikten sonra değişiklik/iptal İçin Seramiksan Satış Destek birimine başvurabilirsiniz.</p>
                  <p style={{ marginTop: '20px' }}><b>Önemli Not:</b> Sevkiyat, formdaki bilgilere uygun ödeme şirketimize ulaştığında ve risk limiti dahilinde yapılacaktır.</p>
                  <p style={{ marginTop: '20px' }}>SAYIN YETKİLİ SATICIMIZ, SİPARİŞ ETTİĞİNİZ, STOKLARIMIZDA MEVCUT OLAN MALZEMELERİ 20 GÜN İÇERİSİNDE TESLİM ALMANIZ GEREKMEKTEDİR. AKSİ TAKDİRDE BEDELİ TARAFINIZCA ÖDEMEK KAYDI İLE GÜNCEL NAKLİYE FİYATLARINDAN SEVK EDİLECEKTİR.</p>
                  <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{
                      modifier: 'public',
                    }}
                  >
                  </Form>
                </Modal>

                <label>{<IntlMessages id="page.addressTitle" />}  {<span className="asterisk">*</span>}</label>
                <div className="isoInputFieldset">
                  <Input.Search
                    value={adressItem}
                    important
                    onSearch={handleShowModal}
                    disabled={!hasOrderSavePermission}
                    placeholder={'Sevk adresi seçiniz'}
                    onClick={handleShowModal}
                  />

                </div>

                {adressItem === undefined ? null : <React.Fragment>
                  <div className="isoInputFieldset">
                    <InputBox label={<IntlMessages id="checkout.billingform.address1" />}
                      onChange={onChangeAddress1}
                      value={address1}
                      disabled
                    />
                  </div>
                  <div className="isoInputFieldset">
                    <InputBox label={<IntlMessages id="checkout.billingform.address2" />}
                      onChange={onChangeAddress2}
                      value={address2}
                      disabled
                    />
                  </div>

                  <div className="isoInputFieldset">

                    <InputBox label={<IntlMessages id="checkout.billingform.mobile" />}
                      onChange={onChangePhone}
                      value={phone}
                      disabled
                    />
                    <InputBox label={<IntlMessages id="checkout.billingform.country" />}
                      value={country}
                      disabled
                    />
                  </div>
                  <div className="isoInputFieldset">
                    <InputBox label={<IntlMessages id="checkout.billingform.city" />}
                      onChange={event => onChangeCity(event)}
                      value={city}
                      disabled
                    />
                    <InputBox label={<IntlMessages id="checkout.billingform.town" />}
                      onChange={event => onChangeAddressTown(event)}
                      value={town}
                      disabled
                    />
                  </div>
                </React.Fragment>}
                {/* Ödeme özet bilgileri ve sipariş oluşturma */}
              </BillingFormWrapper>
              <OrderTable className="isoOrderInfo">
                <div className="isoOrderTable">
                  <div className="isoOrderTableHead">
                    <span className="tableHead">Ürün</span>
                    <span className="tableHead">Toplam</span>
                  </div>

                  <div className="isoOrderTableBody">{renderProducts()}</div>
                  <div className="isoOrderTableFooter">
                    <span>Toplam</span>
                    <span>{data != undefined ? (numberFormat(data.orderCost)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>KDV</span>
                    <span>{data != undefined ? (numberFormat(data.orderVat)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>Genel Toplam</span>
                    <span>{data != undefined ? (numberFormat(data.orderOverallCost)) : (0)} TL</span>
                  </div>
                  <Space size={50}>
                    <Button disabled={!hasOrderSavePermission} type="primary" loading={confirmLoading} className="isoOrderBtn" onClick={() => saveOrderQuestionModal()} >
                      Sipariş Oluştur
        </Button>
                    {/* <Button disabled={!hasOrderSavePermission} type="primary" loading={loadingButton} onClick={clearOrder} className="isoOrderBtn" >
                      Sipariş Temizle
        </Button> */}
                  </Space>
                </div>
              </OrderTable>
            </div>
          </div>
        </Box>
      </LayoutWrapper>
    </CheckoutContents>
  );
}
