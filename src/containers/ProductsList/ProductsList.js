import React, { useState, useEffect } from "react";
import IntlMessages from "@iso/components/utility/intlMessages";
import Box from "@iso/components/utility/box";
import { SingleCardWrapper } from './Shuffle.styles';
import {Card, Row,Button } from "antd";
import ContentHolder from '@iso/components/utility/contentHolder';
import { direction } from '@iso/lib/helpers/rtl';
import { PoweroffOutlined } from '@ant-design/icons';
import { Footer, Sidebar } from '@iso/components/Algolia/Algolia';
import AlgoliaSearchPageWrapper from './Algolia.styles';

const margin = {
    margin: direction === 'rtl' ? '0 0 8px 8px' : '0 8px 8px 0',
  };
const reqJson = [
  {
    "title": "Ocean",
    "description": "Ürün Kodu 650873 (60 x 120)",
    "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
  },
  {
    "title": "Ocean 2",
    "description": "Ürün Kodu 650874 (50 x 85)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/201332610361152617.jpg",
  },
  {
    "title": "Angora",
    "description": "Ürün Kodu 380485 (75 x 75)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/angora_7b9b7.jpg",
  },
  {
    "title": "Asia",
    "description": "Ürün Kodu 118656 (75 x 75)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/asia_c9a2f.jpg",
  },
  {
    "title": "Asia 2",
    "description": "Ürün Kodu 118655 (50 x 50)",
    "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/seramik_2b41c.jpg",
  },
  {
    "title": "Brillant",
    "description": "Ürün Kodu 218408 (75 x 75)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/brillant_e1231.jpg",
  },
  {
    "title": "Grit",
    "description": "Ürün Kodu 2185010 (50 x 50)",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/grit_final_8a628.jpg",
  },
  {
    "title": "Hardy",
    "description": "Ürün Kodu 919616 (60 x 60)-20 mm",
    "imageUrl": "https://www.seramiksan.com.tr/images/seriler/hardy_06b33.jpg",
  },
];

const Cards = () => {
  const listClass = `isoSingleCard card grid`;
  const style = { zIndex: 100 -90 };
  return (
    <ContentHolder>
    <Box>
      <Row gutter={[24, 16]}>

        {reqJson.map((item) => (
          <SingleCardWrapper className={listClass} style={style}>
          <div className="isoCardImage">
            <img alt="#" src={item.imageUrl} />
          </div>
          <div className="isoCardContent">
            <h3 className="isoCardTitle">{item.title}</h3>
            <span className="isoCardDate">
              {item.description}
            </span>
            <Button
                          type="primary"
                          // icon={<PoweroffOutlined />}
                      >  {<IntlMessages id="Sepete Ekle" />}
                      </Button>
          </div>
          {/* <button className="isoDeleteBtn" onClick={this.props.clickHandler}>
            <Icon type="close" />
          </button> */}
          
        </SingleCardWrapper>
        ))}

      </Row>
    </Box>
    </ContentHolder>
  );
};

const { Meta } = Card;

const ProductsList = () => {
  const [loading, setloading] = useState(false);

  return (
    <AlgoliaSearchPageWrapper className="isoAlgoliaSearchPage">
      
          <div className="isoAlgoliaMainWrapper">
            <Sidebar />
            <Cards />
          </div>
          {/* <Footer /> */}
      
    </AlgoliaSearchPageWrapper>
  );
};

export default ProductsList;
