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
import _ from 'underscore';

//Fetch
import { useGetProductItem } from "@iso/lib/hooks/fetchData/useGetProductItem";
import { useGetWarehouseData } from "@iso/lib/hooks/fetchData/useGetWarehouseData";

//Configs
import siteConfig from "@iso/config/site.config";
// import noImage from '@iso/assets/images/noImage.png';
import numberFormat from "@iso/config/numberFormat";

//Styles
import PageHeader from '@iso/components/utility/pageHeader';
import basicStyle from '@iso/assets/styles/constants';
import Form from "@iso/components/uielements/form";
import { LinkOutlined} from '@ant-design/icons';

const { TabPane } = Tabs;

const ProductDetail = () => {

  const dispatch = useDispatch();
  const { productId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogImageId, setDialogImageId] = useState(0);
  const [sliderImageUrl, setSliderImageUrl] = useState();
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
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;

  //Product Detail Hook
  const [loadingGetApi, description, itemCode, series, productionStatus, surface, color, dimension, productItem, type, rectifying, listPrice, imageUrl, unit, canBeSoldPartially, notes, campaignImages, imageThumbBaseUrl, imageMediumBaseUrl, imageGeneralFileNames, imageTechnicalFileNames, imageOriginalBaseUrl,imageLargeBaseUrl] = useGetProductItem(`${siteConfig.api.products.getProductDetail}${productId}`);
  const [warehouseData] = useGetWarehouseData(`${siteConfig.api.warehouse}${productId}`);

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
  function onRemoveProductCart(product) {
    inputNumberShowOrHide(product)
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
    if (selectedProduct.quantity !== 1) {
      const newProductQuantity = [];
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = productItem.quantity - 1;
          newProductQuantity.push({
            itemCode,
            quantity,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
    }
  };

  //Adding products to the cart
  function onAddProductCart(product) {
    inputNumberShowOrHide()
    if ((productQuantity.length === 0) || (productQuantity.find(item => item.itemCode == product.itemCode) === undefined)) { dispatch(addToCart(product, 1)); notification.info({ message: 'Sepet', description: 'Ürün Sepete Eklenmiştir', placement: 'bottomRight' }); } //Sepete
    else {
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      const newProductQuantity = [];
      const selectedQuantity = quantity;
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode
          const quantity = productItem.quantity + 1;
          newProductQuantity.push({
            itemCode,
            quantity,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
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
  function onChangeQuantity(event, productItem) {
    if (event.target.value > 0) {
      const product = productItem;

      var selectedProduct = productQuantity.find(item => item.itemCode == productId);
      const newProductQuantity = [];
      setQuantity(event.target.value)
      productQuantity.forEach(productItem => {
        if (productItem.itemCode !== selectedProduct.itemCode) {
          newProductQuantity.push(productItem);
        } else {
          const itemCode = productItem.itemCode;
          const quantity = parseInt(event.target.value);
          newProductQuantity.push({
            itemCode,
            quantity,
          });
        }
      });
      dispatch(changeProductQuantity(newProductQuantity));
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
          <Link to="/products/search">Ürünler listesi</Link></Breadcrumb.Item>
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
          <Button  size="small" style={{ marginBottom: '5px' }  } onClick={event =>   history.push(`${'/admin/products/photos'}/${productId}`)}
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
                    {!inputNumberShowOrHide(productItem) ? (
                      <Button type="primary" onClick={event => onAddProductCart(productItem)}>
                        {<IntlMessages id="Sepete Ekle" />}
                      </Button>
                    ) : (
                        <Row align="middle">
                          <Col span={6} style={{ width: '100%' }} align="right" offset={2}>
                            <Button type="primary" onClick={event => onRemoveProductCart(productItem)}>
                              {<IntlMessages id="-" />}
                            </Button>
                          </Col>
                          <Col span={8}>
                            <Input
                              id={'quantityText'}
                              min={1}
                              max={1000}
                              defaultValue={1}
                              value={inputNumberQuantityValue(productItem)}
                              step={1}
                              style={{ textAlign: "right" }}
                              onClick={event => onSelectAll('quantityText')}
                              onChange={event => onChangeQuantity(event, productItem)}
                            />
                          </Col>
                          <Col span={6} style={{ width: '100%' }} align="left">
                            <Button type="primary" onClick={event => onAddProductCart(productItem)}>
                              {<IntlMessages id="+" />}
                            </Button>
                          </Col>
                        </Row>
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={warehouseData}
              pagination={false}
              // scroll={{ x: 'max-content' }}
              size="small"
              bordered={false}
            />
            <Row style={{ ...rowStyle, marginTop: '10px' }} gutter={gutter} justify="start">
              <Col span={24} style={colStyle}>
                <Tabs defaultActiveKey="1" type="card" size={"small"}>
                  <TabPane tab="Ürün Açıklaması" key="1">
                    Ürün Açıklaması
                    </TabPane>
                  <TabPane tab="Teknik Özellik" key="2">
                    {
                      _.map(imageTechnicalFileNames, (imagePathName) =>
                        <Image
                          style={{ width: '100%', margin: '10px' }}
                          src={imageLargeBaseUrl + imagePathName}
                        />)}
                  </TabPane>
                  <TabPane tab="Kampanya" key="3">{
                    _.map(campaignImages, (imagePathName) =>
                      <Image
                        style={{ width: '100%', margin: '10px' }}
                        src={imageLargeBaseUrl + imagePathName}
                      />)}
                  </TabPane>
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
