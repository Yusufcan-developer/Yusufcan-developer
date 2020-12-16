//React
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import PageHeader from "@iso/components/utility/pageHeader";
import { Card, Row, Col } from "antd";
import TopbarAddtoCart from '../Topbar/TopbarAddToCart';
import TopbarNotification from '../Topbar/TopbarNotification';
import viewType from '@iso/config/viewType';

const { Meta } = Card;

//Kategoriler Grup Bilgisi.
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
    "description": "Teknik Granit, Porselen, Yer karosu, Duvar karosu, Dekor, Serastep",
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
    "description": "Banyo Mobilyası Ürün Grubu ",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/betonmekan_0856e.jpg",
  },

];

const ProductGroupList = () => {
  document.title = "Kategoriler - Seramiksan B2B";
  let products = localStorage.getItem('cartProductQuantity');

  TopbarAddtoCart();
  TopbarNotification();
  const view = viewType('Categories');
  return (
    <LayoutWrapper>
      <PageHeader>Sipariş İçin Ürün Grubu Seçiniz</PageHeader>
      <Box>

        <Row gutter={[24, 16]}>
          {categories.map((item) => (
            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
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
                  {view === 'MobileView' ? <Meta
                    style={{ textAlign: 'center' }}
                    title={item.title}
                    description={item.description}
                  /> : <Meta
                      title={item.title}
                      description={item.description} />}
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