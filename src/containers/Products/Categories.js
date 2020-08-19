import React, { useState, useEffect } from "react";
import { Link, useHistory } from 'react-router-dom';

import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import PageHeader from "@iso/components/utility/pageHeader";

import { Card, Row, Col } from "antd";

//Kategoriler verisi.
const categories = [
  {
    "Id": "VİTRİFİYE (SSG)",
    "title": "VİTRİFİYE (SSG)",
    "description": "Lavabo, Klozet, Bide, Pisuvar, Helataşı, Bedensel Engelli Ürünler",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/alves_final_14c24.jpg",
  },
  {
    "Id": "KARO",
    "title": "Karo",
    "description": "Banyo, Mutfak, İç ve Dış Mekanlar, Ticari Mekan",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/ardesia_final_35159.jpg",
  },
  {
    "Id": "YAPI KİMYASALLARI",
    "title": "Yapı Kimyasalları",
    "description": "Cerafix, Cerabond, Ceraflex, Cerafill, Çimento Esaslı Yapıştırma Harçları",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/aqua3_3f712.jpg",
  },
  {
    "Id": "BANYO MOBİLYASI",
    "title": "Banyo Mobilyası",
    "description": "Banyo Mobilyası Ürün Grubu (Lorem ipsum dolor sit amet, consectetur)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/betonmekan_0856e.jpg",
  },

];

const { Meta } = Card;

const ProductGroupList = () => {

  const history = useHistory();
  const [loading, setloading] = useState(false);
  return (
    <LayoutWrapper>
      <PageHeader>Sipariş İçin Ürün Grubu Seçiniz</PageHeader>
      <Box>
        <Row gutter={[24, 16]}>
          {categories.map((item) => (
            <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            {/* Seçilen kategori grubuna göre Id alınıp ürün listeleme sayfasına geçiyor.*/}
              <Link to={`${'/products/search'}/?pg=${item.Id}`}>
                <Card
                  hoverable
                  style={{ width: 300, marginTop: 16 }}
                  loading={false}
                  cover={
                    < img
                      alt="example"
                      src={item.imageUrl}
                      style={{ height: '180px' }}
                    />
                  }
                >
                  <Meta
                    title={item.title}
                    description={item.description}
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Box>
    </LayoutWrapper>
  );
};

export default ProductGroupList;