import React, { useState, useEffect } from "react";
import IntlMessages from "@iso/components/utility/intlMessages";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import _ from 'underscore';
import { SingleCardWrapper } from './Shuffle.styles';
import { Col, Card, Row, Button, Breadcrumb, Pagination, Collapse, Spin, Badge, notification, Typography } from "antd";
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import { Link, useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';
import ContentHolder from '@iso/components/utility/contentHolder';
import PageHeader from "@iso/components/utility/pageHeader";
import { direction } from '@iso/lib/helpers/rtl';
import AlgoliaSearchPageWrapper from './Algolia.styles';
import { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import Input, { InputSearch, } from '@iso/components/uielements/input';
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import {
  SortAscendingOutlined,
} from '@ant-design/icons';

const margin = {
  margin: direction === 'rtl' ? '0 0 8px 8px' : '0 8px 8px 0',
};
const { Panel } = Collapse;
const FormItem = Form.Item;

const { Meta } = Card;

const SearchComponent = () => {
  const [inputNumberShow, setInputNumberShow] = React.useState(false);
  const [addCartLoading, setAddCartLoading] = React.useState(false);
  const history = useHistory();
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [productGroup, setProductGroup] = useState(localStorage.getItem("productCategories"));
  const [filterProductGroup, setFilterProductGroup] = useState([localStorage.getItem("productCategories")]);
  const [productType, setProductType] = useState([]);
  const [productQuality, setProductQuality] = useState([]);
  const [series, setSeries] = useState([]);
  const [dimension, setDimension] = useState([]);
  const [color, setColor] = useState([]);
  const [surface, setSurface] = useState([]);
  const [productionQuality, setProductionQuality] = useState([]);
  const [salesStatus, setSalesStatus] = useState(enumerations.SalesStatus.All);
  const [keyword, setKeyword] = useState();
  const [locationKeys, setLocationKeys] = useState([]);
  const [sortingField, setSortingField] = useState();
  const [sortingOrder, setSortingOrder] = useState();
  const { searchQuery } = useParams();
  const [itemRefButtonType, setItemRefButtonType] = useState('dashed');
  const [listPriceLowestButtonType, setListPriceLowestButtonType] = useState('dashed');
  const [listPriceHighestButtonType, setListPriceHighestButtonType] = useState('dashed');

  const match = useRouteMatch();
  const queryString = require('query-string');
  const location = useLocation();

  function getQueryVariable(query) {

    const parsed = queryString.parse(location.search);
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if ((parsed.pgindex !== undefined) && (selectedCurrentPage === 0)) { setlocalCurrentPage(parseInt(parsed.pgindex)); }
    if (parsed.keyword !== undefined) { setKeyword(parsed.keyword); }
    if (parsed.srto !== undefined) { setSortingOrder(parsed.srto); }
    if (parsed.srtf !== undefined) {
      setSortingField(parsed.srtf); switch (parsed.srtf) {
        case 'ItemRef':
          return
          setItemRefButtonType('primary');

        case 'ListPrice':

          if (parsed.srto == 'ASC') { return setListPriceLowestButtonType('primary') }
          else { return setListPriceHighestButtonType('primary') }
        default:
          return setItemRefButtonType('primary');

      }
    }
    else { setItemRefButtonType('primary'); }

    //Product Group get url data
    if (parsed.pg !== undefined) {
      if (Array.isArray(parsed.pg)) {
        setProductGroup(parsed.pg)
        setFilterProductGroup(parsed.pg)
      } else {setFilterProductGroup(parsed.pg); setProductGroup(parsed.pg); }
    }

    //Product Type get url data
    if (parsed.ut !== undefined) {
      if (Array.isArray(parsed.ut)) {
        setProductType(parsed.ut)
      } else { setProductType([parsed.ut]); }
    }

    //Dimension get url data
    if (parsed.dm !== undefined) {
      if (Array.isArray(parsed.dm)) {
        setDimension(parsed.dm)
      } else { setDimension([parsed.dm]); }
    }

    //Series get url data
    if (parsed.se !== undefined) {
      if (Array.isArray(parsed.se)) {
        setSeries(parsed.se)
      } else { setSeries([parsed.se]); }
    }
    //Color get url data
    if (parsed.clr !== undefined) {
      if (Array.isArray(parsed.clr)) {
        setColor(parsed.clr)
      } else { setColor([parsed.clr]); }
    }
    //Surface get url data
    if (parsed.sfc !== undefined) {
      if (Array.isArray(parsed.sfc)) {
        setSurface(parsed.sfc)
      } else { setSurface([parsed.sfc]); }
    }
    //Sales Status get url data
    if (parsed.ss !== undefined) {
      setSalesStatus(parsed.ss)
    }
    //Product Quality get url data
    if (parsed.pq !== undefined) {
      if (Array.isArray(parsed.pq)) {
        setProductQuality(parsed.pq)
      } else { setProductQuality([parsed.pq]); }
    }
  }
  useEffect(() => {
    getQueryVariable(searchQuery)
    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  //Redux ürünler listeleme
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();

  //ProductListHook
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray] =
    useProductData(`${siteConfig.api.products}`, { "keyword": keyword, "qualities": productQuality, "salesStatus": salesStatus, "series": series, "types": productType, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [productGroup], "pageIndex": localCurrentPage - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Ürün Grubu 
  const [productGroupData] = useFilterProductCategories(`${siteConfig.api.productGroup}`);

  //Ürün Tipi 
  const [productTypeData, loadingFilter, setOnChangeFilter] = useFilterData(`${siteConfig.api.productType}?categories=${filterProductGroup}`);

  //Ebatlar
  const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = useFilterData(`${siteConfig.api.dimensions}?categories=${filterProductGroup}`);

  //Seriler
  const [serieData, loadingSerieFilter, setOnChangeSerieFilter] = useFilterData(`${siteConfig.api.series}?categories=${filterProductGroup}`);

  //Renkler
  const [colorData, loadingColorFilter, setOnChangeColorFilter] = useFilterData(`${siteConfig.api.colors}?categories=${filterProductGroup}`);

  //Yüzeyler
  const [surfaceData, loadingSurfaceFilter, setOnChangeSurfaceFilter] = useFilterData(`${siteConfig.api.surfaces}?categories=${filterProductGroup}`);

  //Ürün kalitesi getirme
  // const [productionQualityData,loadingQualityFilter,setOnChangeQualityFilter] = useFilterData(`${siteConfig.api.productionQuality}?${filterProductGroup}`);

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

  function keywordAddUrl() {
    const params = new URLSearchParams(location.search);
    params.delete('keyword');
    params.delete('pgindex');
    if (keyword.length > 0) {

      params.append('keyword', keyword);
      params.append('pgindex', 1);
      params.toString();
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  const keyPress = e => {
    if (e.keyCode == 13) {
      keywordAddUrl();
    }
  }

  const onSearch = e => {
    keywordAddUrl();
  }
  //Pagination : Tablo  pageSize'ı değiştirir
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    const params = new URLSearchParams(location.search);
    params.delete('pgsize');
    params.delete('pgindex');

    params.append('pgsize', pageSize);
    params.append('pgindex', current);
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  ///Pagination : Seçili sayfanın saklandığı state'i değiştirir
  function currentPageChange(current) {
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);

    const params = new URLSearchParams(location.search);
    params.delete('pgindex');
    params.append('pgindex', current)
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  //Product Group Filter Event
  function onChangeProductGroup(checkedProductGroupValue) {
    clearFilterAndNewSearch(checkedProductGroupValue.target.value);
  };
  //Sales Status Filter Event
  function onChangeSalesStatus(event) {
    setSalesStatus(event.target.value)
    const params = new URLSearchParams(location.search);
    params.delete('ss');
    params.append('ss', event.target.value);
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    params.toString();

    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }
  //Product Type Filter Event
  function onChangeProductType(checkedProductTypeValue) {
    setProductType(checkedProductTypeValue);

    const params = new URLSearchParams(location.search);
    params.delete('ut');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedProductTypeValue.length > 0) {
      checkedProductTypeValue.forEach(item => {
        params.append('ut', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  };
  //Product Quality Filter Event
  function onChangeProductQuality(checkedProductQualityValue) {
    setProductQuality(checkedProductQualityValue);

    const params = new URLSearchParams(location.search);
    params.delete('pq');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedProductQualityValue.length > 0) {
      checkedProductQualityValue.forEach(item => {
        params.append('pq', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  };
  //Dimension Filter Event
  function onChangeDimension(checkedDimensionValue) {
    setDimension(checkedDimensionValue)

    const params = new URLSearchParams(location.search);
    params.delete('dm');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedDimensionValue.length > 0) {
      checkedDimensionValue.forEach(item => {
        params.append('dm', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  };
  //Series Filter Event
  function onChangeSerie(checkedSerieValue) {
    setSeries(checkedSerieValue)

    const params = new URLSearchParams(location.search);
    params.delete('se');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedSerieValue.length > 0) {
      checkedSerieValue.forEach(item => {
        params.append('se', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  };
  //Color Filter Event
  function onChangeColor(checkedColorValue) {
    setColor(checkedColorValue)
    const params = new URLSearchParams(location.search);
    params.delete('clr');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedColorValue.length > 0) {
      checkedColorValue.forEach(item => {
        params.append('clr', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }
  //Surface Filter Event
  function onChangeSurface(checkedSurfaceValue) {
    setSurface(checkedSurfaceValue)

    const params = new URLSearchParams(location.search);
    params.delete('sfc');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setlocalCurrentPage(1);
    if (checkedSurfaceValue.length > 0) {
      checkedSurfaceValue.forEach(item => {
        params.append('sfc', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  function selectedProductId(productId) {
    console.log('info selected productId', productId);
  }

  function clearFilterAndNewSearch(getProductGroupName) {
    const params = new URLSearchParams(location.search);
    //Clear Params New Search
    setProductType([]);
    setDimension([]);
    setSeries([]);
    setColor([]);
    setSurface([]);
    if (getProductGroupName != undefined) {
      let productGroupName = getProductGroupName;
      params.delete('pg');
      setProductGroup(productGroupName);
      setFilterProductGroup(productGroupName);
      params.append('pg', productGroupName);
      params.toString();
    }
    params.delete('ut');
    params.delete('dm');
    params.delete('se');
    params.delete('clr');
    params.delete('sfc');
    params.delete('pgindex');
    params.append('pgindex', 1)

    setlocalCurrentPage(1);

    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    // setOnChangeQualityFilter(true);
    return setOnChange(true);
  }
  //Product Sorting
  function itemRefSorting() {
    setSortingField('ItemRef');
    setSortingOrder('DESC');
    const params = new URLSearchParams(location.search);
    params.delete('srtf');
    params.delete('srto');
    params.append('srtf', 'ItemRef');
    params.append('srto', 'DESC');
    params.toString();
    setItemRefButtonType('primary');
    setListPriceHighestButtonType('dashed');
    setListPriceLowestButtonType('dashed');
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }
  //List Price Lowest Sorting
  function listPriceLowestSorting() {
    setSortingField('ListPrice');
    setSortingOrder('ASC');

    const params = new URLSearchParams(location.search);
    params.delete('srtf');
    params.delete('srto');
    params.append('srtf', 'ListPrice');
    params.append('srto', 'ASC');
    params.toString();
    setListPriceLowestButtonType('primary');
    setItemRefButtonType('dashed');
    setListPriceHighestButtonType('dashed');
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }
  //List Price Highest Sorting
  function listPriceHighestSorting() {
    setSortingField('ListPrice');
    setSortingOrder('DESC');

    const params = new URLSearchParams(location.search);
    params.delete('srtf');
    params.delete('srto');
    params.append('srtf', 'ListPrice');
    params.append('srto', 'DESC');
    params.toString();
    setListPriceHighestButtonType('primary');
    setListPriceLowestButtonType('dashed');
    setItemRefButtonType('dashed');
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
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

  function onAddBox(product) {
    inputNumberShowOrHide(product)
    setAddCartLoading(true);

    if ((productQuantity.length === 0) || (productQuantity.find(item => item.itemCode == product.itemCode) === undefined)) {
      dispatch(addToCart(product, 1));
      notification.info({ message: 'Sepet', description: 'Ürün Sepete Eklenmiştir', placement: 'bottomRight' });
    }
    else {
      const selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
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
  const collapseProps = { accordion: true, expandIconPosition: { expandIconPosition }, style: { marginTop: '10px' } };
  const { Text } = Typography;
  return (
    <React.Fragment>
      {/* <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link></Breadcrumb.Item>
        <Breadcrumb.Item >
          <Link to="/products/categories">Ürün Grubu</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Ürünler Listesi</Breadcrumb.Item>
      </Breadcrumb> */}
      <AlgoliaSearchPageWrapper className="isoAlgoliaSearchPage">
        <PageHeader>Ürünler Listesi</PageHeader>
        <div className="isoAlgoliaMainWrapper">
          <SidebarWrapper className="isoAlgoliaSidebar">
            <InputSearch placeholder="Ürün kodu veya ürün adı ara" // value={search}
              onChange={onchangeInputSearch}
              onSearch={onSearch}
              value={keyword}
              onKeyDown={keyPress} />
            <Collapse {...collapseProps}>
              <Panel header={<IntlMessages id="Kategori" />} key="0">
                <RadioGroup onChange={onChangeProductGroup} options={productGroupData}
                  value={productGroup}>
                </RadioGroup>
              </Panel>
            </Collapse>
            <Collapse {...collapseProps}>
              <Panel header={<IntlMessages id="Satış Tipi" />} key="1">
                <RadioGroup onChange={onChangeSalesStatus} defaultValue={salesStatus}>
                  <Radio style={radioStyle} value={enumerations.SalesStatus.All}>
                    Hepsi
                </Radio>
                  <Radio style={radioStyle} value={enumerations.SalesStatus.OnlyPartials}>
                    Parçalı Satış
                </Radio>
                </RadioGroup>
              </Panel>
            </Collapse>
            {/* <Collapse {...collapseProps}>
              <Panel header={<IntlMessages id="Kalite" />} key="2">
                <CheckboxGroup
                  options={productionQualityData}
                  value={productQuality}
                  onChange={onChangeProductQuality}
                  style={{ display: 'flex', flexDirection: 'column' }}
                />
              </Panel>
            </Collapse> */}
            {(productTypeData.length != 1 && productTypeData != null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="Ürün Tipi" />} key="2">
                  <CheckboxGroup
                    options={productTypeData}
                    value={productType}
                    onChange={onChangeProductType}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (<Collapse ></Collapse>)}

            {(dimensionData.length != 1 && dimensionData != null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="Ebat" />} key="3">
                  <CheckboxGroup
                    options={
                      dimensionData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeDimension}
                    value={dimension}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (<Collapse ></Collapse>)}

            {(serieData.length != 1 && serieData != null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="Seriler" />} key="4">
                  <CheckboxGroup
                    value={series}
                    options={
                      serieData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeSerie}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (<Collapse ></Collapse>)}

            {(colorData.length != 1 && colorData != null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="Renkler" />} key="5">
                  <CheckboxGroup
                    value={color}
                    options={
                      colorData.map(e => e === null || e === '' ? 'Yok' : e)}
                    onChange={onChangeColor}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            ) : (<Collapse ></Collapse>)}

            {(surfaceData.length != 1 && surfaceData != null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="Yüzeyler" />} key="6">
                  <CheckboxGroup
                    value={surface}
                    options={
                      surfaceData.map(e => e === null ? 'Yok' : e)}
                    onChange={onChangeSurface}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (<Collapse ></Collapse>)}
            <Button
              type="primary"
              onClick={event => clearFilterAndNewSearch()}>{<IntlMessages id="Temizle" />}
            </Button>

            {/* <ClearAll /> */}
          </SidebarWrapper>
          <ContentHolder>
            <Row>
              <Col align="center">
                <Button type={itemRefButtonType} onClick={event => itemRefSorting()}>En yeniler <SortAscendingOutlined /></Button>
                <Button type={listPriceLowestButtonType} onClick={event => listPriceLowestSorting()}>En düşük fiyat <SortAscendingOutlined /></Button>
                <Button type={listPriceHighestButtonType} onClick={event => listPriceHighestSorting()}>En yüksek fiyat <SortAscendingOutlined /></Button>
              </Col>
            </Row>

            <Row>
              <Col span={8} offset={16} align="right">
                {totalDataCount > 0 && <span>{totalDataCount} adet sonuç bulundu</span>}
              </Col>
            </Row>
            <Box>
              <Spin spinning={loading}>
                <Row gutter={[24, 16]}>

                  {data.map((item) => (
                    <SingleCardWrapper className={listClass} style={style} >
                      <div className="isoCardImage">
                        <Link to={`${'/products/detail'}/${item.itemCode}`}>
                          <img alt="Ürün Fotoğrafı" src={item.imageUrl} onMouseOver={e => console.log(e)} />
                        </Link>{' '}
                      </div>
                      <div className="isoCardContent">
                        <Row>
                          <Col span={6} >
                            <h3 className="isoCardTitle">{item.itemCode}</h3>
                          </Col>
                          <Col span={18} align="right" >
                            <Text mark style={{ fontSize: '80%' }}>{item.type}</Text>
                          </Col>
                        </Row>
                        <span className="isoCardDate">
                          {item.description}
                        </span>
                        <span className="isoCardDate">
                          {item.color} {item.surface && '-'} {item.surface}&nbsp;
                        </span>
                        <div className="isoCardTitle" style={{ textAlign: 'center' }}>{item.listPrice.toFixed(2)} {"TL"}</div>
                        {!inputNumberShowOrHide(item) ? (
                          <Button
                            type="primary"
                            onClick={event => onAddBox(item)}>{<IntlMessages id="Sepete Ekle" />}
                          </Button>
                        ) : (
                            <Row justify="center" align="middle">
                              <Col span={4} style={{ width: '100%' }} align="right">
                                <Button type="primary" onClick={event => onRemoveBox(item)}>
                                  {<IntlMessages id="-" />}
                                </Button>
                              </Col>
                              <Col span={8} align="middle">
                                <Input
                                  onChange={event => onChangeQuantity(event, item)}
                                  style={{ textAlign: "right" }}
                                  maxLength={25}
                                  defaultValue={1}
                                  step={1}
                                  value={inputNumberQuantityValue(item)}
                                />
                              </Col>
                              <Col span={4} style={{ width: '100%' }}>
                                <Button type="primary" onClick={event => onAddBox(item)}>
                                  {<IntlMessages id="+" />}
                                </Button>
                              </Col>
                            </Row>
                          )}
                      </div>
                    </SingleCardWrapper>
                  ))}
                  <Pagination onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={localCurrentPage}
                    hideOnSinglePage
                    position="top" />
                </Row>
              </Spin>
            </Box>
          </ContentHolder>
        </div>
      </AlgoliaSearchPageWrapper>
    </React.Fragment>
  );
};

export default SearchComponent;
