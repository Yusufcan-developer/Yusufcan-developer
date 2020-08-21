//React
import React, { useState, useEffect } from "react";

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
import { Col, Row, Modal, Table, Input } from "antd";
import Form from "@iso/components/uielements/form";

//Other Library
var jwtDecode = require('jwt-decode');
const Option = SelectOption;

export default function () {

  const [userName, setUserName] = useState();
  const [lastName, setLastName] = useState();
  const [companyName, setCompanyName] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState();
  const [visible, setVisible] = useState();
  const [form] = Form.useForm();
  const [user, setUser] = useState();
  const [adress, setAdress] = useState();
  const [adressItem, setAdressItem] = useState();
  const [addressFilterData,setAddressFilterData]=useState();

  let totalPrice;
  const { productQuantity, products } = useSelector(state => state.Ecommerce);

  //Adres bilgileri için token değerinin alınıp user Id bölümü çözümleniyor.
  useEffect(() => {
    const token = jwtDecode(localStorage.getItem("id_token"));
    getInitData(token.uid);
  }, []);

  //Get Products
  function renderProducts() {
    totalPrice = 0;
    return productQuantity.map(product => {
      totalPrice += product.quantity * products[product.itemCode].listPrice;
      return (
        <SingleOrderInfo
          key={product.objectID}
          quantity={product.quantity}
          productItem={products[product.itemCode]}
          {...products[product.itemCode]}
        />
      );
    });
  }
  //Change First Name 
  function saveOrder(event) {

  };

  //Change Company Name
  const onChangeCompanyName = e => {
    setCompanyName(e.target.value);
  }

  //Change Company Name 
  const onChangeEmail = e => {
    setEmail(e.target.value);
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
  };

  //Adres Modal açma
  function handleShowModal() {
    setVisible(true);
  };
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
    else{setAddressFilterData('')}
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
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
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
    const adress = await getAdress(userData.dealerCodes[0]);
  }
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
                    <Input.Search
                      style={{ margin: "0 0 10px 0" }}
                      placeholder="Arama yapabilirsiniz"
                      enterButton
                      onSearch={addressFilterSearch}
                    />
                    <Table
                      columns={columns}
                      dataSource={addressFilterData == null || addressFilterData=='' ? adress : addressFilterData}
                      // dataSource={adress}
                      onRow={(record, rowIndex) => {
                        return {
                          onClick: event => { setAdressItem(record.addressTitle); setPhone(record.phone); setCity(record.city); setVisible(false) },
                        };
                      }}
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                      size="medium"
                      bordered={false}
                    />
                  </Form>
                </Modal>
                <div className="isoInputFieldset horizontal">
                  <InputBox
                    label={<IntlMessages id="checkout.billingform.address" />}
                    disabled={true}
                    value={adressItem}
                    important
                  />
                  <Button type="primary" onClick={handleShowModal}>
                    {<IntlMessages id="Seç" />}
                  </Button>
                </div>

                <div className="isoInputFieldset">
                  <InputBox label={<IntlMessages id="checkout.billingform.company" />}
                    onChange={onChangeCompanyName}
                    value={companyName}
                    important
                  />
                </div>

                <div className="isoInputFieldset">
                  <InputBox
                    label={<IntlMessages id="checkout.billingform.email" />}
                    onChange={onChangeEmail}
                    value={email}
                    important
                  />
                  <InputBox label={<IntlMessages id="checkout.billingform.mobile" />}
                    onChange={onChangePhone}
                    value={phone}
                    important />
                </div>

                <div className="isoInputFieldset">
                  <InputBoxWrapper className="isoInputBox">
                    <label>{<IntlMessages id="checkout.billingform.country" />}</label>
                    <Select size="large" defaultValue="turkey" disabled={true}>
                      <Option value="turkey">Türkiye</Option>
                      <Option value="argentina">Argentina</Option>
                      <Option value="australia">Australia</Option>
                      <Option value="brazil">Brazil</Option>
                      <Option value="france">France</Option>
                      <Option value="germany">Germany</Option>
                      <Option value="southafrica">South Africa</Option>
                      <Option value="spain">Spain</Option>
                      <Option value="unitedstate">United State</Option>
                      <Option value="unitedkingdom">United Kingdom</Option>
                    </Select>
                  </InputBoxWrapper>

                  <InputBox label={<IntlMessages id="checkout.billingform.city" />}
                    onChange={event => onChangeCity(event)}
                    value={city}
                    important />
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
                    <span>Toplam</span>
                    <span>{totalPrice.toFixed(2)} TL</span>
                  </div>

                  <Button type="primary" className="isoOrderBtn" >
                    Sipariş Oluştur
        </Button>
                </div>
              </OrderTable>
            </div>
          </div>
        </Box>
      </LayoutWrapper>
    </CheckoutContents>
  );
}
