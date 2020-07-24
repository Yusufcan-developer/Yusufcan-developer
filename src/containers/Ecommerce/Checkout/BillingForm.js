import React, { useState, useEffect } from "react";
import Input from '@iso/components/uielements/input';
import Select, { SelectOption } from '@iso/components/uielements/select';
import InputBox from './InputBox';
import IntlMessages from '@iso/components/utility/intlMessages';
import { BillingFormWrapper, InputBoxWrapper } from './Checkout.styles';
import { useGetCustomerInfo } from "@iso/lib/hooks/fetchData/useGetCustomerInfo";
import siteConfig from "@iso/config/site.config";

const Option = SelectOption;

export default function () {
  const [userName, setUserName] = useState();
  const [lastName, setLastName] = useState();
  const [companyName, setCompanyName] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState();
  const [adress, setAdress] = useState();

  //Customer Get Info
   let [getUserName, getLastName, getCompanyName, getEmail, getPhone, getCountry, getCity, getAdress] = useGetCustomerInfo(`${siteConfig.api.productDetail}${'productId'}`);
 
  //Change First Name 
  const  onChangeFirstName = e => {
    getUserName.value='asdasdas'
    localStorage.setItem("companyUserName", e.target.value);
  };
  //Change Last Name 
  const onChangeLastName = e => {
    setLastName(e.target.value);
  };
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
  //Change Adress 
  const onChangeAdress= e => {
    setAdress(e.target.value);
  };
  return (
    <BillingFormWrapper className="isoBillingForm">
      <div className="isoInputFieldset">
        <InputBox
          label={<IntlMessages id="checkout.billingform.firstname" />}
          value={userName}
          defaultValue={getUserName}
          onChange={onChangeFirstName}
          important
        />
        <InputBox
          label={<IntlMessages id="checkout.billingform.lastname" />}
          onChange={onChangeLastName}
          value={getLastName}
          important
        />
      </div>

      <div className="isoInputFieldset">
        <InputBox label={<IntlMessages id="checkout.billingform.company" />}
          onChange={onChangeCompanyName}
          value={companyName === '' ? getCompanyName : companyName}
          important
        />
      </div>

      <div className="isoInputFieldset">
        <InputBox
          label={<IntlMessages id="checkout.billingform.email" />}
          onChange={onChangeEmail}
          value={getEmail === '' ? email : getEmail}
          important
        />
        <InputBox label={<IntlMessages id="checkout.billingform.mobile" />}
          onChange={onChangePhone}
          value={phone === '' ? getPhone : phone}
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
          value={getCity}
          important />
      </div>

      <div className="isoInputFieldset vertical">
        <InputBox
          label={<IntlMessages id="checkout.billingform.address" />}
          onChange={event => onChangeAdress(event)}
          value={getAdress}
          important
        />
      </div>
    </BillingFormWrapper>
  );
}
