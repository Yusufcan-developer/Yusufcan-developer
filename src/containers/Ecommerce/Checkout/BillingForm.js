import React, { useState, useEffect } from "react";
// import Input from '@iso/components/uielements/input';
import Select, { SelectOption } from '@iso/components/uielements/select';
import InputBox from './InputBox';
import IntlMessages from '@iso/components/utility/intlMessages';
import { BillingFormWrapper, InputBoxWrapper } from './Checkout.styles';
import { useGetCustomerInfo } from "@iso/lib/hooks/fetchData/useGetCustomerInfo";
import siteConfig from "@iso/config/site.config";
import { Col, Button, Row, Modal, Table, Input } from "antd";
import Form from "@iso/components/uielements/form";
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

  useEffect(() => {
    const token = jwtDecode(localStorage.getItem("id_token"));
    getInitData(token.uid);
  }, []);

  //Change Company Name
  const onChangeCompanyName = e => {
    setCompanyName(e.target.value);
    localStorage.setItem("companyName", e.target.value);
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

  function handleCancel() {
    setVisible(false);
  };
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
  async function getAdress(dealerCodes) {
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.getAdress}core/accounts/${dealerCodes}/addresses`, requestOptions)
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
  async function getInitData(userId) {
    const userData = await getByUserId(userId);
    const adress = await getAdress(userData.dealerCodes[0]);

  }
  return (

    <BillingFormWrapper className="isoBillingForm">
      <Modal
        width={1250}
        visible={visible}
        title={"Sevk Adresleri"}
        okText="Seç"
        cancelText="İptal"
        // maskClosable={false}
        onCancel={handleCancel}
        onOk={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: 'public',
          }}
        >
          <Table
            columns={columns}
            dataSource={adress}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { setAdressItem(record.addressTitle);setPhone(record.phone);setCity(record.city); setVisible(false) },
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

     
    </BillingFormWrapper>
  );
}
