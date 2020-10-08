//React
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import { Link, useHistory, useRouteMatch, useParams } from 'react-router-dom';

//Components
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import IntlMessages from '@iso/components/utility/intlMessages';
import { SwiperWithCustomNav } from '@iso/ui/SwiperSlider';
import Input from '@iso/components/uielements/input';
import { Row, Col, Descriptions, Tabs, Button, Breadcrumb, notification, Table, Tag, Card, Modal, Image, Carousel, Space, Badge } from 'antd';
import { ReactSortable } from "react-sortablejs";
import _, { select } from 'underscore';

//Fetch
import { useGetProductItem } from "@iso/lib/hooks/fetchData/useGetProductItem";
import { useGetWarehouseData } from "@iso/lib/hooks/fetchData/useGetWarehouseData";

//Configs
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import numberFormat from "@iso/config/numberFormat";

//Styles
import PageHeader from '@iso/components/utility/pageHeader';
import basicStyle from '@iso/assets/styles/constants';
import Form from "@iso/components/uielements/form";
import { LinkOutlined } from '@ant-design/icons';
var jwtDecode = require('jwt-decode');
const { TabPane } = Tabs;

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogImageId, setDialogImageId] = useState(0);
  const [sliderImageUrl, setSliderImageUrl] = useState();
  const [removeItem, setRemoveItem] = useState();
  const [partialQuantity, setPartialQuantity] = useState(false);
  const [palletAmount, setPalletAmount] = useState(0);
  const [selectedItemCode, setSelectedItemCode] = useState();
  const [warehouseData, setWarehouseData] = useState();
  const [partialAmount, setPartialAmount] = useState(0);
  const history = useHistory();

  //Style States
  const { rowStyle, colStyle, gutter } = basicStyle;
  const style = { zIndex: 100 - 90 };
  const layout = {
    labelCol: { span: 8, },
    wrapperCol: { span: 16 },
  };

  const contentStyle = {
    height: '250px',
    color: '#FF5733',
    textAlign: 'center',
  };
  //Redux States
  const [quantity, setQuantity] = useState(1)
  const { productQuantity } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;

  //Product Detail Hook
  const [data, loadingGetApi, description, itemCode, series, productionStatus, surface, color, dimension, productItem, type, rectifying, listPrice, imageUrl, unit, canBeSoldPartially, notes, campaignImages, imageThumbBaseUrl, imageMediumBaseUrl, imageGeneralFileNames, imageTechnicalFileNames, imageOriginalBaseUrl, imageLargeBaseUrl, m2Pallet, m2Box] = useGetProductItem(`${siteConfig.api.products.getProductDetail}${productId}`);
  const [warehouseDataList] = useGetWarehouseData(`${siteConfig.api.warehouse}${productId}`);
  document.title = "Ürün - "+description+" - Seramiksan B2B";
  const onChange = value => {
    setQuantity(value);
    const product = productItem;
    if (productQuantity.length === 0) { dispatch(addToCart(product, value)); } //Sepete
    else {
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      if (selectedProduct === undefined) {
        dispatch(addToCart(product));
      }
      else {
        const newProductQuantity = [];
        const selectedQuantity = value;
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode
            const quantity = selectedQuantity;
            newProductQuantity.push({
              itemCode,
              quantity,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
      }
    };
  };
  //removing items from the cart
  function onRemoveProductCart(product, orderPartialAddTobox = false, isPartial = false) {
    if ((product.canBeSoldPartially) && (!orderPartialAddTobox)) { setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
    else {

      inputNumberShowOrHide(product)
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
      if (selectedProduct === undefined) { return; }
      if (selectedProduct.quantity !== 0) {
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode
            const quantity = productItem.quantity - 1;
            if (quantity === 0) { return; }
            newProductQuantity.push({
              itemCode,
              quantity,
              isPartial,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
      }
    }
  };
  //Adding products to the cart

  function onAddProductCart(product, orderPartialAddTobox = false, isPartial = false, selectedQuantity) {

    if ((canBeSoldPartially) && (!orderPartialAddTobox)) { getWarehouseList(product.itemCode); setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
    else {
      inputNumberShowOrHide(itemCode)
      if (productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial) === undefined) {
        if (selectedQuantity === undefined) { selectedQuantity = 1 }
        dispatch(addToCart(product, parseInt(selectedQuantity), isPartial));
        notification.info({ message: 'Sepet', description: 'Ürün Sepete Eklenmiştir', placement: 'bottomRight' });
      }
      else {
        const selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode;
            const quantity = productItem.quantity + 1;
            newProductQuantity.push({
              itemCode,
              quantity,
              isPartial,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
      }
    }
  };
  function inputNumberShowOrHide() {
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    if (selectedProduct === undefined) {
      return false;
    }
    else { return true; }
  }
  //Quantity input number Show/Hide
  function inputNumberQuantityValue() {
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    if (selectedProduct === undefined) {
      return 1
    }
    else {
      return selectedProduct.quantity;
    }
  }
  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }
  //Redux product quantity change event
  function onChangeQuantity(event, productData, isPartial = false) {
    if (event.target.value > 0) {
      const selectedQuantity = event.target.value;
      if ((!productQuantity.find(item => item.itemCode == productData.itemCode && item.isPartial == isPartial))) { return onAddProductCart(productData, true, isPartial, selectedQuantity) }
      else {
        const product = productData;
        var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial == isPartial);
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode
            const quantity = parseInt(event.target.value);
            newProductQuantity.push({
              itemCode,
              quantity,
              isPartial,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
      }
    }
  };
  function handleShowDialog(e, value) {
    console.log('e.key', e)
    setIsDialogOpen(true);
    setDialogImageId(e);
  }
  function handleShowDialogOk(e) {
    setIsDialogOpen(false);
  }
  //Input Number return partial quantity value
  function inputNumberPartialQuantityValue(itemCode, isPartial = false) {
    var selectedProduct = productQuantity.find(item => item.itemCode == itemCode && item.isPartial === isPartial);
    if (selectedProduct === undefined) {
      if (partialQuantity) { return 0 }
      return 0
    }
    else {
      return selectedProduct.quantity;
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
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (activeUser != undefined) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(`${siteConfig.api.warehouse}${itemCode}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setWarehouseData((data && data.balances) || [])
        // const warehouseGroupData=  _.groupBy(data.balances, function(item){ return item.warehouseName; });
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
        }

      })
      .catch();
    return productInfo;
  }
  let columns = [
    {
      title: "Ambar Kodu",
      dataIndex: "warehouseId",
      key: "warehouseId",
    },
    {
      title: "Ambar Adı",
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: "Bakiye (" + unit + ")",
      dataIndex: "balance",
      align: "right",
      key: "balance",
      render: (balance) => numberFormat(balance)
    },
  ];

  return (
    <LayoutWrapper>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link></Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="/products/categories">Ürün Grubu</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products/search">Ürün Arama</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Ürün Detayı</Breadcrumb.Item>
      </Breadcrumb>
      <Row style={rowStyle} gutter={gutter} justify="start">
        <PageHeader>{itemCode + " - " + description}</PageHeader>
        <Col md={12} sm={12} xs={24} style={colStyle}>
          <Box>
            <SwiperWithCustomNav navigationControl={false} >
              <Card >
                {<Image
                  key={`customnav-slider--key${sliderImageUrl || imageUrl}`}
                  src={sliderImageUrl || imageUrl}
                  height="500px"
                />}
              </Card>
            </SwiperWithCustomNav>
            {
              _.map(imageGeneralFileNames, (imagePathName) =>
                <Space size={20}>
                  <Image preview={false} align={"center"}
                    style={{ width: '100%', height: '100%', margin: '10px' }}
                    src={imageThumbBaseUrl + imagePathName} onClick={event => setSliderImageUrl(imageOriginalBaseUrl + imagePathName)}
                  />
                </Space>)}
            <Col span={8} offset={16} align="right" >
              <Button size="small" style={{ marginBottom: '5px' }} onClick={event => history.push(`${'/admin/products/photos'}/?${productId}`)}
                icon={<LinkOutlined />} >
              </Button>
            </Col>
          </Box>
        </Col>
        <Col md={12} sm={12} xs={24} style={colStyle}>
          <Box>
            <Row>
              <Col span={12}>
                <Form {...layout}>
                  <Form.Item label="Ürün Kodu">
                    <span className="ant-form-text">{itemCode || '-'}</span>
                  </Form.Item>
                  <Form.Item label="Seri">
                    <span className="ant-form-text">{series || '-'}</span>
                  </Form.Item>
                  <Form.Item label="Renk">
                    <span className="ant-form-text">{color || '-'}</span>
                  </Form.Item>
                  <Form.Item label="Ebat">
                    <span className="ant-form-text">{dimension || '-'}</span>
                  </Form.Item>
                  {notes != undefined ? (
                    <Form.Item label="Not">
                      <Tag color="purple">
                        {notes}
                      </Tag>
                    </Form.Item>
                  ) : (<Form.Item> </Form.Item>)}
                </Form>
              </Col>
              <Col span={12}>
                {productionStatus === 'OUTLET' ? (
                  <Row >
                    <Col align="right" span={24}>
                      <Tag color="purple">
                        {productionStatus}
                      </Tag>
                    </Col>
                  </Row>
                ) : (<Row >
                </Row>)}
                <Row style={{ marginTop: '30px' }}>
                  <Col align="center" span={24}>
                    <span style={{ fontSize: '35px' }}><strong>{numberFormat(listPrice)}</strong> {"TL"}</span>

                  </Col>
                </Row>
                <Row style={{ marginTop: '30px' }}>
                  <Col align="center" span={24}>

                  </Col>
                </Row>
              </Col>
            </Row>
            <Form.Item label="Paletli Satış (PALET)" style={{ marginTop: '10px' }}>
              <Row align="middle">
                <Col span={4} align="right">
                  <Button type="primary" onClick={event => onRemoveProductCart(data, true, false)}>
                    {removeItem === true ? (< IntlMessages id="---" />) : (<IntlMessages id="-" />)}

                  </Button>
                </Col>
                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                  <Input
                    id={'Paletli' + itemCode}
                    onClick={event => onSelectAll('Paletli' + itemCode)}
                    onChange={event => onChangeQuantity(event, productItem)}
                    style={{ textAlign: "right" }}
                    maxLength={5}
                    defaultValue={0}
                    step={1}
                    value={inputNumberPartialQuantityValue(itemCode)}
                  />
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={event => onAddProductCart(data, true, false)}>
                    {<IntlMessages id="+" />}
                  </Button>
                </Col>
                <Space size={2}>
                  <Col span={4}>
                    <Tag color="blue">
                      1 Palet: {m2Pallet} {unit}
                    </Tag>
                  </Col>
                </Space>
              </Row>
            </Form.Item>
            {canBeSoldPartially === true ? (
              <Form.Item label='Parçalı Satış (KUTU)'>
                <Row align="middle">
                  <Col span={4} align="right">
                    <Button type="primary" onClick={event => onRemoveProductCart(data, true, true)}>
                      {<IntlMessages id="-" />}
                    </Button>
                  </Col>
                  <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                    <Input
                      id={'Parçalı' + itemCode}
                      onClick={event => onSelectAll('Parçalı' + itemCode)}
                      onChange={event => onChangeQuantity(event, productItem, true)}
                      style={{ textAlign: "right" }}
                      maxLength={5}
                      defaultValue={1}
                      step={1}
                      value={inputNumberPartialQuantityValue(itemCode, true)}
                    />
                  </Col>
                  <Col span={4} style={{ width: '100%' }}>
                    <Button type="primary" onClick={event => onAddProductCart(data, true, true)}>
                      {<IntlMessages id="+" />}
                    </Button>
                  </Col>
                  <Space size={5}>
                    <Col span={4}>
                      <Tag color="blue">
                        1 Kutu: {m2Box} {unit}
                      </Tag>
                    </Col>
                    <Tag color="blue">
                      {numberFormat(data.partialPrice)} {"TL"}
                    </Tag>
                  </Space>
                </Row>
              </Form.Item>) : (null)}
            <Table
              columns={columns}
              dataSource={warehouseDataList}
              pagination={false}
              // scroll={{ x: 'max-content' }}
              size="small"
              bordered={false}
            />
            <Row style={{ ...rowStyle, marginTop: '10px' }} gutter={gutter} justify="start">
              <Col span={24} style={colStyle}>
                <Tabs defaultActiveKey="2" type="card" size={"small"}>
                  {/* <TabPane tab="Ürün Açıklaması" key="1">
                    Ürün Açıklaması
                    </TabPane> */}
                  {imageTechnicalFileNames != null > 0 ?
                    <TabPane tab="Teknik Özellik" key="2">
                      {
                        _.map(imageTechnicalFileNames, (imagePathName) =>
                          <Image
                            style={{ width: '100%', margin: '10px' }}
                            src={imageLargeBaseUrl + imagePathName}
                          />)}
                    </TabPane>
                    : null}
                  {campaignImages != null > 0 ?
                    <TabPane tab="Kampanya" key="3">{
                      _.map(campaignImages, (imagePathName) =>
                        <Image
                          style={{ width: '100%', margin: '10px' }}
                          src={imageLargeBaseUrl + imagePathName}
                        />)}
                    </TabPane>
                    : null}
                </Tabs>
              </Col>
            </Row>
          </Box>
        </Col>
      </Row>

    </LayoutWrapper>
  );
}

export default ProductDetail;
