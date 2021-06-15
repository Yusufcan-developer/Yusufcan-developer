//React
import React, { useState, useEffect } from "react";

//Components
import Form from "@iso/components/uielements/form";
import IntlMessages from "@iso/components/utility/intlMessages";
import Box from "@iso/components/utility/box";
import { Col, Card, Row, Button, Badge, notification, Typography, Tooltip, Space, Image, Tag, message, Input } from "antd";
import Scrollbar from '@iso/components/utility/customScrollBar';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Fetch
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { productAmountControl, productAmountControlDisabled } from '@iso/lib/helpers/productAmountControl';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import basicStyle from '@iso/assets/styles/constants';

//Other Library
import _ from 'underscore';
import logMessage from '@iso/config/logMessage';

//Desing style
import { SingleCardWrapper } from './Shuffle.styles';
import {
    InfoCircleOutlined
} from '@ant-design/icons';
import Modal from "antd/lib/modal/Modal";
const PopupProductRelation = (props) => {
    const { hide, item, onComplete, checkOutPage } = props;

    const { rowStyle, colStyle, gutter } = basicStyle;
    const [partialAmount, setPartialAmount] = useState(0);
    const [palletAmount, setPalletAmount] = useState(0);
    const [salableBalanceFriendlyText, setSalableBalanceFriendlyText] = useState();
    const [selectedAmout, setSelectedAmount] = useState(0);
    const [partialQuantity, setPartialQuantity] = useState(false);
    const [searchSiteMode, setSearchSitemode] = useState();
    const [entryProductCode, setEntryProductCode] = useState(null);
    const [selectedItem, setSelectedItem] = useState();
    const [entryProductCodeIsPartial, setEntryProductCodeIsPartial] = useState();
    const [dependentProducts, setDependentProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [warningQuantity, setWarningQuantity] = useState(0);
    const [changeQuantity, setChangeQuantity] = useState(true);
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
        if (changeQuantity === true) {
            const token = jwtDecode(localStorage.getItem("id_token"));
            getCartList();
        }
        getWarehouseList(item.itemCode);
    }, [changeQuantity]);

    const siteMode = getSiteMode();
    //Popup içerisinde girilen ana ürün ile bağıl ve ilgili ürünlerin miktar toplamları hesaplaması.
    async function calculatePopupQuantity(items) {
        let control = 0;

        let bagilVeIlgiliUrunMiktari = 0;
        const mainProduct = _.filter(items, function (x) {
            if (item.itemCode === x.itemCode) {
                return true;
            }
        });
        if (mainProduct.length > 0 && mainProduct[0].item.dependentProductCodes.length > 0) {
            const mainProductTotal = _.reduce(mainProduct, function (memo, x) { return memo + x.totalM2; }, 0);
            _.each(items, (redux) => {
                if (item.itemCode !== redux.itemCode) {
                    var even = _.find(item.dependentProductCodes, function (x) { return x === redux.itemCode })
                    if (typeof even !== 'undefined') { bagilVeIlgiliUrunMiktari += parseFloat(redux.totalM2); }
                }
            });
            if ((mainProductTotal === 0) || (bagilVeIlgiliUrunMiktari >= mainProductTotal)) {
                control = 0;
                setWarningQuantity(control);
            }
            else {
                if (!isNaN(mainProductTotal)) {
                    control = mainProductTotal - bagilVeIlgiliUrunMiktari;
                    setWarningQuantity(control);
                }
            }
        }
        else { control = 0;setWarningQuantity(0); }

        setChangeQuantity(false);
        return control;
    }
    async function getCartList() {
        let productInfo;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const activeUser = localStorage.getItem("activeUser")
        let apiUrl = '';
        if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includeUpdateDetails=true&siteMode=${siteMode}`; }
        else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includeUpdateDetails=true&siteMode=${siteMode}` }
        if (!token.uname) { return 'Unauthorized' }

        await fetch(apiUrl, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response, true);
                return status;
            })
            .then(data => {
                debugger
                calculatePopupQuantity(data.items);
            })
            .catch();
        return productInfo;
    }
    //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
    async function handleCancel(item) {
        const token = jwtDecode(localStorage.getItem("id_token"));
            if ((typeof item.dependentProductCodes === 'undefined' || item.dependentProductCodes.length === 0) || (warningQuantity <= 0)) {
                setPartialQuantity(false);
                setRelatedProducts([]);
                setDependentProducts([]);
                onComplete();
            }
            else { message.warning(warningQuantity <= 0 ? null : <span style={{ color: 'red' }}>{warningQuantity} {searchSiteMode !== enumerations.SiteMode.DeliverysPoint && item.unit === 'M2' ? 'M2' : item.unit !== 'TOR' ? 'Adet' : 'Torba'} Bağlı ürün eklemeniz gerekmektedir.</span>); 
        }

    }

    //Miktar girilen text alanında tüm değerleri seçiyor
    function onSelectAll(event) {
        event.target.select();
    }
    //Adding products to the cart
    function onAddProductCart(product, orderPartialAddTobox = false, isPartial = false, selectedQuantity = 0) {
        setChangeQuantity(true);
        if (searchSiteMode === enumerations.SiteMode.DeliverysPoint) { isPartial = true; }
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
        //Kullanıcının rolüne göre ürün ekleyip çıkaramaması
        const token = jwtDecode(localStorage.getItem("id_token"));
        const activeUser = localStorage.getItem("activeUser")
        if ((!activeUser) | (activeUser === null)) {
            if ((token.urole === 'fieldmanager') || (token.urole === 'regionmanager') || (token.urole === 'support')) { return message.error('Ürünü sepete eklemek için bayi seçimi yapmanız gerekiyor.'); }
        }
        if (selectedQuantity === 0) { selectedQuantity = 1; }
        if (productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial) === undefined) {
            const amountControl = productAmountControl(product, isPartial, parseInt(selectedQuantity));
            if (amountControl === -1) {
                dispatch(addToCart(product, parseInt(selectedQuantity), isPartial, parseInt(selectedQuantity)));
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
                        const orderAmount = checkOutPage === true ? parseInt(setQunatity) : 0;
                        newProductQuantity.push({
                            itemCode,
                            quantity,
                            isPartial,
                            orderAmount,
                        });
                    }
                });
                dispatch(changeProductQuantity(newProductQuantity));
                postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.increaseProduct + setQunatity);
            }
        }

        setEntryProductCode(null);
        setEntryProductCodeIsPartial();
    };

    //Miktar değişiklikleri
    function onChange(e, item, isPartial) {
        setEntryProductCode(item.itemCode); setEntryProductCodeIsPartial(isPartial);
        if (!isNaN(e.target.value)) {
            setSelectedItem(item.itemCode);
            setSelectedAmount(parseInt(e.target.value));
        }
    }

    //Redux product quantity change event
    function onChangeQuantity(event, productData, isPartial = false) {
        setChangeQuantity(true);
        let newQuantity = event.target.value;
        if (searchSiteMode === enumerations.SiteMode.DeliverysPoint) { isPartial = true; }
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
        const selectedQuantity = event.target.value;

        if ((!productQuantity.find(item => item.itemCode === productData.itemCode && item.isPartial === isPartial))) {
            const amountControl = productAmountControl(productData, isPartial, parseInt(selectedQuantity));
            if (amountControl === -1) { setSelectedAmount(0); return onAddProductCart(productData, true, isPartial, selectedQuantity) }
        }
        else {
            const product = productData;
            var selectedProduct = productQuantity.find(reduxItem => reduxItem.itemCode === product.itemCode && reduxItem.isPartial === isPartial);
            const newProductQuantity = [];
            if (typeof selectedProduct !== 'undefined') {
                const amountControl = productAmountControl(productData, isPartial, parseInt(selectedQuantity));
                if (amountControl === -1) { newQuantity = event.target.value }
                else { newQuantity = amountControl }
                productQuantity.forEach(productItem => {
                    if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
                        newProductQuantity.push(productItem);
                    } else {
                        const itemCode = productItem.itemCode
                        const quantity = parseInt(newQuantity);
                        const orderAmount = checkOutPage === true ? parseInt(newQuantity) : 0;
                        newProductQuantity.push({
                            itemCode,
                            quantity,
                            isPartial,
                            orderAmount,
                        });
                    }
                });
                dispatch(changeProductQuantity(newProductQuantity));
            }
            setSelectedAmount(0);
            setEntryProductCode(null);
            setEntryProductCodeIsPartial()
        }
    };

    //removing items from the cart
    function onRemoveProductCart(product, isPartial = false) {
        setChangeQuantity(true);
        const productIsPartialTitle = isPartial === true ? ' Parçalı' : ' Paletli';
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
                    const orderAmount = checkOutPage === true ? parseInt(setQunatity) : 0;
                    if (quantity === 0) { return postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, product.itemCode + productIsPartialTitle + logMessage.Carts.removeProduct); }
                    newProductQuantity.push({
                        itemCode,
                        quantity,
                        isPartial,
                        orderAmount,
                    });
                }
            });
            dispatch(changeProductQuantity(newProductQuantity));
            if (setQunatity > 0) {
                postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + productIsPartialTitle + logMessage.Carts.decreaseProduct + setQunatity);
            }
        }
    };

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

    function EntryInputQuantity(product, isPartial) {
        //Mevcut ürünün Redux tarafında kontrolü
        const selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial === isPartial);

        //Ürün mevcut sepette yoksa
        if (typeof selectedProduct === 'undefined') {
            //Burada ki fonksiyon inputların value özelliklerine eklendiği için her güncellenmede rakamlar değişiyor.
            //Kullanıcının giriş yapmış olduğu değer ile diğer ürünlerin inputları ile karşılaştırıyor
            //Örnek olarak : ABC ürünü parçalı veya paletli olma durumu
            if ((product.itemCode === entryProductCode) && (isPartial === entryProductCodeIsPartial)) {
                return selectedAmout;
            }
            else { return 0 }
        }
        //Ürün mevcut septte varsa
        else {
            if (entryProductCode !== null) {
                if ((entryProductCode === product.itemCode) && (isPartial === entryProductCodeIsPartial)) {
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

    return (
        <React.Fragment>
            <Box>
                <Modal
                    title={item.itemCode + ' - ' + item.description}
                    visible={hide}
                    width={1500}
                    height={800}
                    onCancel={event => handleCancel(item)}
                    maskClosable={false}
                    footer={[
                        <Button key="back" type="primary" onClick={event => handleCancel(item)}>
                            Kapat
                              </Button>
                    ]}>
                    {/* { Eklenmesi gereken ürün sayısı bilgisi } */}
                    {<Col style={{ width: '100%' }} align="center">
                        {warningQuantity <= 0 ? null : <span style={{ color: 'red' }}>{warningQuantity} {searchSiteMode !== enumerations.SiteMode.DeliverysPoint && item.unit === 'M2' ? 'M2' : item.unit !== 'TOR' ? 'Adet' : 'Torba'} Bağlı ürün eklemeniz gerekmektedir.</span>}
                    </Col>}
                    <Row style={rowStyle} gutter={gutter} justify="start">
                        <Col md={12} sm={12} xs={24} style={colStyle} >
                            <span style={{ fontWeight: 'bold', color: 'red' }}>Seçilen Ana Ürün</span>
                            <Box>
                                <Card bodyStyle={{ textAlign: 'center' }}>
                                    {<Image
                                        key={`customnav-slider--key${item.imageUrl}`}
                                        src={item.imageMediumBaseUrl + item.imageMainFileName}
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
                                                            value={EntryInputQuantity(item, false)}
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
                                                        value={EntryInputQuantity(item, true)}
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
                                                        {partialAmount > 0 ? (<Col span={4}>
                                                            <Tag color="blue">
                                                                Stok: {numberFormat(partialAmount)} {item.unit}
                                                            </Tag>
                                                        </Col>) : null}
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Form.Item> : null}
                                </div>

                            </Box>

                        </Col>
                        {item.dependentProducts && item.dependentProducts.length > 0 ?
                            <Col md={6} sm={6} xs={12} style={colStyle}>
                                <span style={{ fontWeight: 'bold' }}>Bağlı Ürünler ( {(item.dependentProducts.length)} )</span>
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
                                                {(item.canBeSoldPartially === true) & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (

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
                                                                                        value={EntryInputQuantity(item, false)}
                                                                                    />
                                                                                </Col>
                                                                                <Col span={4}>
                                                                                    <Button disabled={productAmountControlDisabled(item, false, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                                                                        {<IntlMessages id="product.plus" />}
                                                                                    </Button>
                                                                                </Col>
                                                                                <Col span={4} style={{ width: '100%' }}>
                                                                                    <Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            1 Palet: {item.m2Pallet} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>
                                                                                    {/* {palletAmount > 0 ? (<Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            Stok: {salableBalanceFriendlyText}
                                                                                        </Tag>
                                                                                    </Col>) : null} */}
                                                                                </Col>
                                                                            </Row>
                                                                        </Form.Item>
                                                                    </div>
                                                                    <br />
                                                                    <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                                                                        <Row align="middle">
                                                                            <Col span={4} align="right">
                                                                                <Button type="primary" onClick={event => onRemoveProductCart(item, true, true)}>
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
                                                                                    value={EntryInputQuantity(item, true)}
                                                                                />
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                                                                    {<IntlMessages id="product.plus" />}
                                                                                </Button>
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Col span={4}>
                                                                                    {item.unit !== 'TOR' ? <Tag color="blue">
                                                                                        1 Kutu: {item.m2Box} {item.unit}
                                                                                    </Tag> : null}

                                                                                </Col>
                                                                            </Col>
                                                                        </Row>
                                                                    </Form.Item>
                                                                </div>
                                                            </Col>
                                                        </Row>) : (null)
                                                ) : (
                                                    <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                        <Col span={4} style={{ width: '100%' }} align="right">
                                                            <Button type="primary" onClick={event => onRemoveProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                {<IntlMessages id="product.minus" />}
                                                            </Button>
                                                        </Col>
                                                        <Col span={8} align="middle">
                                                            <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet' : item.unit !== 'TOR' ? 'Kutu' : 'Torba'}</span>
                                                            <Input
                                                                id={'b' + item.itemCode}
                                                                onClick={event => onSelectAll(event)}
                                                                onChange={event => onChange(event, item, false)}
                                                                onBlur={event => onChangeQuantity(event, item)}
                                                                style={{ textAlign: "right", maxHeight: '32px' }}
                                                                maxLength={5}
                                                                defaultValue={0}
                                                                step={1}
                                                                value={EntryInputQuantity(item, false)}
                                                            />
                                                        </Col>
                                                        <Col span={4} style={{ width: '100%' }}>
                                                            <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                {<IntlMessages id="product.plus" />}
                                                            </Button>
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
                                <span style={{ fontWeight: 'bold' }}>İlgili Ürünler  ( {(item.relatedProducts.length)} )</span>
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
                                                {(item.canBeSoldPartially === true) & searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (

                                                    item.canBeSoldPartially === true ? (
                                                        //İlgili ürünler içerisinde Parçalı satılabilir ürünlerin alanı
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
                                                                                        value={EntryInputQuantity(item, false)}
                                                                                    />
                                                                                </Col>
                                                                                <Col span={4}>
                                                                                    <Button disabled={productAmountControlDisabled(item, false, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                                                                        {<IntlMessages id="product.plus" />}
                                                                                    </Button>
                                                                                </Col>
                                                                                <Col span={4} style={{ width: '100%' }}>
                                                                                    <Col span={4}>
                                                                                        <Tag color="blue">
                                                                                            1 Palet: {item.m2Pallet} {item.unit}
                                                                                        </Tag>
                                                                                    </Col>
                                                                                </Col>
                                                                            </Row>
                                                                        </Form.Item>
                                                                    </div>
                                                                    <br />
                                                                    <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                                                                        <Row align="middle">
                                                                            <Col span={4} align="right">
                                                                                <Button type="primary" onClick={event => onRemoveProductCart(item, true, true)}>
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
                                                                                    value={EntryInputQuantity(item, true)}
                                                                                />
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                                                                    {<IntlMessages id="product.plus" />}
                                                                                </Button>
                                                                            </Col>
                                                                            <Col span={4} style={{ width: '100%' }}>
                                                                                <Col span={4}>
                                                                                    {item.unit !== 'TOR' ? <Tag color="blue">
                                                                                        1 Kutu: {item.m2Box} {item.unit}
                                                                                    </Tag> : null}

                                                                                </Col>
                                                                            </Col>
                                                                        </Row>
                                                                    </Form.Item>
                                                                </div>
                                                            </Col>
                                                        </Row>) : (null)
                                                ) : (
                                                    <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                                                        <Col span={4} style={{ width: '100%' }} align="right">
                                                            <Button type="primary" onClick={event => onRemoveProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                {<IntlMessages id="product.minus" />}
                                                            </Button>
                                                        </Col>
                                                        <Col span={8} align="middle">
                                                            <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet' : item.unit !== 'TOR' ? 'Kutu' : 'Torba'}</span>
                                                            <Input
                                                                id={'b' + item.itemCode}
                                                                onClick={event => onSelectAll(event)}
                                                                onChange={event => onChange(event, item, false)}
                                                                onBlur={event => onChangeQuantity(event, item)}
                                                                style={{ textAlign: "right", maxHeight: '32px' }}
                                                                maxLength={5}
                                                                defaultValue={0}
                                                                step={1}
                                                                value={EntryInputQuantity(item, false)}
                                                            />
                                                        </Col>
                                                        <Col span={4} style={{ width: '100%' }}>
                                                            <Button disabled={productAmountControlDisabled(item, item.canBeSoldPartially, palletQuantityEntry(item))} type="primary" onClick={event => onAddProductCart(item, item.canBeSoldPartially, item.canBeSoldPartially)}>
                                                                {<IntlMessages id="product.plus" />}
                                                            </Button>
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
