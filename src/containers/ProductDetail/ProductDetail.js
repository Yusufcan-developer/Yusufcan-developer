import React, { useState, useEffect } from "react";
import { Row, Col, Card, Descriptions,Tabs,Button,Breadcrumb } from 'antd';
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
import siteConfig from "@iso/config/site.config";
import { Link, useHistory } from 'react-router-dom';
import {
  SwiperWithCustomNav,
 
} from '@iso/ui/SwiperSlider';
import {
  customNavSlider,
} from './slider.data';
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
const reqJson = [
  {
    "productGroupId":1,
    "name":"Seramiksan Monte Verde Zeytin Yer Duvar Seramiği 905402",
    "title": "Vitrifiye",
    "ürünKodu":"S2587ASDE",
    "Fiyat":"27,50",
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
  const style = { zIndex: 100 -90 };
  const history = useHistory();
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  // const [productId,setProductId]=useState()  
  const [pageSize, setPageSize] = useState(0)
  const [productGroup,setProductGroup]=useState([])  
  const [dimension,setDimension]=useState([])
  const [color,setColor]=useState([])
  const [surface,setSurface]=useState([])
  const [productionStatus,setProductionStatus]=useState([])
  const [keyword,setKeyword]=useState()

  //Ürün ID getirme
  console.log('xxxx geliyorum',history.location.productId)
  

  useEffect(() => {
    setProductId(history.location.productId)
  }, [history.location.productId]);

    //Product Detail Hook
    const [data, loadingGetApi , setOnChangeGetApi, setProductId] = useGetProductItem(`${siteConfig.api.productDetail}`);
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
          <PageHeader>{<IntlMessages id="Ürün Detayı" />}</PageHeader>
        
      <Row style={rowStyle} gutter={gutter} justify="start">

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
            title={<IntlMessages id={reqJson[0].name} />}

          >
            <Row>
              {<Col span={8}> <Descriptions>
                <Descriptions.Item label="Ürün Kodu"><Tag>{reqJson[0].ürünKodu}</Tag></Descriptions.Item>
              </Descriptions></Col>}
              <Col span={8}><Descriptions>
                <Descriptions.Item label="Serisi"><Tag>{"PLAIN"}</Tag></Descriptions.Item>
              </Descriptions></Col>
              <Col span={8}> <Descriptions>
                <Descriptions.Item label="Üretim Durumu"><Tag color="#87d068"> {"Üretim dışı"}</Tag></Descriptions.Item>
              </Descriptions></Col>
            </Row>
            <Row>
              <Col span={8}> <Descriptions>
                <Descriptions.Item label="Detay"><Tag>{"PARLAK / BEJ TONLARI"}</Tag></Descriptions.Item>
              </Descriptions></Col>
              <Col span={8}><Descriptions>
                <Descriptions.Item label="Boyut"><Tag>{"10x20"}</Tag></Descriptions.Item>
              </Descriptions></Col>

            </Row>
            <Row>
              <Col span={8}>
                <Descriptions.Item style={{ color: 'red' }} >{reqJson[0].Fiyat} {"TL"}</Descriptions.Item>
              </Col>
              <Col span={12}> <h4> Adet    {<InputNumber
                min={1}
                max={1000}
                value={1}
                //value={quantity}
                step={1}
              // onChange={onChange}
              />}
              </h4></Col>

            </Row>
            <Button
              type="primary"
            // onClick={event => onAddBox(item)}
            >  {<IntlMessages id="Sepete Ekle" />}
            </Button>

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
        <div style={style}>10x20</div>
      </Col>
     
    </Row>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row" span={6}>
        <div style={style}>Yüzey:</div>
      </Col>
      <Col >
        <div style={style}>Mat</div>
      </Col>
     
    </Row>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row" span={6}>
        <div style={style}>Renk:</div>
      </Col>
      <Col >
        <div style={style}>Sarı</div>
      </Col>
     
    </Row>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row" span={6}>
        <div style={style}>Tipi:</div>
      </Col>
      <Col >
        <div style={style}>Seramik Duvar</div>
      </Col>
     
    </Row>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row" span={6}>
        <div style={style}>Kenar:</div>
      </Col>
      <Col >
        <div style={style}>REKTEFİYESİZ</div>
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
