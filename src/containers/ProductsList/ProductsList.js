import React, { useState, useEffect } from "react";
import IntlMessages from "@iso/components/utility/intlMessages";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import _ from 'underscore';
import { notification } from "@iso/components/index";
import Modal from '@iso/ui/Antd/Modal/Modal';
import { SingleCardWrapper } from './Shuffle.styles';
import { Col, Card, Row, Button, Breadcrumb, Pagination, Collapse, Spin, Badge } from "antd";
import siteConfig from "@iso/config/site.config";
import Modals from '@iso/components/Feedback/Modal';
import InputNumber from '@iso/components/uielements/InputNumber';
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
import filterActions from '@iso/redux/filter/actions';
import data from "../../redux/mail/data";
import fake from './fake';
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";

const margin = {
  margin: direction === 'rtl' ? '0 0 8px 8px' : '0 8px 8px 0',
};
const { Panel } = Collapse;
const FormItem = Form.Item;

const { Meta } = Card;

const ProductsList = () => {
  const [inputNumberShow, setInputNumberShow] = React.useState(false);
  const [addCartLoading, setAddCartLoading] = React.useState(false);
  const history = useHistory();
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8)
  const [quantity, setQuantity] = useState(1)
  const [productGroup, setProductGroup] = useState([history.location.productGroupId])
  const [dimension, setDimension] = useState([])
  const [color, setColor] = useState([])
  const [surface, setSurface] = useState([])
  const [productionStatus, setProductionStatus] = useState([])
  const [keyword, setKeyword] = useState()
  const [ locationKeys, setLocationKeys ] = useState([])

  useEffect(() => {
    return history.listen(location => {
      if (history.action === 'PUSH') {
        setLocationKeys([ location.key ])
        console.log('xxxx ileri gittim')
      }
  
      if (history.action === 'POP') {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([ _, ...keys ]) => keys)
  
          console.log('xxxx ileri gittim')
  
        } else {
          setLocationKeys((keys) => [ location.key, ...keys ])
  
          console.log('xxxx geri gittim')
  
        }
      }
    })
  }, [ locationKeys, ])
  useEffect(() => {
    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  useEffect(() => {
    setChangePageSize(pageSize);
  }, [pageSize]);

  //Redux ürünler listeleme
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { filters } = useSelector(state => state.Filters);
  if(filters.length>0){console.log('xxxx fils',filters)}
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;
  const { addToFilter, changeFilter } = filterActions;

  const dispatch = useDispatch();

  //ProductListHook
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray] =
    useProductData(`${siteConfig.api.products}`, { "keyword": keyword, "productionStatus": productionStatus, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": productGroup, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });

  //Ürün Grubu 
  const [productGroupData] = useFilterData(`${siteConfig.api.productGroup}`);

  //Boyutlar
  const [dimensionData] = useFilterData(`${siteConfig.api.dimensions}`);

  //Renkler
  const [colorData] = useFilterData(`${siteConfig.api.colors}`);

  //Yüzeyler
  const [surfaceData] = useFilterData(`${siteConfig.api.surfaces}`);

  //Durumlar
  const [productionStatusData] = useFilterData(`${siteConfig.api.productionStatusData}`);

  //Ürün grubu adı getirme
  console.log('info product GroupId', history.location.productGroupId)

  const listClass = `isoSingleCard card grid`;
  const style = { zIndex: 100 - 90 };
  const expandIconPosition = "left";

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  //InputSearch Filter Event
  const onchangeInputSearch = e => {
    setKeyword(e.target.value);
  }

  const keyPress = e => {
    if (e.keyCode == 13) {
      return setOnChange(true);
    }
  }
  ///
  const onSearch = e => {
    console.log('xxxx inputSearcten geliyorum', keyword);
    return setOnChange(true);
  }

  function onchangePagination(page, pageSize) {
    setPageSize(pageSize);
    setlocalCurrentPage(page);
  };

  //Product Group Filter Event
  function onChangeProductGroup(checkedProductGroupValue) {
    setProductGroup(checkedProductGroupValue)
    onAddFilterRedux('ProductGroup',checkedProductGroupValue)
    if (productGroup.length > 0) { return setOnChange(true); }
  };
  //Dimension Filter Event
  function onChangeDimension(checkedDimensionValue) {
    setDimension(checkedDimensionValue)
    onAddFilterRedux('Dimension',checkedDimensionValue)
    return setOnChange(true);
  };

  //Color Filter Event
  function onChangeColor(checkedColorValue) {
    setColor(checkedColorValue)
    return setOnChange(true);
  }

  //Surface Filter Event
  function onChangeSurface(checkedSurfaceValue) {
    setSurface(checkedSurfaceValue)
    return setOnChange(true);
  }

  //productionStatus Filter Event
  function onChangeProductionStatus(checkedProductionStatusValue) {
    setProductionStatus(checkedProductionStatusValue)
    return setOnChange(true);
  }
  function selectedProductId(productId) {
    console.log('info selected productId', productId);
    history.push({
      pathname: '/products/detail',
      productId: productId,
    });
  }
  function inputNumberShowOrHide(value) {
    var selectedProduct = productQuantity.find(item => item.itemCode == value.itemCode);
    if (selectedProduct === undefined) {
      return false;
    }
    else { return true; }
  }
  function onRemoveBox(product) {
    inputNumberShowOrHide(product)
    setAddCartLoading(true);
      var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
      if(selectedProduct.quantity!==1)
      {
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

  function onAddFilterRedux(groupName,checkedProductGroupValue) {
    const filterType = groupName;
    // if (filters.length === 0) { dispatch(addToFilter(filterType, checkedProductGroupValue)); }
    // else {
    //   console.log('xxxx secilen grup',checkedProductGroupValue)
    const tileset = _.find(filters, function (item) { return item.filterType === groupName; });
    if (tileset) { console.log('xxxx tileSet',tileset.filterValue); dispatch(changeFilter(filterType, checkedProductGroupValue)); }
   
    //Yeni Filter Grubu Ekleme işlemi
    else { dispatch(addToFilter(filterType, checkedProductGroupValue)); }
  };

  function onAddBox(product) {
    inputNumberShowOrHide(product)
    setAddCartLoading(true);

    if ((productQuantity.length === 0)||(productQuantity.find(item => item.itemCode == product.itemCode)===undefined)) { dispatch(addToCart(product, 1)); notification('info', 'Ürün Sepete Eklenmiştir'); } //Sepete
    else {
        const selectedProduct=productQuantity.find(item => item.itemCode == product.itemCode);
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode;
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
 

  //Input Number return quantity value
  function inputNumberQuantityValue(product) {
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
    if (selectedProduct === undefined) {
      return 1
    }
    else {
      return selectedProduct.quantity;
    }
  }
  //Redux product quantity change event
  function onChangeQuantity(event, productData) {
  
    const product = productData;    
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
    const newProductQuantity = [];
    console.log('xxxx e',event.target.value);
    setQuantity(parseInt(event.target.value));
    productQuantity.forEach(productItem => {
      if (productItem.itemCode !== selectedProduct.itemCode) {
        newProductQuantity.push(productItem);
      } else {
        const itemCode = productItem.itemCode
        const quantity = parseInt(event.target.value);
        newProductQuantity.push({
          itemCode,
          quantity,
        });
      }
    });
    dispatch(changeProductQuantity(newProductQuantity));
    
  };
  //
  const onChange = checkedList => {
    //setCheckedList(checkedList);
    // setIndeterminate(
    //   !!checkedList.length && checkedList.length < plainOptions.length
    // );
    // setCheckAll(checkedList.length === plainOptions.length);
  };

  return (
    <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link></Breadcrumb.Item>
        <Breadcrumb.Item >
          <Link to="/products/categories">Ürün Grubu</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Ürünler Listesi</Breadcrumb.Item>
      </Breadcrumb>
      <AlgoliaSearchPageWrapper className="isoAlgoliaSearchPage">
        <PageHeader>Ürünler Listesi</PageHeader>
        <div className="isoAlgoliaMainWrapper">
          <SidebarWrapper className="isoAlgoliaSidebar">
            <div className="isoAlgoliaSidebarItem">
              <InputSearch placeholder="Ara" // value={search}
                onChange={onchangeInputSearch}
                onSearch={onSearch}
                onKeyDown={keyPress} />
            </div>
            <div >
              <Collapse accordion expandIconPosition={expandIconPosition}>
                <Panel header={<IntlMessages id="Ürün Grubu" />} key="0">
                  <CheckboxGroup
                    options={productGroupData}
                    value={productGroup}
                    onChange={onChangeProductGroup}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            </div>
            <div>
              <Collapse accordion expandIconPosition={expandIconPosition}>
                <Panel header={<IntlMessages id="Boyut" />} key="1">
                  <CheckboxGroup
                    options={
                    dimensionData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeDimension}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            </div>
            <div >
              <Collapse accordion expandIconPosition={expandIconPosition}>
                <Panel header={<IntlMessages id="Renkler" />} key="2">
                  <CheckboxGroup
                    options={
                      colorData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeColor}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            </div>
            <div >
              <Collapse accordion expandIconPosition={expandIconPosition}>
                <Panel header={<IntlMessages id="Yüzeyler" />} key="3">
                  <CheckboxGroup
                    options={
                      surfaceData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeSurface}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            </div>
            <div>
              <Collapse accordion expandIconPosition={expandIconPosition}>
                <Panel header={<IntlMessages id="Üretim Durumu" />} key="4">
                  <CheckboxGroup
                    options={
                      productionStatusData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeProductionStatus}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            </div>

            {/* <ClearAll /> */}
          </SidebarWrapper>
          <ContentHolder>

            <Row>
              <Col span={8} offset={16} align="right" >
                {totalDataCount > 0 &&
                  <h4>
                    {totalDataCount} adet sonuç bulundu
        </h4>}
              </Col>
            </Row>
            <Box>
              <Spin spinning={loading}>
                <Row gutter={[24, 16]}>

                  {data.map((item) => (
                    <SingleCardWrapper className={listClass} style={style} >
                      <div className="isoCardImage">
                        <img alt="example" src={item.imageUrl} onClick={event => selectedProductId(item.itemCode)}  onMouseOver={e => console.log(e)} />                
                      </div>
                      <div className="isoCardContent">
                        <Row>
                          <Col span={6} >
                            <h3 className="isoCardTitle">{item.series}</h3>
                          </Col>
                          <Col span={18} align="right" >
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
                        {!inputNumberShowOrHide(item) ? (
                          <Button
                            type="primary"
                            onClick={event => onAddBox(item)}
                          >  {<IntlMessages id="Sepete Ekle" />}
                          </Button>
                        ) : (
                            <Row justify="center"  align="middle">
                              <Col span={4} style={{ width: '100%' }}>  <Button
                                type="primary"
                                onClick={event => onRemoveBox(item)}
                              >  {<IntlMessages id="-" />}
                              </Button></Col>
                              <Col span={8}>  
                                <Input
                                  onChange={event => onChangeQuantity(event, item)}
                                  style={{ width: 80,textAlign: "right" }}                               
                                  maxLength={25}
                                  defaultValue={1}
                                  step={1}
                                  value={inputNumberQuantityValue(item)}
                                />
                              </Col>
                              <Col span={4} style={{ width: '100%' }}>  <Button
                                type="primary"
                                onClick={event => onAddBox(item)}
                              >  {<IntlMessages id="+" />}
                              </Button></Col>
                            </Row>

                          )}

                      </div>
                    </SingleCardWrapper>

                  ))}
                  <Pagination defaultCurrent={0} total={totalDataCount} pageSize={8} onChange={onchangePagination} />
                </Row>
              </Spin>
            </Box>
          </ContentHolder>
        </div>
      </AlgoliaSearchPageWrapper>
    </React.Fragment>
  );
};

export default ProductsList;
