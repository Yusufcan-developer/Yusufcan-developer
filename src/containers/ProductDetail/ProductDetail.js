import React, { useState, useEffect } from "react";
import { Row, Col, Card, Descriptions, Tabs, Button, Breadcrumb } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import ContentHolder from '@iso/components/utility/contentHolder';
import IntlMessages from '@iso/components/utility/intlMessages';
import basicStyle from '@iso/assets/styles/constants';
import Form from "@iso/components/uielements/form";
import Tags from '@iso/components/uielements/tag';
import TagWrapper from './tag.styles';
import InputNumber from '@iso/components/uielements/InputNumber';
import { useGetProductItem } from "@iso/lib/hooks/fetchData/useGetProductItem";
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import siteConfig from "@iso/config/site.config";
import { Link, useHistory } from 'react-router-dom';
import Modals from '@iso/components/Feedback/Modal';
import {
  SwiperWithCustomNav,

} from '@iso/ui/SwiperSlider';
import {
  customNavSlider,
} from './slider.data';
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
const reqJson = [
  {
    "productGroupId": 1,
    "name": "Seramiksan Monte Verde Zeytin Yer Duvar Seramiği 905402",
    "title": "Vitrifiye",
    "ürünKodu": "S2587ASDE",
    "Fiyat": "27,50",
    "description": "Ürün Kodu 650873 (60 x 120)",
    "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
  },
];
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

  //Ürün ID getirme
  console.log('xxxx geliyorum', history.location.productId)
  const productId = history.location.productId;

  //Product Detail Hook
  const [loadingGetApi, description, itemCode, series, productionStatus, surface, color, dimension, productData, type, rectifying, listPrice] = useGetProductItem(`${siteConfig.api.productDetail}${history.location.productId}`);
  const onChange = value => {
    setQuantity(value);
    const product=productData;
    if (productQuantity.length === 0) { dispatch(addToCart(product,value)); } //Sepete
    else {
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      if (selectedProduct === undefined) {
        dispatch(addToCart(product));
      }
      else {
        const newProductQuantity = [];
        const selectedQuantity=value;
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

  //Add product basket
  function onAddBox(product) {
    inputNumberShowOrHide()
    if (productQuantity.length === 0) { dispatch(addToCart(product,quantity)); } //Sepete
    else {
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      if (selectedProduct === undefined) {
        dispatch(addToCart(product));
      }
      else {
        const newProductQuantity = [];
        const selectedQuantity=quantity;
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
    Modals.success({
      content:
        'Ürün sepete başarılı bir şekilde eklenmiştir.',
      okText: 'Tamam',
      cancelText: 'Cancel',
    });
  };
  function inputNumberShowOrHide()
  {
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    if (selectedProduct === undefined) {
      return false;
    }
    else { return true; }
  }
  function inputNumberQuantityValue()
  { 
    var selectedProduct = productQuantity.find(item => item.itemCode == productId);
    if (selectedProduct === undefined) {
      return 1
    }
    else {
      return selectedProduct.quantity;
    }   
  }
  //Redux product quantity change event
  function onChangeQuantity(event,productData) {
    const product = productData;
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
  return (
    <LayoutWrapper>
      <Breadcrumb>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="/Dashboard/productGroupList">Ürün Grubu</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item> <a href="/Dashboard/productGroupList">Ürünler Listesi</a></Breadcrumb.Item>
        <Breadcrumb.Item>Ürün Detayı</Breadcrumb.Item>
      </Breadcrumb>

      <Row style={rowStyle} gutter={gutter} justify="start">
        <PageHeader>{<Descriptions title={"Ürün Detayı -", description}></Descriptions>}</PageHeader>
        <Col md={12} sm={12} xs={24} style={colStyle}>

          <Box >

            <SwiperWithCustomNav prevButtonText={"geri"}>
              {customNavSlider.map(item => (
                <img
                  key={`customnav-slider--key${item.id}`}
                  src={item.thumb_url}
                  alt={item.title}
                />
              ))}
            </SwiperWithCustomNav>
          </Box>
        </Col>
        <Col md={12} sm={12} xs={24} style={colStyle}>
          <Box
          // title={<IntlMessages id={"description"} description={description}/>}

          >
            <Row>
              {<Col span={8}> <Descriptions>
                <Descriptions.Item label="Ürün Kodu"><Tag>{itemCode}</Tag></Descriptions.Item>
              </Descriptions></Col>}
              <Col span={8}><Descriptions>
                <Descriptions.Item label="Serisi"><Tag>{series}</Tag></Descriptions.Item>
              </Descriptions></Col>
              <Col span={8}> <Descriptions>
                <Descriptions.Item label="Üretim Durumu"><Tag color="#87d068"> {productionStatus}</Tag></Descriptions.Item>
              </Descriptions></Col>
            </Row>
            <Row>
              <Col span={8}> <Descriptions>
                <Descriptions.Item label="Renk"> <Tag>{color}</Tag></Descriptions.Item>
              </Descriptions></Col>
              <Col span={8}><Descriptions>
                <Descriptions.Item label="Boyut"><Tag>{dimension}</Tag></Descriptions.Item>
              </Descriptions></Col>

            </Row>
            <Row>
              <Col span={8}>
                <Descriptions.Item style={{ color: 'red' }} >{listPrice} {"TL"}</Descriptions.Item>
              </Col>
              <Col span={12}>    
                {!inputNumberShowOrHide(productData) ? (
                  <Button
                    type="primary"
                    onClick={event => onAddBox(productData)}
                  >  {<IntlMessages id="Sepete Ekle" />}
                  </Button>
                ) : (
                    <InputNumber
                      min={1}
                      max={1000}
                      defaultValue={1}
                      value={inputNumberQuantityValue()}
                      step={1}
                      onChange={event => onChangeQuantity(event, productData)}
                    />
                  )}              
              </Col>
            </Row>     

          </Box>
        </Col>
      </Row>
      <Row style={rowStyle} gutter={gutter} justify="start">
        <Col span={24} style={colStyle}>
          <Box
          >
            <Row>

              <Tabs defaultActiveKey="1" type="card" size={"small"}>
                <TabPane tab="Ürün Açıklaması" key="1">
                  Content of card tab 1
          </TabPane>
                <TabPane tab="Teknik Özellik" key="2">
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={6}>
                      <div style={style}>Ebat:</div>
                    </Col>
                    <Col >
                      <div style={style}>{dimension}</div>
                    </Col>

                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={6}>
                      <div style={style}>Yüzey:</div>
                    </Col>
                    <Col >
                      <div style={style}>{surface}</div>
                    </Col>

                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={6}>
                      <div style={style}>Renk:</div>
                    </Col>
                    <Col >
                      <div style={style}>{color}</div>
                    </Col>

                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={6}>
                      <div style={style}>Tipi:</div>
                    </Col>
                    <Col >
                      <div style={style}>{type}</div>
                    </Col>

                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={6}>
                      <div style={style}>Kenar:</div>
                    </Col>
                    <Col >
                      <div style={style}>{rectifying}</div>
                    </Col>

                  </Row>
                </TabPane>
              </Tabs>

            </Row>
          </Box>
        </Col>
      </Row>
    </LayoutWrapper>
  );
}

export default ProductDetail;
