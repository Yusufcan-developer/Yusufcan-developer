//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

//Components
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import Box from '@iso/components/utility/box';
import { CheckoutContents } from './Checkout.styles';
import Button from '@iso/components/uielements/button';
import SingleOrderInfo from './SingleOrder';
import AllCartItemChangeOrderAmount from './CartItemToOrderAmount';
import { OrderTable } from './Checkout.styles';
import InputBox from './InputBox';
import IntlMessages from '@iso/components/utility/intlMessages';
import { BillingFormWrapper } from './Checkout.styles';
import siteConfig from "@iso/config/site.config";
import { Col, Modal, Table, Input, Space, message, Alert, Select } from "antd";
import Form from "@iso/components/uielements/form";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { InputBoxWrapper } from './Checkout.styles';
import PopupProductRelation from '../../../../src/containers/Products/PopupProductRelation';
import CreateDemand from '../../../../src/containers/Demand/CreateDemand';
import ecommerceAction from '@iso/redux/ecommerce/actions';

//Fetch
import { useGetCartCheckOut } from "@iso/lib/hooks/fetchData/useGetCartCheckOut";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Styles
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
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
import viewType from '@iso/config/viewType';

moment.locale('tr')
var jwtDecode = require('jwt-decode');

let createOrderNo = 'xxxx';
const cityChildren = [];
let townChildren = [];
let cartItem = null;
const {
  initData,
  changeViewTopbarCart,
  changeProductQuantity,
} = ecommerceAction;
export default function () {
  const queryString = require('query-string');
  let distrinctArray;
  document.title = "Sipariş Onayı - Seramiksan B2B";
  const dispatch = useDispatch();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');
  const [district, setDistrict] = useState('');
  const [km, setKm] = useState();
  const [cities, setCities] = useState();
  const [towns, setTowns] = useState();
  const [optionsCities, setOptions] = useState();
  const [lookupCities, setLookupCities] = useState();
  const [cityAndTown, setCityAndTow] = useState();
  const [visible, setVisible] = useState();
  const [createOrderQuestionVisible, setCreateOrderQuestionVisible] = useState();
  const [form] = Form.useForm();
  const [hasOrderSavePermission, setHasOrderSavePermission] = useState();
  const [user, setUser] = useState();
  const [adress, setAdress] = useState();
  const [addressCode, setAddressCode] = useState('');
  const [adressItem, setAdressItem] = useState();
  const [addressFilterData, setAddressFilterData] = useState();
  const [loadingButton, setLoadingButton] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [demandConfirmLoading, setDemandConfirmLoading] = useState(false);
  const [createAddress, setCreateAddress] = useState(false);
  const [successOrderSave, setSuccessOrderSave] = useState(false);
  const [addressTitle, setAddressTitle] = useState();
  const [address1, setAddress1] = useState();
  const [address2, setAddress2] = useState();
  const [includeTransportation, setIncludeTransportation] = useState(false);
  const [itemsWaitingManufacturing, setItemsWaitingManufacturing] = useState();
  const [transportation, setTransportation] = useState('');
  const [days, setDays] = useState([]);
  const [userId, setUserId] = useState();
  const [hide, setHide] = useState(false);
  const [demandHide, setDemandHide] = useState(false);
  const [productDetail, setProduct] = useState();
  const [quantity, setQuantity] = useState();
  const [selectedItemPartial, setSelectedItemPartial] = useState();
  const [demandStatus, setDemandStatus] = useState(enumerations.DemandStatus.Pending);
  const history = useHistory();
  const location = useLocation();
  const {
    productQuantity,
  } = useSelector(state => state.Ecommerce);

  // const [data, changeCart] = useGetCartCheckOut(city,town);
  const token = jwtDecode(localStorage.getItem("id_token"));
  const activeUser = localStorage.getItem("activeUser");
  const { Option } = Select;
  let account = token.uname;

  let createAddressButtonVisible = true;
  if (typeof activeUser != 'undefined') { account = activeUser };
  const siteMode = getSiteMode();

  let searchUrl = queryString.parse(location.search);
  const [data, setOnChange] = useGetCartCheckOut(addressCode, searchUrl, includeTransportation);

  //Adres bilgileri için token değerinin alınıp user Id bölümü çözümleniyor.
  useEffect(() => {
    const token = jwtDecode(localStorage.getItem("id_token"));
    setUserId(token.uid);
    getInitData(token.uid);
    postSaveLog(enumerations.LogSource.Order, enumerations.LogTypes.Browse, logMessage.Order.browse);
  }, [days]);

  //Get Products
  function renderProducts() {
    if (typeof data !== 'undefined') {
      const productList = _.filter(data.items, function (item) { return item.orderAmount > 0; });
      let quantityLess;
      return productList.map(product => {
        if (productList.length > 0) {
          quantityLess = _.find(product.validationMessages, function (x) { return x.Key === "DependentProduct"; });
        }
        return (
          <SingleOrderInfo
            key={product.objectID}
            productItem={product}
            popupShow={e => popupShow(product)}
            onComplete={onCompletePopupRelation}
            quantityLess={quantityLess}
          />
        );
      });
    }
  }
  async function popupShow(productItem) {
    if (productItem.itemCode === 'M99999900') { return; }
    if ((typeof addressCode === 'undefined') || (addressCode === '')) { return message.warning('Sevk adresi seçiniz!') }

    const token = jwtDecode(localStorage.getItem("id_token"));
    if ((token.uname === 'utku') || (token.uname === 'B555888')) {
      await getProductDetail(productItem.itemCode);
      setSelectedItemPartial(productItem.isPartial);
      return setDemandHide(true);
    }
    if (productItem.hasDependentOrRelatedProducts === true) {
      await getProductDetail(productItem.itemCode);

      return setHide(true);
    }
    //TODO
    //Buraya item gelecek bu item amacı talep oluşturulması gerekiyormu kontrolü ve sevk adresi kontrolü eklecek. Sevk adresi seçilmediyse seçilecek
    else {
      await getProductDetail(productItem.itemCode);
      return setDemandHide(true);
    }
  }

  //Bağlı ürün popup işlemleri sonucu
  function onCompletePopupRelation() {
    setHide(false);
    setOnChange(true);
  }

  //Talep oluşturma popup işlemleri sonucu
  async function onCompletePopupDemand(createDemand = false, item, amount) {

    //Talep Oluşturma işlemi seçildiyse
    if (createDemand === true) {
      const saveDemand = await postSaveDemand(amount, item.itemCode);
      if (saveDemand === true) {
        setHide(false);
        setDemandHide(false);

        //Talep başarılı bir şekilde oluşturulduysa sipariş sepetinden ilgili ürün silinecek.
        const newProductQuantity = [];
        _.each(productQuantity, (product, i) => {
          if ((product.itemCode !== item.itemCode || product.isPartial !== selectedItemPartial)) {
            newProductQuantity.push(product);
          }
        });

        dispatch(changeProductQuantity(newProductQuantity));
        await getCartList();
        await AllCartItemChangeOrderAmount();
        setOnChange(true);
      }
      postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Add, logMessage.Demand.save);
    }
    //Talep oluşturma iptal işleminde
    else{
      setHide(false);
      setDemandHide(false);
    }
    
  }
  //Get Cart
  async function getCartList() {
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    let apiUrl = '';
    const siteMode = getSiteMode();
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser");
    if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includeUpdateDetails=true&siteMode=${siteMode}`; }
    else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includeUpdateDetails=true&siteMode=${siteMode}` }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(apiUrl, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data.isSuccessful === false) { return setQuantity(0) }
        else {
          cartItem = data.items;
          setQuantity(cartItem.length);
          getInitData();//Send Redux Data;        
          //Redux Data refresh
          if ((productQuantity === null) || (quantity !== productQuantity.length)) {
            let productQuantity = localStorage.getItem('cartProductQuantity');
            productQuantity = JSON.parse(productQuantity); dispatch(initData({ productQuantity }));
          }
          //Son redux datasının topbar veritabanı ile eşleştirilmesi
          let reduxCart = localStorage.getItem('cartProductQuantity');
          reduxCart = JSON.parse(reduxCart);
        }
      })
      .catch();
    return productInfo;
  }

  //Get Product Detail
  async function getProductDetail(itemCode) {
    const siteMode = getSiteMode();
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser");
    let uname = '';
    if (typeof activeUser != 'undefined') { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }
    await fetch(`${siteConfig.api.products.getProductDetail}${itemCode}?siteMode=${siteMode}&includeDependentAndRelatedProductDetails=true`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setProduct(data);
      })
      .catch();
    return productInfo;
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

  const onChangeKm = e => {
    setKm(e.target.value);
  }

  function onCreateAddress() {
    setCity();
    setTown();
    setTowns();
    setCities();
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

  //Save order persmission button disabled
  function saveOrderPermissions() {
    if (siteMode === enumerations.SiteMode.DeliverysPoint) {
      if ((addressCode === '') && (hasOrderSavePermission) || (transportation === '')) {
        return true
      }
      else { return false }
    }
    else {
      return !hasOrderSavePermission;
    }
  }

  //Nakliye şekli seçme işlemi
  async function shippingMethodHandleChange(value) {
    setTransportation(value);
    if (value === 'IncludingShipping') {
      setIncludeTransportation(true);
      getInitData(userId, city, town, true);
    }
    else { setIncludeTransportation(false); setOnChange(true); getInitData(userId, city, town, false); }
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

  //getLocationDetail
  async function getLocationDetail(selectedCity, selectedTown) {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.lookup.getLocationDetail}?city=${selectedCity}&town=${selectedTown}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        setDays([data]);
        setOnChange(true);
      })
      .catch();
  }

  //getDistricts
  async function getDistricts(selectedCity, selectedTown) {
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    let newSaveOrderUrl = siteConfig.api.lookup.getDistricts.replace('{city}', selectedCity);
    newSaveOrderUrl = newSaveOrderUrl.replace('{town}', selectedTown);
    await fetch(`${newSaveOrderUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          distrinctArray = _.map(data, (item) => { return { 'label': item, 'value': item }; })
          distrinctArray.push({ 'label': 'YOK', 'value': null });
        }
      })
      .catch();
  }

  //getLocaitons
  async function getLocations() {
    //Get User Info  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(siteConfig.api.lookup.getLocations, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
          setOptions(data);
          setCityAndTow(data);
          _.each(data, (item) => {
            cityChildren.push(<Option key={item.value}>{item.value}</Option>);
          });
          setLookupCities(cityChildren)
        }
      })
      .catch();
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
  async function getInitData(userId, selectedCity, selectedTown, addressDeliveryCostCalculate) {
    await getHasSaveOrderPermission();
    await getByUserId(userId);
    await getAdress();
    await getLocations();
    if ((typeof selectedCity !== 'undefined') && (siteMode === enumerations.SiteMode.DeliverysPoint) && (addressDeliveryCostCalculate === true)) {
      await getLocationDetail(selectedCity, selectedTown);
    }
    if (typeof addressDeliveryCostCalculate === 'boolean' && addressDeliveryCostCalculate === true && siteMode === enumerations.SiteMode.DeliverysPoint) {
      message
        .loading('Nakliye Bedeli Hesaplanıyor Bekleyiniz..', 2.5)
        .then(() => message.success('Nakliye bedeli hesaplandı', 2.5));
    }
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
    if (typeof activeUser != 'undefined') { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account, "siteMode": siteMode };
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
                  isPartial: product.isPartial,
                  totalM2: product.totalM2,
                });
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            setOnChange(true);
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
    if ((typeof addressTitle === 'undefined') || (typeof address1 === 'undefined') || (typeof cities === 'undefined') || (typeof towns === 'undefined') || (typeof address2 === 'undefined')) { return message.error('Lütfen zorunlu alanları giriniz.'); }
    setConfirmLoading(true);
    const reqBody = { "id": 0, "addressCode": '', "dealerId": 0, "dealerCode": dealerCodes, "addressTitle": addressTitle, "address1": address1, "city": cities, "town": towns, "district": district, "countryCode": 'TR', "countryName": 'Türkiye', 'phone': phone }
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
        setAdressItem(data.addressTitle); setPhone(data.phone); setCities(data.city); setAddressCode(data.addressCode); setTowns(data.town);
        setVisible(false);
        setCreateAddress(false);
        message.success('Adres bilgisi başarılı bir şekilde kayıt edilmiştir.');
        getAdress();
        // getInitData(userId,data.city,data.town,true);
        postSaveLog(enumerations.LogSource.Address, enumerations.LogTypes.Add, data.addressTitle + logMessage.Address.saveAddress);
      })
      .catch(setConfirmLoading(false));
    setConfirmLoading(false);
  }

  //Save Order
  async function postSaveOrder() {
    const siteMode = getSiteMode();
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
    await fetch(`${newSaveOrderUrl}/?siteMode=${siteMode}&includeTransportation=${includeTransportation}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (typeof data !== 'undefined') {
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
      .catch(message.warning('Sistemde bir hata oluştu lütfen sistem yöneticinizle irtibata geçiniz. ' + newSaveOrderUrl));
    setConfirmLoading(false);
  }

  //Save Demand
  async function postSaveDemand(amount, itemCode) {
    const siteMode = getSiteMode();
    const token = jwtDecode(localStorage.getItem("id_token"));
    const dealerCode = token.dcode;
    setDemandConfirmLoading(true);
    const reqBody = { "status": demandStatus, "amount": amount, "itemId": itemCode, "addressCode": addressCode, "dealerCode": dealerCode }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.report.postDemands, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (typeof data !== 'undefined') {
          if (data.isSuccessful === false) {
            const getMessage = data.message;
            message.warning({ content: 'kaydetme işlemi başarısızdır. ', duration: 2 });
          } else {
            message.success({ content: 'başarıyla kaydedildi', duration: 2 });
          }
        }
      })
      .catch();
      setDemandConfirmLoading(false);
      if (data.isSuccessful === false) {return false;}
      else{return true;}
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
      title: "İlçe",
      dataIndex: "town",
      key: "town",
    },
    {
      title: 'İşlem',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: () => <a>Seç</a>,
    },
  ];

  let dayColumns = [
    {
      title: "Pazartesi",
      dataIndex: "monday",
      key: "monday",
      align: 'center',
      render: (monday) => (
        monday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Salı",
      dataIndex: "tuesday",
      key: "tuesday",
      align: 'center',
      render: (tuesday) => (
        tuesday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Çarşamba",
      dataIndex: "wednesday",
      key: "wednesday",
      align: 'center',
      render: (wednesday) => (
        wednesday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Perşembe",
      dataIndex: "thursday",
      key: "thursday",
      align: 'center',
      render: (thursday) => (
        thursday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Cuma",
      dataIndex: "friday",
      key: "friday",
      align: 'center',
      render: (friday) => (
        friday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Cumartesi",
      dataIndex: "saturday",
      key: "saturday",
      align: 'center',
      render: (saturday) => (
        saturday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
    {
      title: "Pazar",
      dataIndex: "sunday",
      key: "sunday",
      align: 'center',
      render: (sunday) => (
        sunday !== true ? <span style={{ color: "red" }}>
          <CloseOutlined />
        </span> :
          <span style={{ color: "green" }}>
            <CheckOutlined />
          </span>
      )
    },
  ]

  if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
    createAddressButtonVisible = false;
  }
  //Change Status Type
  function onChangeHandleCity(value) {
    townChildren = [];
    setCities(value);
    var townList;
    if (value !== '') {
      _.each(cityAndTown, (item) => {
        if (item.value === value) {
          return townList = item.children
        }
      });
      _.each(townList, (item) => {
        townChildren.push(<Option key={item.value}>{item.value}</Option>);
      });
      setTowns(townChildren)
    }
  }
  function onChangeHandleTown(value) {
    setTowns(value);
  };

  const view = viewType('Reports');

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
                          onClick: event => {
                            setAddressCode(record.addressCode); setCountry(record.countryCode + '-' + record.countryName); setAdressItem(record.addressCode + '-' + record.addressTitle); setPhone(record.phone); setCities(record.city); setTowns(record.town); setAddress1(record.address1); setAddress2(record.address2); setVisible(false);
                            //getInitData(userId, record.city, record.town, true);
                          },
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
                    <InputBoxWrapper className="isoInputBox">
                      <label>
                        {'İl'}
                        {<span className="asterisk">*</span>}
                      </label>
                      <Select
                        mode={"single"}
                        style={{ width: '100%' }}
                        placeholder="İl Seçiniz"
                        value={cities}
                        showSearch
                        onChange={onChangeHandleCity}
                        filterOption={(input, option) =>
                          option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
                        }
                      >
                        {cityChildren}
                      </Select>
                    </InputBoxWrapper>
                    <Fieldset>
                      <InputBoxWrapper className="isoInputBox">
                        <label style={{ marginTop: '15px' }}>
                          {'İlçe'}
                          {<span className="asterisk">*</span>}
                        </label>
                        <Select
                          mode={"single"}
                          style={{ width: '100%' }}
                          placeholder="İlçe Seçiniz"
                          value={towns}
                          showSearch
                          onChange={onChangeHandleTown}
                          filterOption={(input, option) =>
                            option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
                          }
                        >
                          {townChildren}
                        </Select>
                      </InputBoxWrapper>
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
                  <p style={{ marginTop: '20px' }}>SAYIN YETKİLİ SATICIMIZ, SİPARİŞ ETTİĞİNİZ, STOKLARIMIZDA MEVCUT OLAN MALZEMELERİ 7 GÜN İÇERİSİNDE TESLİM ALMANIZ GEREKMEKTEDİR. AKSİ TAKDİRDE BEDELİ TARAFINIZCA ÖDEMEK KAYDI İLE GÜNCEL NAKLİYE FİYATLARINDAN SEVK EDİLECEKTİR.</p>
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
                {typeof adressItem === 'undefined' ? null : <React.Fragment>
                  {siteMode === enumerations.SiteMode.DeliverysPoint ?
                    <React.Fragment> <label>{<IntlMessages id="page.shippingType" />}  {<span className="asterisk">*</span>}</label>
                      <div className="isoInputFieldset">
                        <Select
                          style={{ marginBottom: '8px', width: view !== 'MobileView' ? '750px' : '100%' }}
                          placeholder={'Nakliye tipi seçiniz!'}
                          onChange={shippingMethodHandleChange}
                          optionFilterProp="children"
                        >
                          <Option value="IncludingShipping">Nakliye Dahil İstiyorum</Option>:
                          <Option value="dontWantShipping">Nakliye İstemiyorum</Option>
                        </Select>
                      </div></React.Fragment>
                    : null}
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
                      value={cities}
                      disabled
                    />
                    <InputBox label={<IntlMessages id="checkout.billingform.town" />}
                      onChange={event => onChangeAddressTown(event)}
                      value={towns}
                      disabled
                    />
                    {/* <InputBox label={<IntlMessages id="checkout.billingform.km" />}
                      onChange={event => onChangeKm(event)}
                      value={km}
                      disabled
                    /> */}
                  </div>
                  {siteMode === enumerations.SiteMode.DeliverysPoint ?
                    <Table title={() => 'Sevkiyat Günleri'} columns={dayColumns} dataSource={days} pagination={false}
                      scroll={{ x: 'max-content' }}
                      size="medium"
                      bordered={false} /> : null}
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
                    <span>{typeof data != 'undefined' ? (numberFormat(data.orderCost)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>KDV</span>
                    <span>{typeof data != 'undefined' ? (numberFormat(data.orderVat)) : (0)} TL</span>
                  </div>
                  <div className="isoOrderTableFooter">
                    <span>Genel Toplam</span>
                    <span>{typeof data != 'undefined' ? (numberFormat(data.orderOverallCost)) : (0)} TL</span>
                  </div>
                  <Space size={50}>
                    <Button disabled={saveOrderPermissions()} type="primary" loading={confirmLoading} className="isoOrderBtn" onClick={() => saveOrderQuestionModal()} >
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
          {demandHide === true ?
            <CreateDemand
              hide={demandHide}
              item={productDetail}
              dependentProducts={[]}
              relatedProducts={[]}
              checkOutPage={true}
              demandAmount={36}
              confirmLoading={demandConfirmLoading}
              onComplete={onCompletePopupDemand}
            /> : null}
          {hide === true ? <PopupProductRelation
            hide={hide}
            item={productDetail}
            dependentProducts={[]}
            relatedProducts={[]}
            checkOutPage={true}
            onComplete={onCompletePopupRelation}
          /> : null}
        </Box>
      </LayoutWrapper>
    </CheckoutContents>
  );
}
