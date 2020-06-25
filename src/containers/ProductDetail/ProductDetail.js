import React from 'react';
import { Row, Col, Card, Descriptions } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import ContentHolder from '@iso/components/utility/contentHolder';
import IntlMessages from '@iso/components/utility/intlMessages';
import basicStyle from '@iso/assets/styles/constants';
import Form from "@iso/components/uielements/form";
import Tags from '@iso/components/uielements/tag';
import TagWrapper from './tag.styles';
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
const Tag = props => (
    <TagWrapper>
      <Tags {...props}>{props.children}</Tags>
    </TagWrapper>
  );
  
const FormItem = Form.Item;
const ProductDetail = () => {
    const { rowStyle, colStyle, gutter } = basicStyle;
//   const [loading, setloading] = useState(false);
//   const history = useHistory();

  const style = { zIndex: 100 -90 };
  
  return (
      <LayoutWrapper>
          <PageHeader>{<IntlMessages id="uiElements.cards.cards" />}</PageHeader>
          <Row style={rowStyle} gutter={gutter} justify="start">
              <Col md={12} sm={12} xs={24} style={colStyle}>
                  <Box

                  >
                      <ContentHolder>

                      </ContentHolder>
                  </Box>
              </Col>
              <Col md={12} sm={12} xs={24} style={colStyle}>
              <Box
            title={<IntlMessages id={reqJson[0].name} />}         
            
          > 
          <Descriptions>
        <Descriptions.Item label="Ürün Kodu">{reqJson[0].ürünKodu}</Descriptions.Item>
        </Descriptions>
            <Row>
              <Col xs={{ span: 48 }} >
              <Descriptions.Item style={{ color: 'red' }} >{reqJson[0].Fiyat}</Descriptions.Item> 
            </Col> 
            <Col sm={{ span: 4 }} >
            <Descriptions.Item >{"TL"}</Descriptions.Item> 
            </Col>     
            <Col sm={{ span: 3 }} >
            <Tag color="#87d068">Stokta var</Tag>
            </Col>      
            </Row>                 
              
                      <ContentHolder>

                      </ContentHolder>
                  </Box>
              </Col>
          </Row>
          <Row style={rowStyle} gutter={gutter} justify="start">
              <Col span={24} style={colStyle}>
                  <Box

                  >
                      <Row>
                          <ContentHolder style={{ overflow: 'hidden' }}>


                          </ContentHolder>
                      </Row>
                  </Box>
              </Col>
          </Row>
      </LayoutWrapper>
  );
}

export default ProductDetail;
