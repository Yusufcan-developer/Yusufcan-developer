//React
import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import IntlMessages from "@iso/components/utility/intlMessages";
import { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import { InputSearch, } from '@iso/components/uielements/input';
import Box from "@iso/components/utility/box";
import { Col, Card, Row, Button, Pagination, Collapse, Spin, Badge, notification, Typography, Tooltip, Space, Image, Tag, message, Input } from "antd";
import Scrollbar from '@iso/components/utility/customScrollBar';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Fetch
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
import { usePostFilter } from "@iso/lib/hooks/fetchData/usePostFilterData";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { productAmountControl, productAmountControlDisabled } from '@iso/lib/helpers/productAmountControl';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';
import basicStyle from '@iso/assets/styles/constants';

//Other Library
import _ from 'underscore';
import logMessage from '@iso/config/logMessage';

//Desing style
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import ContentHolder from '@iso/components/utility/contentHolder';
import PageHeader from "@iso/components/utility/pageHeader";
import AlgoliaSearchPageWrapper from './Algolia.styles';
import { SingleCardWrapper } from './Shuffle.styles';
import {
  SortAscendingOutlined, ClearOutlined, InfoCircleOutlined, CloseOutlined
} from '@ant-design/icons';
import Modal from "antd/lib/modal/Modal";
const PopupProductRelation = (props) => {
    const [selectedPartialAmout, setSelectedPartialAmount] = useState(0);
    const { hide, item } = props;
    
    const { rowStyle, colStyle, gutter } = basicStyle;
    const [isModalVisible, setIsModalVisible] = useState();
    const [partialAmount, setPartialAmount] = useState(0);
    const [palletAmount, setPalletAmount] = useState(0);
    const [salableBalanceFriendlyText, setSalableBalanceFriendlyText] = useState();
    const [selectedAmout, setSelectedAmount] = useState(0);
    const [partialQuantity, setPartialQuantity] = useState(false);
    const [searchSiteMode, setSearchSitemode] = useState();
    const [selectedItemCode, setSelectedItemCode] = useState(); //Seçilen Ürünün bağlantılı ürün tespiti ve Popupta gösterilen ana ürün
    const [dependentProductCodes, setDependentProductCodes] = useState([]);
    const [relatedProductCodes, setRelatedProductCodes] = useState([]);
    const [dependentProducts, setDependentProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [entryProductCode, setEntryProductCode] = useState(null);
    const [selectedItem, setSelectedItem] = useState();
    const [entryProductCodeIsPartial, setEntryProductCodeIsPartial] = useState();
    // const {  } = props;
    // const { rowStyle, colStyle, gutter } = basicStyle;
    //Redux ürünler listeleme
    const { productQuantity } = useSelector(state => state.Ecommerce);
    const { addToCart, changeProductQuantity } = ecommerceActions;
    const dispatch = useDispatch();
    var jwtDecode = require('jwt-decode');
    const { Text } = Typography;
    let style = null;
    // if (position === 'top') {
    //     style = { marginBottom: '10px' };
    // } else if (position === 'bottom') {
    //     style = { marginTop: '10px' }
    // }
    // let newView = 'MobileView';
    // if (window.innerWidth > 1220) {
    //     newView = 'DesktopView';
    // } else if (window.innerWidth > 767) {
    //     newView = 'TabView';
    // }
    useEffect(() => {
      
      }, []);
    
    const siteMode = getSiteMode();
    //Quantity input number Show/Hide
    function inputNumberShowOrHide(value) {
        if (productQuantity !== null) {
            var selectedProduct = productQuantity.find(item => item.itemCode === value.itemCode);
            if (typeof selectedProduct === 'undefined') {
                return false;
            }
            else { return true; }
        }
        else { return false; }
    }
    //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
    function handleCancel(item) {
        setIsModalVisible(false);
    }

    //Miktar girilen text alanında tüm değerleri seçiyor
    function onSelectAll(event) {
        event.target.select();
    }
    //Adding products to the cart
    function onAddProductCart(product, orderPartialAddTobox = false, isPartial = false, selectedQuantity = 0) {
        if (searchSiteMode === enumerations.SiteMode.DeliverysPoint) { isPartial = true; }
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
        //Kullanıcının rolüne göre ürün ekleyip çıkaramaması
        const token = jwtDecode(localStorage.getItem("id_token"));
        const activeUser = localStorage.getItem("activeUser")
        if ((!activeUser) | (activeUser === null)) {
            if ((token.urole === 'fieldmanager') || (token.urole === 'regionmanager') || (token.urole === 'support')) { return message.error('Ürünü sepete eklemek için bayi seçimi yapmanız gerekiyor.'); }
        }
        if (selectedQuantity === 0) { selectedQuantity = 1; }
        if ((product.canBeSoldPartially) && (!orderPartialAddTobox) && (searchSiteMode !== enumerations.SiteMode.DeliverysPoint) || (product.hasDependentOrRelatedProducts === true) && (partialQuantity !== true)) { getProductDetail(product.itemCode); getWarehouseList(product.itemCode); setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
        else {
            inputNumberShowOrHide(product);
            if (productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial) === undefined) {
                const amountControl = productAmountControl(product, isPartial, parseInt(selectedQuantity));
                if (amountControl === -1) {
                    dispatch(addToCart(product, parseInt(selectedQuantity), isPartial));
                    notification.info({ message: 'Sepet', description: 'Ürün ' + product.itemCode + ' Sepete Eklenmiştir', placement: 'bottomRight' });
                    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, product.itemCode + productIsPartialTitle + logMessage.Carts.addProduct + selectedQuantity);
                }
            }
            else {
                const selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
                const amountControl = productAmountControl(product, isPartial, parseInt(selectedProduct.quantity + 1));
                if (amountControl === -1) {
                    const newProductQuantity = [];
                    let setQunatity;
                    productQuantity.forEach(productItem => {
                        if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
                            newProductQuantity.push(productItem);
                        } else {
                            const itemCode = productItem.itemCode;
                            const quantity = productItem.quantity + 1;
                            setQunatity = quantity;
                            newProductQuantity.push({
                                itemCode,
                                quantity,
                                isPartial,
                            });
                        }
                    });
                    dispatch(changeProductQuantity(newProductQuantity));
                    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.increaseProduct + setQunatity);
                }
                else {

                }
            }
        }

        setEntryProductCode(null);
        setEntryProductCodeIsPartial();
    };
    //Miktar değişiklikleri
    function onChange(e, item, isPartial) {
        debugger
        // if (hasRealionProduct) { setEntryProductCode(item.itemCode);setEntryProductCodeIsPartial(isPartial); }
        if (isPartial) { parseInt(setSelectedPartialAmount(e.target.value)) }
        else {
            setSelectedItem(item.itemCode);
            if (!isNaN(e.target.value)) {
                setSelectedAmount(parseInt(e.target.value));
            }
        }
    }

    //Redux product quantity change event
    function onChangeQuantity(event, productData, isPartial = false) {
        debugger
        if (searchSiteMode === enumerations.SiteMode.DeliverysPoint) { isPartial = true; }
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
        const selectedQuantity = event.target.value;
        if ((partialQuantity) && (!productQuantity.find(item => item.itemCode === productData.itemCode && item.isPartial === isPartial))) {
            const amountControl = productAmountControl(productData, isPartial, parseInt(selectedQuantity));
            if (amountControl === -1) { setSelectedAmount(0); setSelectedPartialAmount(0); return onAddProductCart(productData, true, isPartial, selectedQuantity) }
            else { setSelectedPartialAmount(amountControl); }
        }
        else {
            if ((partialQuantity === true) && (event.target.value === 1)) {
                const amountControl = productAmountControl(productData, isPartial, parseInt(selectedQuantity));
                if (amountControl === -1) {
                    onAddProductCart(productData, true, isPartial, selectedQuantity);
                    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, productData.itemCode + productIsPartialTitle + logMessage.Carts.addProduct + selectedQuantity);
                    setSelectedAmount(0); setSelectedPartialAmount(0);
                }
            }
            else {
                const product = productData;
                var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
                const newProductQuantity = [];
                let newQuantity;
                const amountControl = productAmountControl(productData, isPartial, parseInt(selectedQuantity));
                if (amountControl === -1) { newQuantity = event.target.value }
                else { newQuantity = amountControl }
                productQuantity.forEach(productItem => {
                    if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
                        newProductQuantity.push(productItem);
                    } else {
                        const itemCode = productItem.itemCode
                        const quantity = parseInt(newQuantity);
                        newProductQuantity.push({
                            itemCode,
                            quantity,
                            isPartial,
                        });
                    }
                });
                dispatch(changeProductQuantity(newProductQuantity));
                setSelectedAmount(0);
                setSelectedPartialAmount(0);
                setEntryProductCode(null);
                setEntryProductCodeIsPartial()
            }
            // if ((productData.canBeSoldPartially) && (searchSiteMode !== enumerations.SiteMode.DeliverysPoint) || (productData.hasDependentOrRelatedProducts === true) && (partialQuantity !== true)) { getProductDetail(productData.itemCode); getWarehouseList(productData.itemCode); setSelectedItemCode(productData.itemCode); return setPartialQuantity(true); }
        }
    };
    //removing items from the cart
    function onRemoveProductCart(product, isPartial = false) {
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
        if (product.canBeSoldPartially) { setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
        else {
            inputNumberShowOrHide(product);
            var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
            if (typeof selectedProduct === 'undefined') { return; }
            if (selectedProduct.quantity !== 0) {
                const newProductQuantity = [];
                let setQunatity;
                productQuantity.forEach(productItem => {
                    if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
                        newProductQuantity.push(productItem);
                    } else {
                        const itemCode = productItem.itemCode;
                        const quantity = productItem.quantity - 1;
                        setQunatity = quantity;
                        if (quantity === 0) { return postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, product.itemCode + productIsPartialTitle + logMessage.Carts.removeProduct); }
                        newProductQuantity.push({
                            itemCode,
                            quantity,
                            isPartial,
                        });
                    }
                });
                dispatch(changeProductQuantity(newProductQuantity));
                if (setQunatity > 0) {
                    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.decreaseProduct + setQunatity);
                }
            }
        }
    };
    //Get Warehouse Amount Data
    async function getWarehouseList(itemCode) {
        let productInfo;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };

        await fetch(`${siteConfig.api.warehouse}${itemCode}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                let palletQuantity = 0;
                let partialQuantity = 0;
                if (data.balances.length > 0) {
                    _.each(data.balances, (item) => {
                        if (item.warehouseName === 'PALETLİ SATIŞ AMBARI') { palletQuantity += item.balance } else {
                            partialQuantity += item.balance;
                        }
                    });
                    setPalletAmount(palletQuantity);
                    setPartialAmount(partialQuantity);
                    setSalableBalanceFriendlyText(data.salableBalanceFriendlyText);
                }
            })
            .catch();
        return productInfo;
    }
    //Get Product Detail
    async function getProductDetail(itemCode) {
        let productInfo;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };

        await fetch(`${siteConfig.api.products.getProductDetail}${itemCode}?siteMode=${siteMode}&includeDependentAndRelatedProductDetails=true`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (data && typeof data.dependentProducts !== 'undefined') {
                    setDependentProducts(data.dependentProducts);
                    setDependentProductCodes(data.dependentProductCodes);
                }
                if (data && typeof data.relatedProducts !== 'undefined') {
                    setRelatedProducts(data.relatedProducts);
                    setRelatedProductCodes(data.relatedProductCodes);
                }
            })
            .catch();
        return productInfo;
    }

    //Input Number return partial quantity value
  function partialPopupQuantityEntry(product, isPartial) {
    debugger
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial === isPartial);
    if (typeof selectedProduct === 'undefined') {
      if((product.itemCode!==entryProductCode)&& (isPartial!==entryProductCodeIsPartial)){
        return 0;
      }
      else{
        if(product.itemCode!==entryProductCode){
          return 0;
        }
        else{
          return selectedAmout;
        }
      }
    }
    else {
      if (entryProductCode !== null) {
        if ((entryProductCode === product.itemCode)&& (isPartial===entryProductCodeIsPartial)) {
          return selectedAmout;
        }
        else {
          return selectedProduct.quantity;
        }
      } else {
        if (selectedAmout < 1) {
          return selectedProduct.quantity;
        }
        else { return selectedAmout }
      }
    }
  }

  //Input Number return pallet quantity value
  function palletQuantityEntry(product) {
    var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode);
    if (typeof selectedProduct === 'undefined') {
      if (partialQuantity) { return 0 }
      return 1
    }
    else {
      if (entryProductCode !== null) {
        if (entryProductCode === product.itemCode) {
          return selectedAmout;
        }
        else {
          return selectedProduct.quantity;
        }
      } else {
        if (selectedAmout === 0) {
          return selectedProduct.quantity;
        } else {
          if (selectedItem === product.itemCode) {
            return selectedAmout;
          }
          else { return selectedProduct.quantity; }
        }
      }
    }
  }
  //Input Number return partial quantity value
  function partialQuantityEntry(product, isPartial) {
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial === isPartial);
    if (typeof selectedProduct === 'undefined') {
      if (selectedPartialAmout < 1) {
        return 0;
      } else {
        { return selectedPartialAmout }
      }
    }
    else {
      if (entryProductCode !== null) {
        if ((entryProductCode === product.itemCode)&& (isPartial===entryProductCodeIsPartial)) {
          return selectedPartialAmout;
        }
        else {
          return selectedProduct.quantity;
        }
      } else {
        if (selectedPartialAmout < 1) {
          return selectedProduct.quantity;
        }
        else { return selectedPartialAmout }
      }
    }
    }
    return (
        <React.Fragment>
            <Box>
                <Modal
                    title={item.itemCode + ' - ' + item.description}
                    visible={hide}
                    width={1500}
                    height={800}
                    onCancel={event => handleCancel('item')}
                    maskClosable={false}
                    footer={[
                        <Button key="back" type="primary" onClick={event => handleCancel('item')}>
                            Kapat
                              </Button>
                    ]}>
                    <Row style={rowStyle} gutter={gutter} justify="start">
                        <Col md={12} sm={12} xs={24} style={colStyle} >
                            <span style={{ fontWeight: 'bold' }}>Seçilen Ana Ürün</span>
                            <Box>
                                <Card bodyStyle={{ textAlign: 'center' }}>
                                    {<Image
                                        key={`customnav-slider--key${item.imageUrl}`}
                                        src={item.imageMediumBaseUrl + item.imageMainFileName}
                                        width='400px'
                                    />}
                                </Card>
                                <div>
                                    <div
                                        style={{
                                            borderBottom: '1px solid #E9E9E9',
                                            paddingBottom: '15px',
                                        }}
                                    >
                                        {siteMode !== enumerations.SiteMode.DeliverysPoint ?
                                            <Form.Item label="Paletli Satış (PALET)" style={{ marginTop: '10px' }}>
                                                <Row align="middle">
                                                    <Col span={4} align="right">
                                                        <Button type="primary" onClick={event => onRemoveProductCart(item, false)}>
                                                            {<IntlMessages id="product.minus" />}
                                                        </Button>
                                                    </Col>
                                                    <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                        <Input
                                                            id={'Paletli' + item.itemCode}
                                                            onClick={event => onSelectAll(event)}
                                                            onChange={event => onChange(event, item, false)}
                                                            onBlur={event => onChangeQuantity(event, item)}
                                                            style={{ textAlign: "right" }}
                                                            maxLength={5}
                                                            defaultValue={0}
                                                            step={1}
                                                            value={partialPopupQuantityEntry(item, false)}
                                                        />
                                                    </Col>
                                                    <Col span={4}>
                                                        <Button disabled={productAmountControlDisabled(item, false, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                                                {<IntlMessages id="product.plus" />}
                                                            </Button>
                                                    </Col>
                                                    <Col span={4} style={{ width: '100%' }}>
                                                        <Space size={1}>
                                                            <Col span={4}>
                                                                <Tag color="blue">
                                                                    1 Palet: {item.m2Pallet} {item.unit}
                                                                </Tag>
                                                            </Col>
                                                            {palletAmount > 0 ? (<Col span={4}>
                                                                <Tag color="blue">
                                                                    Stok: {salableBalanceFriendlyText}
                                                                </Tag>
                                                            </Col>) : null}
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </Form.Item>
                                            : null}
                                    </div>
                                    <br />
                                    {/* {siteMode !== enumerations.SiteMode.DeliverysPoint ? */}
                                    {item.canBeSoldPartially === true ?
                                        <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                                            <Row align="middle">
                                                <Col span={4} align="right">
                                                    <Button type="primary" onClick={event => onRemoveProductCart(item, true)}>
                                                        {<IntlMessages id="product.minus" />}
                                                    </Button>
                                                </Col>
                                                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                    <Input
                                                        id={'Parçalı' + item.itemCode}
                                                        onClick={event => onSelectAll(event)}
                                                        onChange={event => onChange(event, item, true)}
                                                        onBlur={event => onChangeQuantity(event, item, true)}
                                                        style={{ textAlign: "right" }}
                                                        maxLength={5}
                                                        defaultValue={1}
                                                        step={1}
                                                        value={partialQuantityEntry(item, true)}
                                                    />
                                                </Col>
                                                <Col span={4} style={{ width: '100%' }}>
                                                    <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                                            {<IntlMessages id="product.plus" />}
                                                        </Button>
                                                </Col>
                                                <Col span={4} style={{ width: '100%' }}>
                                                    <Space size={5}>
                                                        <Col span={4}>
                                                            {item.unit !== 'TOR' ? <Tag color="blue">
                                                                1 Kutu: {item.m2Box} {item.unit}
                                                            </Tag> : null}

                                                        </Col>
                                                        {/* {partialAmount > 0 ? (<Col span={4}>
                                                                <Tag color="blue">
                                                                    Stok: {numberFormat(partialAmount)} {item.unit}
                                                                </Tag>
                                                            </Col>) : null} */}
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Form.Item> : null}
                                </div>

                            </Box>

                        </Col>
                        {item.dependentProducts && item.dependentProducts.length > 0 ?
                            <Col md={6} sm={6} xs={12} style={colStyle}>
                                <span style={{ fontWeight: 'bold' }}>Bağlı Ürünler</span>
                                <Scrollbar style={{ height: 500 }}><Box>
                                    <Row gutter={[24, 8]}>
                                        {item.dependentProducts.map((item) => (
                                            <SingleCardWrapper style={style} xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 24 }} >
                                                <React.Fragment>
                                                    {item.campaignCode === '' ?
                                                        <div className="isoCardImage">
                                                            <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                                        </div> : <Badge.Ribbon text="Kampanyalı" color='blue' placement='start'>
                                                            <div className="isoCardImage">
                                                                <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                                            </div></Badge.Ribbon>}
                                                </React.Fragment>
                                                <div className="isoCardContent">
                                                    <Row>
                                                        <Col span={6} >
                                                            <h3 className="isoCardTitle">{item.itemCode}</h3>
                                                        </Col>
                                                        <Col span={18} align="right" >
                                                            <Text mark style={{ fontSize: '80%' }}>{item.salableBalanceFriendlyText ? ('Stok: ' + item.salableBalanceFriendlyText) : null}{ }</Text>
                                                        </Col>
                                                    </Row>
                                                    <span className="isoCardDate" style={{ minHeight: '70px' }}>
                                                        {item.description}
                                                        <br />
                                                        <Col className="isoCardTitle" align="center" >
                                                            {item.descriptionExtra}
                                                        </Col>
                                                    </span>
                                                    <div className="isoCardTitle" style={{ textAlign: 'center', paddingRight: '50px' }}>{(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet: ' : '') + numberFormat(item.listPrice)} {"TL"} {'/'} {item.unit}
                                                        {item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (<React.Fragment><br /> {'Parçalı: ' + numberFormat(item.partialPrice)} {"TL"} {'/'} {item.unit}</React.Fragment>) : null}<br />
                                                        <Tooltip trigger={["click", "hover"]} title={
                                                            <div>
                                                                1 Palet: {item.m2Pallet} {item.unit}<br />
                                                                {item.m2Box ? ('1 Kutu: ' + item.m2Box + ' ' + item.unit) : null}{item.m2Box ? <br /> : null}
                                                                {item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ?
                                                                    'Sepete hem palet hem de kutu bazında ekleme yapabilirsiniz' :
                                                                    null}
                                                            </div>} color={"#108ee9"}>
                                                            <Button type='link' size="small"
                                                                icon={<InfoCircleOutlined />} >
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                {!inputNumberShowOrHide(item) || (item.canBeSoldPartially === true) & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (

                                                    item.canBeSoldPartially === true ? (

                                                        //Bağlı ürünler içerisinde Parçalı satılabilir ürünlerin alanı
                                                        <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                            <Col span={20} align="middle">
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            borderBottom: '1px solid #E9E9E9',
                                                                            paddingBottom: '15px',
                                                                        }}
                                                                    >
                                                                        <Form.Item label="Paletli Satış (PALET)" style={{ marginTop: '10px' }}>
                                                                            <Row align="middle">
                                                                                <Col span={4} align="right">
                                                                                    {/* <Button type="primary" onClick={event => onRemoveProductCart(item, true, false)}>
                                                                                            {<IntlMessages id="product.minus" />}
                                                                                        </Button> */}
                                                                                </Col>
                                                                                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                                                    <Input
                                                                                        id={'Paletli' + item.itemCode}
                                                                                        // onClick={event => onSelectAll('Paletli' + item.itemCode)}
                                                                                        // onChange={event => onChange(event, item, false, true)}
                                                                                        // onBlur={event => onChangeQuantity(event, item)}
                                                                                        style={{ textAlign: "right" }}
                                                                                        maxLength={5}
                                                                                        defaultValue={0}
                                                                                        step={1}
                                                                                    // value={partialPopupQuantityEntry(item, false)}
                                                                                    />
                                                                                </Col>
                                                                                <Col span={4}>
                                                                                    {/* <Button disabled={productAmountControlDisabled(item, false, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                                                                            {<IntlMessages id="product.plus" />}
                                                                                        </Button> */}
                                                                                </Col>
                                                                                <Col span={4} style={{ width: '100%' }}>
                                                                                    <Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            1 Palet: {item.m2Pallet} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>
                                                                                    {palletAmount > 0 ? (<Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            Stok: {salableBalanceFriendlyText}
                                                                                        </Tag>
                                                                                    </Col>) : null}
                                                                                </Col>
                                                                            </Row>
                                                                        </Form.Item>
                                                                    </div>
                                                                    <br />
                                                                    <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                                                                        <Row align="middle">
                                                                            <Col span={4} align="right">
                                                                                {/* <Button type="primary" onClick={event => onRemoveProductCart(item, true, true)}>
                                                                                        {<IntlMessages id="product.minus" />}
                                                                                    </Button> */}
                                                                            </Col>
                                                                            <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                                                <Input
                                                                                    id={'Parçalı' + item.itemCode}
                                                                                    // onClick={event => onSelectAll('Parçalı' + item.itemCode)}
                                                                                    // onChange={event => onChange(event, item, true, true)}
                                                                                    // onBlur={event => onChangeQuantity(event, item, true)}
                                                                                    style={{ textAlign: "right" }}
                                                                                    maxLength={5}
                                                                                    defaultValue={1}
                                                                                    step={1}
                                                                                // value={partialQuantityEntry(item, true)}
                                                                                />
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                {/* <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                                                                        {<IntlMessages id="product.plus" />}
                                                                                    </Button> */}
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Col span={4}>
                                                                                    {item.unit !== 'TOR' ? <Tag color="blue">
                                                                                        1 Kutu: {item.m2Box} {item.unit}
                                                                                    </Tag> : null}

                                                                                </Col>
                                                                                {/* {partialAmount > 0 ? (<Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            Stok: {numberFormat(partialAmount)} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>) : null} */}
                                                                            </Col>
                                                                        </Row>
                                                                    </Form.Item>
                                                                </div>
                                                            </Col>
                                                        </Row>) : (
                                                        //Parçalı ürün içerisinde paletli ürün satmak
                                                        <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                            <Col span={20} align="middle">
                                                                {/* <Button
                                                                        disabled={calculateQuantity(item, false, 0)}
                                                                        type="primary" style={{ width: '100%' }}
                                                                        onClick={event => onAddProductCart(item)}>{item.canBeSoldPartially === true & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? addCardButtonTitle(item) : 'Sepete Ekle'}
                                                                    </Button> */}
                                                            </Col> </Row>)

                                                    //**************************************************************** */
                                                ) : (
                                                    <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                        <Col span={4} style={{ width: '100%' }} align="right">
                                                            {/* <Button type="primary" onClick={event => onRemoveProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                    {<IntlMessages id="product.minus" />}
                                                                </Button> */}
                                                        </Col>
                                                        <Col span={8} align="middle">
                                                            <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet' : item.unit !== 'TOR' ? 'Kutu' : 'Torba'}</span>
                                                            <Input
                                                                id={'b' + item.itemCode}
                                                                // onClick={event => onSelectAll('b' + item.itemCode)}
                                                                // onChange={event => onChange(event, item, item.isPartial, true)}
                                                                // onBlur={event => onChangeQuantity(event, item, item.isPartial)}
                                                                style={{ textAlign: "right", maxHeight: '32px' }}
                                                                maxLength={25}
                                                                defaultValue={1}
                                                                step={1}
                                                            // value={palletQuantityEntry(item, true)}
                                                            />
                                                        </Col>
                                                        <Col span={4} style={{ width: '100%' }}>
                                                            {/* <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                    {<IntlMessages id="product.plus" />}
                                                                </Button> */}
                                                        </Col>
                                                    </Row>
                                                )}
                                            </SingleCardWrapper>))}
                                    </Row>

                                </Box>
                                </Scrollbar>
                            </Col> : (null)}
                        {item.relatedProducts && item.relatedProducts.length > 0 ?
                            <Col md={6} sm={6} xs={12} style={colStyle}>
                                <span style={{ fontWeight: 'bold' }}>İlgili Ürünler</span>
                                <Scrollbar style={{ height: 500 }}><Box>
                                    <Row gutter={[24, 8]}>
                                        {item.relatedProducts.map((item) => (
                                            <SingleCardWrapper style={style} xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 24 }} >
                                                <React.Fragment>
                                                    {item.campaignCode === '' ?
                                                        <div className="isoCardImage">
                                                            <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                                        </div> : <Badge.Ribbon text="Kampanyalı" color='blue' placement='start'>
                                                            <div className="isoCardImage">
                                                                <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                                            </div></Badge.Ribbon>}
                                                </React.Fragment>
                                                <div className="isoCardContent">
                                                    <Row>
                                                        <Col span={6} >
                                                            <h3 className="isoCardTitle">{item.itemCode}</h3>
                                                        </Col>
                                                        <Col span={18} align="right" >
                                                            <Text mark style={{ fontSize: '80%' }}>{item.salableBalanceFriendlyText ? ('Stok: ' + item.salableBalanceFriendlyText) : null}{ }</Text>
                                                        </Col>
                                                    </Row>
                                                    <span className="isoCardDate">
                                                        {item.description}
                                                        <br />
                                                        <Col className="isoCardTitle" align="center" >
                                                            {item.descriptionExtra}
                                                        </Col>
                                                    </span>
                                                    <div className="isoCardTitle" style={{ textAlign: 'center' }}>{(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet: ' : '') + numberFormat(item.listPrice)} {"TL"} {'/'} {item.unit}
                                                        {item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (<React.Fragment><br /> {'Parçalı: ' + numberFormat(item.partialPrice)} {"TL"} {'/'} {item.unit}</React.Fragment>) : null}<br />
                                                        <Tooltip trigger={["click", "hover"]} title={
                                                            <div>
                                                                1 Palet: {item.m2Pallet} {item.unit}<br />
                                                                {item.m2Box ? ('1 Kutu: ' + item.m2Box + ' ' + item.unit) : null}{item.m2Box ? <br /> : null}
                                                                {item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ?
                                                                    'Sepete hem palet hem de kutu bazında ekleme yapabilirsiniz' :
                                                                    null}
                                                            </div>} color={"#108ee9"}>
                                                            <Button style={{ paddingRight: '50px' }} type='link' size="small"
                                                                icon={<InfoCircleOutlined />} >
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                {!inputNumberShowOrHide(item) || (item.canBeSoldPartially === true) & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (
                                                    item.canBeSoldPartially === true ? (

                                                        //Bağlı ürünler içerisinde Parçalı satılabilir ürünlerin alanı
                                                        <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                            <Col span={20} align="middle">
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            borderBottom: '1px solid #E9E9E9',
                                                                            paddingBottom: '15px',
                                                                        }}
                                                                    >
                                                                        <Form.Item label="Paletli Satış (PALET)" style={{ marginTop: '10px' }}>
                                                                            <Row align="middle">
                                                                                <Col span={4} align="right">
                                                                                    {/* <Button type="primary" onClick={event => onRemoveProductCart(item, true, false)}>
                                                                                            {<IntlMessages id="product.minus" />}
                                                                                        </Button> */}
                                                                                </Col>
                                                                                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                                                    <Input
                                                                                        id={'Paletli' + item.itemCode}
                                                                                        // onClick={event => onSelectAll('Paletli' + item.itemCode)}
                                                                                        // onChange={event => onChange(event, item, false, true)}
                                                                                        // onBlur={event => onChangeQuantity(event, item)}
                                                                                        style={{ textAlign: "right" }}
                                                                                        maxLength={5}
                                                                                        defaultValue={0}
                                                                                        step={1}
                                                                                    // value={partialPopupQuantityEntry(item, false)}
                                                                                    />
                                                                                </Col>
                                                                                <Col span={4}>
                                                                                    {/* <Button disabled={productAmountControlDisabled(item, false, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                                                                            {<IntlMessages id="product.plus" />}
                                                                                        </Button> */}
                                                                                </Col>
                                                                                <Col span={4} style={{ width: '100%' }}>
                                                                                    <Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            1 Palet: {item.m2Pallet} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>
                                                                                    {palletAmount > 0 ? (<Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            Stok: {salableBalanceFriendlyText}
                                                                                        </Tag>
                                                                                    </Col>) : null}
                                                                                </Col>
                                                                            </Row>
                                                                        </Form.Item>
                                                                    </div>
                                                                    <br />
                                                                    <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                                                                        <Row align="middle">
                                                                            <Col span={4} align="right">
                                                                                {/* <Button type="primary" onClick={event => onRemoveProductCart(item, true, true)}>
                                                                                        {<IntlMessages id="product.minus" />}
                                                                                    </Button> */}
                                                                            </Col>
                                                                            <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                                                                <Input
                                                                                    id={'Parçalı' + item.itemCode}
                                                                                    // onClick={event => onSelectAll('Parçalı' + item.itemCode)}
                                                                                    // onChange={event => onChange(event, item, true, true)}
                                                                                    // onBlur={event => onChangeQuantity(event, item, true)}
                                                                                    style={{ textAlign: "right" }}
                                                                                    maxLength={5}
                                                                                    defaultValue={1}
                                                                                    step={1}
                                                                                // value={partialQuantityEntry(item, true)}
                                                                                />
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                {/* <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                                                                        {<IntlMessages id="product.plus" />}
                                                                                    </Button> */}
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Col span={4}>
                                                                                    {item.unit !== 'TOR' ? <Tag color="blue">
                                                                                        1 Kutu: {item.m2Box} {item.unit}
                                                                                    </Tag> : null}

                                                                                </Col>
                                                                                {/* {partialAmount > 0 ? (<Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            Stok: {numberFormat(partialAmount)} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>) : null} */}
                                                                            </Col>
                                                                        </Row>
                                                                    </Form.Item>
                                                                </div>
                                                            </Col>
                                                        </Row>) : (
                                                        //Parçalı ürün içerisinde paletli ürün satmak
                                                        <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                            <Col span={20} align="middle">
                                                                {/* <Button
                                                                        disabled={calculateQuantity(item, false, 0)}
                                                                        type="primary" style={{ width: '100%' }}
                                                                        onClick={event => onAddProductCart(item)}>{item.canBeSoldPartially === true & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? addCardButtonTitle(item) : 'Sepete Ekle'}
                                                                    </Button> */}
                                                            </Col> </Row>)
                                                ) : (
                                                    <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                        <Col span={4} style={{ width: '100%' }} align="right">
                                                            {/* <Button type="primary" onClick={event => onRemoveProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                    {<IntlMessages id="product.minus" />}
                                                                </Button> */}
                                                        </Col>
                                                        <Col span={8} align="middle">
                                                            <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet' : item.unit !== 'TOR' ? 'Kutu' : 'Torba'}</span>
                                                            <Input
                                                                id={'A' + item.itemCode}
                                                                // onClick={event => onSelectAll('A' + item.itemCode)}
                                                                // onChange={event => onChange(event, item, item.isPartial, true, true)}
                                                                // onBlur={event => onChangeQuantity(event, item, item.isPartial, true)}
                                                                style={{ textAlign: "right", maxHeight: '32px' }}
                                                                maxLength={25}
                                                                defaultValue={1}
                                                                step={1}
                                                            // value={palletQuantityEntry(item, true)}
                                                            />
                                                        </Col>
                                                        <Col span={4} style={{ width: '100%' }}>
                                                            {/* <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                    {<IntlMessages id="product.plus" />}
                                                                </Button> */}
                                                        </Col>
                                                    </Row>
                                                )}
                                            </SingleCardWrapper>))}
                                    </Row>
                                </Box>   </Scrollbar>
                            </Col> : (null)}</Row>
                </Modal>
            </Box>
        </React.Fragment>
    );
}
export default PopupProductRelation;
