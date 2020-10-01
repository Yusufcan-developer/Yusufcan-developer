//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string'
//Components
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import Box from '@iso/components/utility/box';
import BillingForm from './BillingForm';
import OrderInfo from './OrderInfo';
import { CheckoutContents } from './Checkout.styles';
import { useSelector } from 'react-redux';
import Button from '@iso/components/uielements/button';
import SingleOrderInfo from './SingleOrder';
import { OrderTable } from './Checkout.styles';
import Select, { SelectOption } from '@iso/components/uielements/select';
import InputBox from './InputBox';
import IntlMessages from '@iso/components/utility/intlMessages';
import { BillingFormWrapper, InputBoxWrapper } from './Checkout.styles';
import { useGetCustomerInfo } from "@iso/lib/hooks/fetchData/useGetCustomerInfo";
import siteConfig from "@iso/config/site.config";
import { Col, Row, Modal, Table, Input, Space, message } from "antd";
import Form from "@iso/components/uielements/form";
import Textarea from '@iso/components/uielements/input';

//Fetch
import { useGetCartCheckOut } from "@iso/lib/hooks/fetchData/useGetCartCheckOut";

//Styles
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionBtn,
  Fieldset,
  Label,
  TitleWrapper,
  ButtonHolders,
  ActionWrapper,
  ComponentTitle,
  TableWrapper,
  StatusTag,
} from '../../FirestoreCRUD/Article/Article.styles';

//Other Library
import _ from 'underscore';
import numberFormat from "@iso/config/numberFormat";
import 'moment/locale/tr'
import moment from 'moment';
moment.locale('tr')
var jwtDecode = require('jwt-decode');

const Option = SelectOption;
let createOrderNo='xxxx';
export default function () {
  const [orderCost, setOrderCost] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState();
  const [town, setTown] = useState();
  const [visible, setVisible] = useState();
  const [fromDate, setFromDate] =useState(moment(new Date()));
  const [toDate, setToDate] = useState(moment(new Date()));
  const [form] = Form.useForm();
  const [user, setUser] = useState();
  const [adress, setAdress] = useState();
  const [addressCode, setAddressCode] = useState();
  const [adressItem, setAdressItem] = useState();
  const [addressFilterData, setAddressFilterData] = useState();
  const [loadingButton, setLoadingButton] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [createAddress, setCreateAddress] = useState(false);
  const [successOrderSave,setSuccessOrderSave]=useState(false);
  const history = useHistory();

  const [addressTitle, setAddressTitle] = useState();
  const [address1, setAddress1] = useState();
  const [address2, setAddress2] = useState();

  const { confirm } = Modal;

  const [data, changeCart] = useGetCartCheckOut();

  const token = jwtDecode(localStorage.getItem("id_token"));
  const activeUser = localStorage.getItem("activeUser")
  let account = token.uname;
  if (activeUser != undefined) { account = activeUser }

  //Adres bilgileri için token değerinin alınıp user Id bölümü çözümleniyor.
  useEffect(() => {
    const token = jwtDecode(localStorage.getItem("id_token"));
    getInitData(token.uid);
  }, []);

  //Get Products
  function renderProducts() {
    if (data !== undefined) {
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
  function saveOrder(event) {
    if(adressItem){
      postSaveOrder();
    }else{message.warning('Lütfen sevk adresi seçiniz!')}
  };

  //Change Phone 
  const onChangePhone = e => {
    setPhone(e.target.value);
  };

  //Change City 
  const onChangeCity = e => {
    setCity(e.target.value);
  };

  //Adres Modal iptal işlemi
  function handleCancel() {
    setVisible(false);
    setSuccessOrderSave(false);
  };

  //Adres Modal açma
  function handleShowModal() {
    setVisible(true);
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
        if (!response.ok) { return response.statusText; }
        return response.json();
      })
      .then(data => {
        setUser(data);
        userData = data;
      })
      .catch();
    return userData;
  }

  //get adress
  async function getAdress(dealerCodes) {
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
        if (!response.ok) { return response.statusText; }
        return response.json();
      })
      .then(data => {
        setAdress(data);
      })
      .catch();
    return user;
  }

  //get adress and user id function
  async function getInitData(userId) {
    const userData = await getByUserId(userId);
    const adress = await getAdress(account);
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
        switch (response.status) {
          case 201:
            return response.json();
            break;
          case 400:
            return response.json();
            break;
          case 401:
            // Go to login
            break;
          case 404:
            // Show 404 page
            break;
          case 500:
            // Serveur Error redirect to 500
            break;
          default:
            // Unknow Error
            break;
        }
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
    if ((addressTitle === undefined) || (address1 === undefined)) { return message.error('Lütfen zorunlu alanları giriniz.'); }
    setConfirmLoading(true);
    const reqBody = { "id": 0, "addressCode": '', "dealerId": 0, "dealerCode": account, "addressTitle": addressTitle, "address1": address1, "address1": address2, "city": city, "town": town, "countryCode": 'TR', "countryName": 'Türkiye', 'phone': phone }
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
        if (!response.ok) (message.error('Veritabanı bağlantısı kurulumadı lütfen sistem yöneticinize başvurunuz.'));
        return response.json();
      })
      .then(data => {
        setAdressItem(data.addressTitle); setPhone(data.phone); setCity(data.city); setAddressCode(data.addressCode);
        setVisible(false);
        setCreateAddress(false);
        message.success('Adres bilgisi başarılı bir şekilde kayıt edilmiştir.');
        getAdress(account);
      })
      .catch();
    setConfirmLoading(false);
  }
  //Save Order
  async function postSaveOrder() {
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
    let newSaveOrderUrl = siteConfig.api.carts.postSaveOrder.replace('{accountNo}', account);
    newSaveOrderUrl = newSaveOrderUrl.replace('{addressCode}', addressCode);
      await fetch(`${newSaveOrderUrl}`, requestOptions)
      .then(response => {
        if (!response.ok) (console.log('xxxx re',response));
        return response.json();
      })
      .then(data => {
     if(data.isSuccess){ createOrderNo=data.orderNo;setSuccessOrderSave(true);
     }else{
        message.warning('Sipariş oluşturma işlemi başarısızdır lütfen bilgilerinizi kontrol ediniz.');
     }
      })
      .catch();
    setConfirmLoading(false);
  }
  function orderPreview() {
    history.push(`${'/reports/orders'}/?keyword=${createOrderNo}&pgsize=10&pgindex=1`)
  }
  // function successSaveOrderModal(orderNo='xxxx') {
  //   Modal.success({
  //     content: orderNo+ 'numaralı sipariş başarılı bir şekilde oluşturulmuştur.',
  //     okText:'Tamam',
  //     onOk:history.push(`${'/reports/orders'}/?from=${fromDate.format('YYYY-MM-DD')}&to=${toDate.format('YYYY-MM-DD')}&pgsize=10&pgindex=1`),
  //   });
  // }
  return (
    <CheckoutContents>
      <LayoutWrapper className="isoCheckoutPage">
        <Box>
          <div className="isoBillingAddressWrapper">
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
                        icon={<PlusOutlined />} onClick={onCreateAddress}>
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
                          onClick: event => { setAddressCode(record.addressCode); setCountry(record.countryCode+'-'+record.countryName); setAdressItem(record.addressCode+'-'+record.addressTitle); setPhone(record.phone); setCity(record.city); setAddress1(record.address1); setAddress2(record.address2); setVisible(false) },
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
                      <InputBox
                        label="Şehir"
                        placeholder="Şehir Giriniz"
                        value={city}
                        onChange={onChangeAddressCity}
                      />
                    </Fieldset>
                    <Fieldset>
                      <InputBox
                        label="İlçe"
                        placeholder="İlçe Giriniz"
                        value={town}
                        onChange={onChangeAddressTown}
                      />
                    </Fieldset>
                  </Form>
                </Modal>               
                <Modal
          title={'Siparişiniz Başarıyla Oluşturuldu'}
          visible={successOrderSave}
          okText={'Siparişi Görüntüle'}
          onOk={orderPreview}
          onCancel={handleCancel}
        >
          <p>Siparişiniz <strong>{createOrderNo}</strong> numarasıyla kaydedildi. Siparişlerinizi Raporlar / Geçmiş Siparişler menüsünden görüntüleyebilirsiniz.</p>
        </Modal>
                <label>{<IntlMessages id="page.addressTitle" />}  { <span className="asterisk">*</span> }</label>
                <div className="isoInputFieldset">
                  <Input.Search
                    value={adressItem}
                    important
                    onSearch={handleShowModal}
                  />
                </div>
                <div className="isoInputFieldset">
                  <InputBox label={<IntlMessages id="checkout.billingform.address1" />}
                    onChange={onChangeAddress1}
                    value={address1}
                    readOnly                   
                  />
                </div>
                <div className="isoInputFieldset">
                  <InputBox label={<IntlMessages id="checkout.billingform.address2" />}
                    onChange={onChangeAddress2}
                    value={address2}
                    readOnly
                  />
                </div>

                <div className="isoInputFieldset">

                  <InputBox label={<IntlMessages id="checkout.billingform.mobile" />}
                    onChange={onChangePhone}
                    value={phone}
                    readOnly
                  />
                  <InputBox label={<IntlMessages id="checkout.billingform.country" />}
                    value={country}
                    readOnly
                    />
                </div>
                <div className="isoInputFieldset">
                  <InputBox label={<IntlMessages id="checkout.billingform.city" />}
                    onChange={event => onChangeCity(event)}
                    value={city}
                    readOnly
                    />
                  <InputBox label={<IntlMessages id="checkout.billingform.town" />}
                    onChange={event => onChangeAddressTown(event)}
                    value={town}
                    readOnly
                    />
                </div>
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
                    <span>Toplam KDV</span>
                    <span>{data != undefined ? (numberFormat(data.orderVat)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>Genel Toplam</span>
                    <span>{data != undefined ? (numberFormat(data.orderOverallCost)) : (0)} TL</span>
                  </div>
                  <Space size={50}>
                    <Button type="primary" loading={confirmLoading} className="isoOrderBtn" onClick={() => saveOrder()} >
                      Sipariş Oluştur
        </Button>
                    <Button type="primary" loading={loadingButton} onClick={clearOrder} className="isoOrderBtn" >
                      Sipariş Temizle
        </Button>
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
