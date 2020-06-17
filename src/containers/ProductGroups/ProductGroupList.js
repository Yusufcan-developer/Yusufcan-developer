import React, { useState, useEffect } from "react";
import { Link, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import IntlMessages from "@iso/components/utility/intlMessages";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import PageHeader from "@iso/components/utility/pageHeader";
import { Skeleton, Switch, Card, Avatar, Form, Row, Col, Space } from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Item from "antd/lib/list/Item";


const reqJson = [
  {
    "Id"   :1,
    "title": "Vitrifiye",
    "description": "(Vitrifiye ürün grubu)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/ardesia_final_35159.jpg",
  },
  {
    "Id"   :2,
    "title": "Karo",
    "description": "(Karo ürün grubu)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/alves_final_14c24.jpg",
  },
  {
    "Id"   :3,
    "title": "Yapı Kimyasalları",
    "description": "Yapı Kimyasalları ürün grubu)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/aqua3_3f712.jpg",
  },
  {
    "Id"   :4,
    "title": "Banyo mobilyası",
    "description": "(Banyo mobilyası ürün grubu)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/betonmekan_0856e.jpg",
  },

];

const { Meta } = Card;

const ProductGroupList = () => {
  const history = useHistory();
  const [loading, setloading] = useState(false);
 
  function selectedProductGroup (index) {
    console.log('xxxx product Id',index);
    
    history.push('/dashboard/producstList');
    }
  return (
    <LayoutWrapper>
      <PageHeader>Ürün Grubu</PageHeader>

      <Box>
      {/**Model Json */}
      <Row gutter={[24, 16]}>

        {reqJson.map((item) => (
          
          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              hoverable
              style={{ width: 300, marginTop: 16 }}
              loading={false}
              onClick={event=> selectedProductGroup(item.Id)}
              cover={
                <img
                  alt="example"
                  src= {item.imageUrl}
                />
              }
            >
              <Meta
                title={item.title}
                description={item.description}
              />
            </Card>
          </Col>
        ))}

      </Row>
    </Box>
    </LayoutWrapper>
  );
};

export default ProductGroupList;