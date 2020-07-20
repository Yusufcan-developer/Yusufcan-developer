import React, { useState, useEffect } from "react";
import { Row, Col, Descriptions, Tabs, Button, Breadcrumb, notification, Table } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import IntlMessages from '@iso/components/utility/intlMessages';
import basicStyle from '@iso/assets/styles/constants';
import Form from "@iso/components/uielements/form";
import Tags from '@iso/components/uielements/tag';
import TagWrapper from './tag.styles';
import { useGetProductItem } from "@iso/lib/hooks/fetchData/useGetProductItem";
import { useGetWarehouseData } from "@iso/lib/hooks/fetchData/useGetWarehouseData";
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import siteConfig from "@iso/config/site.config";
import { Link, useHistory, useRouteMatch, useParams } from 'react-router-dom';
import { SwiperWithCustomNav } from '@iso/ui/SwiperSlider';
import Input from '@iso/components/uielements/input';

const { TabPane } = Tabs;
const Tag = props => (
  <TagWrapper>
    <Tags {...props}>{props.children}</Tags>
  </TagWrapper>
);

const FormItem = Form.Item;
const ProductDetail = () => {

  const { rowStyle, colStyle, gutter } = basicStyle;
  const style = { zIndex: 100 - 90 };
  const history = useHistory();
  const [quantity, setQuantity] = useState(1)
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const { productId } = useParams();

  //History özelliği
  //const productId1 = history.location.productId;

  //Product Detail Hook
  const [loadingGetApi, description, itemCode, series, productionStatus, surface, color, dimension, productItem, type, rectifying, listPrice, imageUrl, unit, canBeSoldPartially] = useGetProductItem(`${siteConfig.api.productDetail}${productId}`);
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

  function onRemoveBox(product) {
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
  //Add product basket
  function onAddBox(product) {
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
  function inputNumberQuantityValue() {
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    if (selectedProduct === undefined) {
      return 1
    }
    else {
      return selectedProduct.quantity;
    }
  }
  //Redux product quantity change event
  function onChangeQuantity(event, productItem) {
    const product = productItem;
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    const newProductQuantity = [];
    setQuantity(event)
    productQuantity.forEach(productItem => {
      if (productItem.itemCode !== selectedProduct.itemCode) {
        newProductQuantity.push(productItem);
      } else {
        const itemCode = productItem.itemCode
        const quantity = event;
        newProductQuantity.push({
          itemCode,
          quantity,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
  };

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
    },
  ];
  const layout = {
    labelCol: { span: 8, },
    wrapperCol: { span: 16 },
  };

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
        <PageHeader>{<Descriptions title={"Ürün Detayı -", description}></Descriptions>}</PageHeader>
        <Col md={12} sm={12} xs={24} style={colStyle}>
          <Box>
            <SwiperWithCustomNav prevButtonText={"geri"}>
              <img
                key={`customnav-slider--key${imageUrl}`}
                src={imageUrl}
                height="500px"
              />
            </SwiperWithCustomNav>
          </Box>
        </Col>
        <Col md={12} sm={12} xs={24} style={colStyle}>
          <Box>
            <Row>
              <Col span={12}>
                <Form {...layout}>
                  <Form.Item label="Ürün Kodu">
                    <span className="ant-form-text">{itemCode === null ? '-' : itemCode}</span>
                  </Form.Item>
                  <Form.Item label="Serisi">
                    <span className="ant-form-text">{series === null ? '-' : series}</span>
                  </Form.Item>
                  <Form.Item label="Üretim Durumu">
                    <span className="ant-form-text">{productionStatus === null ? '-' : productionStatus}</span>
                  </Form.Item>
                  <Form.Item label="Renk">
                    <span className="ant-form-text">{color === null ? '-' : color}</span>
                  </Form.Item>
                  <Form.Item label="Ebat">
                    <span className="ant-form-text">{dimension === null ? '-' : dimension}</span>
                  </Form.Item>
                  <Form.Item label="Not">
                    <span className="ant-form-text">{canBeSoldPartially != true ? '-' : 'Parçalı satılabilir'}</span>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={12}>
                <Row style={{ marginTop: '30px' }}>
                  <Col align="center" span={24}>
                    <span style={{ fontSize: '35px' }}><strong>{listPrice}</strong> {"TL"}</span>
                  </Col>
                </Row>
                <Row style={{ marginTop: '30px' }}>
                  <Col align="center" span={24}>
                    {!inputNumberShowOrHide(productItem) ? (
                      <Button type="primary" onClick={event => onAddBox(productItem)}>
                        {<IntlMessages id="Sepete Ekle" />}
                      </Button>
                    ) : (
                        <Row align="middle">
                          <Col span={6} style={{ width: '100%' }} align="right" offset={2}>
                            <Button type="primary" onClick={event => onRemoveBox(productItem)}>
                              {<IntlMessages id="-" />}
                            </Button>
                          </Col>
                          <Col span={8}>
                            <Input
                              min={1}
                              max={1000}
                              defaultValue={1}
                              value={inputNumberQuantityValue(productItem)}
                              step={1}
                              style={{ textAlign: "right" }}
                              onChange={event => onChangeQuantity(event, productItem)}
                            />
                          </Col>
                          <Col span={6} style={{ width: '100%' }} align="left">
                            <Button type="primary" onClick={event => onAddBox(productItem)}>
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
                    <Form.Item label="Ebat">
                      <span className="ant-form-text">{dimension === null ? '-' : dimension}</span>
                    </Form.Item>
                    <Form.Item label="Yüzey">
                      <span className="ant-form-text">{surface === null ? '-' : surface}</span>
                    </Form.Item>
                    <Form.Item label="Renk">
                      <span className="ant-form-text">{color === null ? '-' : color}</span>
                    </Form.Item>
                    <Form.Item label="Tipi">
                      <span className="ant-form-text">{type === null ? '-' : type}</span>
                    </Form.Item>
                    <Form.Item label="Kenar">
                      <span className="ant-form-text">{rectifying === null ? '-' : rectifying}</span>
                    </Form.Item>
                  </TabPane>
                  <TabPane tab="Kampanya" key="3">
                    Kampanya
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
