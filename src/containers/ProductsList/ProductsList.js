import React, { useState, useEffect } from "react";
import IntlMessages from "@iso/components/utility/intlMessages";
import Box from "@iso/components/utility/box";
import { SingleCardWrapper } from './Shuffle.styles';
import {Col,Card, Row,Button,Breadcrumb } from "antd";
import siteConfig from "@iso/config/site.config";
import Modals from '@iso/components/Feedback/Modal';
import ModalStyle, { ModalContent } from './Modal.styles';
import { PropTypes } from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import ContentHolder from '@iso/components/utility/contentHolder';
import PageHeader from "@iso/components/utility/pageHeader";
import { direction } from '@iso/lib/helpers/rtl';
import { PoweroffOutlined } from '@ant-design/icons';
import { Footer, Sidebar } from '@iso/components/Algolia/Algolia';
import AlgoliaSearchPageWrapper from './Algolia.styles';
import Searchbar from '@iso/components/Topbar/SearchBox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import Checkbox, { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Input, {
  InputSearch,
  InputGroup,
  Textarea,
} from '@iso/components/uielements/input';
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import basicStyle from '@iso/assets/styles/constants';

import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import data from "../../redux/mail/data";
import fake from './fake';
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";

const margin = {
    margin: direction === 'rtl' ? '0 0 8px 8px' : '0 8px 8px 0',
  };

const { Meta } = Card;
// const { productQuantity, products } = useSelector(state => state.Ecommerce);
const ProductsList = () => {
  
  // console.log('xxxx ürünleri getirdim products',products)
  const history = useHistory();
  
  //Redux ürünler listeleme
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart,changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();
  console.log('xxxx ürünler',products);

  //ProductListHook
  const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray] = 
  useProductData(`${siteConfig.api.products}`, { });//, "from": fromDate , "to": toDate eklenecek...

  console.log('xxxx geliyorum',history.location.productGroupId)
  console.log('xxxx side',Sidebar)
  const listClass = `isoSingleCard card grid`;
  const style = { zIndex: 100 -90 };
  
  //Siderbar component data
  const plainOptions = ['Modern', 'Klasik', 'Otantik'];
  const yuzeyDokusu = ['Mat', 'Parlak'];
  const uygulamaAlani = ['Duvar-Taban', 'Taban', 'Duvar'];
  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };
  const { rowStyle, colStyle, gutter } = basicStyle;

  const defaultCheckedList = ['Modern', 'Klasik', 'Otantik'];

  //InputSearch Filter Event
  const onchangeInputSearch = e => {
    console.log('xxxx inputSearcten geliyorum', e.target.value);
  }
  function selectedProductId (product) {
    console.log('xxxx product Id',product);
    // history.push({
    //   pathname: '/dashboard/productList',
    //   productGroupId: productGroupId,
    // });
    }
  const onSearch = value => {
    console.log('xxxx istenilen değer ile search yapıyorum', value);
  };


  //Product Group Filter Event
  const onChangeProductGroup=e => {
    dispatch(e.target.value);
    console.log('xxxx secilen ürün grubu', e.target.value);
    const data=fake;
      
  };
  function onAddBox (product) {    
    if(productQuantity.length===0){dispatch(addToCart(product));} //Sepete
    else{
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);      
      if(selectedProduct===undefined){
        dispatch(addToCart(product));
      }
      else{
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode=productItem.itemCode
           const quantity=productItem.quantity+1;
            newProductQuantity.push({
              itemCode,
              quantity,
            });
          }     
      });
      dispatch(changeProductQuantity(newProductQuantity));

     
      // });
      // dispatch(changeProductQuantity(newProductQuantity));
    }
      };    
    Modals.success({
      content:
        'Ürün sepete başarılı bir şekilde eklenmiştir.',
      okText: 'Tamam',
      cancelText: 'Cancel',
    });
    };
  
  //
  const onChange = checkedList => {
    //setCheckedList(checkedList);
    // setIndeterminate(
    //   !!checkedList.length && checkedList.length < plainOptions.length
    // );
    // setCheckAll(checkedList.length === plainOptions.length);
    console.log('xxxx product içerisindeyim checkedList.length',checkedList)
  };

  return (
    <AlgoliaSearchPageWrapper className="isoAlgoliaSearchPage">
      <PageHeader>Ürünler Listesi</PageHeader>

      <div className="isoAlgoliaMainWrapper">
        <SidebarWrapper className="isoAlgoliaSidebar">
          <div className="isoAlgoliaSidebarItem">
            <InputSearch placeholder="Ara" // value={search}
          onChange={onchangeInputSearch}
          onSearch={onSearch} />
          </div>
          <div className="isoAlgoliaSidebarItem">
            <h3 className="isoAlgoliaSidebarTitle">Ürün Grubu</h3>
            <RadioGroup  onChange={onChangeProductGroup}>
              <Radio style={radioStyle} value={1}>
                Vitrifiye
                </Radio>
              <Radio style={radioStyle} value={2}>
                Seramik
                </Radio>
              <Radio style={radioStyle} value={3}>
                Yapı Kimyasalları
                </Radio>
              <Radio style={radioStyle} value={4}>
                Banyo Mobilyası
                </Radio>
            </RadioGroup>
          </div>
          <div className="isoAlgoliaSidebarItem">
            <h3 className="isoAlgoliaSidebarTitle">Birim Fiyat</h3>
            <RadioGroup>
              <Radio style={radioStyle} value={1}>
                50 TL/m<sup>2</sup> ve altı
                </Radio>
              <Radio style={radioStyle} value={2}>
                50 TL/m<sup>2</sup> - 200 TL/m<sup>2</sup>
                </Radio>
              <Radio style={radioStyle} value={3}>
                200 TL/m<sup>2</sup> - 400 TL/m<sup>2</sup>
                </Radio>
              <Radio style={radioStyle} value={4}>
                400 TL/m<sup>2</sup> - 650 TL/m<sup>2</sup>
                </Radio>
              <Radio style={radioStyle} value={5}>
                650 TL/m<sup>2</sup> - 1000 TL/m<sup>2</sup>
                </Radio>
              <Radio style={radioStyle} value={6}>
                1000 TL/m<sup>2</sup> ve üstü
                </Radio>
            </RadioGroup>
          </div>

          <div className="isoAlgoliaSidebarItem">
            <h3 className="isoAlgoliaSidebarTitle" style={{ marginBottom: 10 }}>
              Stil
      </h3>
            <div>
              <div
                style={{
                  borderBottom: '1px solid #E9E9E9',
                  paddingBottom: '15px',
                }}
              >
                <CheckboxGroup
                  options={plainOptions}
                  //value={checkedList}
                  onChange={onChange}
                />

              </div>
              <br />
              <Checkbox
              //indeterminate={indeterminate}
              // onChange={onCheckAllChange}
              // checked={checkAll}
              >
                Tümünü Seç
                  </Checkbox>
            </div>
            {/* <RangeSlider attributeName="price" /> */}
          </div>

          <div className="isoAlgoliaSidebarItem">
            <h3 className="isoAlgoliaSidebarTitle">Yüzey Dokusu</h3>
            <CheckboxGroup
              options={yuzeyDokusu}
            // value={checkedList}
            // onChange={onChange}
            />
            {/* <RefinementList attributeName="categories" /> */}
          </div>

          <div className="isoAlgoliaSidebarItem">
            <h3 className="isoAlgoliaSidebarTitle">Uygulama Alanı</h3>
            <CheckboxGroup
              options={uygulamaAlani}
            // value={checkedList}
            // onChange={onChange}
            />
            {/* <RefinementList attributeName="categories" /> */}
            {/* <RefinementList attributeName="brand" withSearchBox /> */}
          </div>        

          {/* <ClearAll /> */}
        </SidebarWrapper>

        <ContentHolder>
          <Breadcrumb>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item>
              <a href="/Dashboard/productGroupList">Ürün Grubu</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Ürünler Listesi</Breadcrumb.Item>
          </Breadcrumb>
          <Box>
            <Row gutter={[24, 16]}>

              {data.map((item) => (
                <SingleCardWrapper className={listClass} style={style} onClick={event => selectedProductId(item.imageUrl)}>
                  <div className="isoCardImage">
                    <img alt="#" src={item.imageUrl} />
                  </div>
                  <div className="isoCardContent">
                    {/* <h3 className="isoCardTitle">{item.title}</h3><h3 className="isoCardDate">{item.title}</h3>
                     */}
                    <Row>
                      <Col span={ 6 } >
                        <h3 className="isoCardTitle">{item.series}</h3>
                      </Col>
                      <Col  span={18} align="right" >
                        <h3 className="isoCardDate">{item.type}</h3>
                      </Col>
                    </Row>
                    <span className="isoCardDate">
                      {item.description}
                    </span>
                    <span className="isoCardDate">
                      {item.color} - {item.surface}
                    </span>
                    <h3 align="center" className="isoCardTitle">{item.listPrice} {"TL"}</h3>
                    <Button
                      type="primary"
                      onClick={event => onAddBox(item)}                      
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
      </div>
      {/* <Footer /> */}

    </AlgoliaSearchPageWrapper>
  );
};

export default ProductsList;
