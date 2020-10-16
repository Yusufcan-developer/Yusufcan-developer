//React
import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import IntlMessages from "@iso/components/utility/intlMessages";
import { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import Input, { InputSearch, } from '@iso/components/uielements/input';
import Box from "@iso/components/utility/box";
import { Col, Card, Row, Button, Breadcrumb, Pagination, Collapse, Spin, Badge, notification, Typography, Tooltip, Space, Image, Tag, message } from "antd";

//Redux
import { useDispatch, useSelector } from 'react-redux';
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Fetch
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiProductList";
import { usePostFilter } from "@iso/lib/hooks/fetchData/usePostFilterData";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

//Other Library
import _ from 'underscore';

//Desing style
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import ContentHolder from '@iso/components/utility/contentHolder';
import PageHeader from "@iso/components/utility/pageHeader";
import AlgoliaSearchPageWrapper from './Algolia.styles';
import { SingleCardWrapper } from './Shuffle.styles';
import {
  SortAscendingOutlined, ClearOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import Modal from "antd/lib/modal/Modal";
var jwtDecode = require('jwt-decode');
const { Panel } = Collapse;

const SearchComponent = () => {
  document.title = "Ürün Arama - Seramiksan B2B";

  const [state, setState] = React.useState({
    collapsed: true,
  });
  const { collapsed } = state;
  const className = collapsed ? '' : 'sidebarOpen';
  const btnText = collapsed ? 'Filtrele' : 'Gizle';
  let newView = 'MobileView';
  if (window.innerWidth > 1220) {
    newView = 'DesktopView';
  }


  //Hook States
  const history = useHistory();
  const queryString = require('query-string');
  const location = useLocation();
  const [partialAmount, setPartialAmount] = useState(0);
  const [palletAmount, setPalletAmount] = useState(0);

  //Page Index,Page Size,Keywor states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState();

  //Filter menu states
  const [category, setCategory] = useState();
  const [type, setType] = useState([]);
  const [quality, setQuality] = useState([]);
  const [series, setSeries] = useState([]);
  const [dimension, setDimension] = useState([]);
  const [color, setColor] = useState([]);
  const [surface, setSurface] = useState([]);
  const [salesStatus, setSalesStatus] = useState(enumerations.SalesStatus.All);

  //Sorting states
  const [sortingField, setSortingField] = useState();
  const [sortingOrder, setSortingOrder] = useState();
  const [itemRefButtonType, setItemRefButtonType] = useState('dashed');
  const [listPriceLowestButtonType, setListPriceLowestButtonType] = useState('dashed');
  const [listPriceHighestButtonType, setListPriceHighestButtonType] = useState('dashed');
  const [partialQuantity, setPartialQuantity] = useState(false);
  const [selectedItemCode, setSelectedItemCode] = useState();

  useEffect(() => {
    postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, 'Ürün listeleme');
    getVariablesFromUrl();
    setCurrentPage(pageIndex);
    if (category === undefined) {
      setOnChangeFilter(true);
      setOnChangeDimensionsFilter(true);
      setOnChangeSerieFilter(true);
      setOnChangeColorFilter(true);
      setOnChangeSurfaceFilter(true);
    }
  }, [pageIndex]);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl() {
    //Url değerini alıyoruz.
    const parsed = queryString.parse(location.search);

    //Category get url data
    if (parsed.pg !== undefined) {
      if (Array.isArray(parsed.pg)) {
        setCategory(parsed.pg)
      } else { setCategory(parsed.pg); }
    }

    //Type get url data
    if (parsed.ut !== undefined) {
      if (Array.isArray(parsed.ut)) {
        setType(parsed.ut)
      } else { setType([parsed.ut]); }
    }

    //Dimension get url data
    if (parsed.dm !== undefined) {
      let dimensionNewArray
      if (parsed.dm)
        if (Array.isArray(parsed.dm)) {
          dimensionNewArray = _.map(parsed.dm.map(e => e === 'null' || e === '' ? null : e));
        } else {
          dimensionNewArray = _.map([parsed.dm].map(e => e === 'null' || e === '' ? null : e));
        }
      const nullOrBlankData = _.filter(dimensionNewArray, function (Item) {
        if (Item === null || Item === '') {
          return true;
        }
      });
      if (nullOrBlankData.length > 0) { dimensionNewArray.push(''); }
      setDimension(dimensionNewArray);
    }

    //Serie get url data
    if (parsed.se !== undefined) {
      let seriesNewArray
      if (parsed.se)
        if (Array.isArray(parsed.se)) {
          seriesNewArray = _.map(parsed.se.map(e => e === 'null' || e === '' ? null : e));
        } else {
          seriesNewArray = _.map([parsed.se].map(e => e === 'null' || e === '' ? null : e));
        }
      const nullOrBlankData = _.filter(seriesNewArray, function (Item) {
        if (Item === null || Item === '') {
          return true;
        }
      });
      if (nullOrBlankData.length > 0) { seriesNewArray.push(''); }
      setSeries(seriesNewArray);
    }

    //Color get url data
    if (parsed.clr !== undefined) {
      let colorNewArray
      if (parsed.clr)
        if (Array.isArray(parsed.clr)) {
          colorNewArray = _.map(parsed.clr.map(e => e === 'null' || e === '' ? null : e));
        } else {
          colorNewArray = _.map([parsed.clr].map(e => e === 'null' || e === '' ? null : e));
        }
      const nullOrBlankData = _.filter(colorNewArray, function (Item) {
        if (Item === null || Item === '') {
          return true;
        }
      });
      if (nullOrBlankData.length > 0) { colorNewArray.push(''); }
      setColor(colorNewArray);
    }

    //Surface get url data
    if (parsed.sfc !== undefined) {
      let surfaceNewArray
      if (parsed.sfc)
        if (Array.isArray(parsed.sfc)) {
          surfaceNewArray = _.map(parsed.sfc.map(e => e === 'null' || e === '' ? null : e));
        } else {
          surfaceNewArray = _.map([parsed.sfc].map(e => e === 'null' || e === '' ? null : e));
        }
      const nullOrBlankData = _.filter(surfaceNewArray, function (Item) {
        if (Item === null || Item === '') {
          return true;
        }
      });
      if (nullOrBlankData.length > 0) { surfaceNewArray.push(''); }
      setSurface(surfaceNewArray);
    }

    //Sales Status get url data
    if (parsed.ss !== undefined) {
      setSalesStatus(parsed.ss)
    }

    //Product Quality get url data
    if (parsed.pq !== undefined) {
      if (Array.isArray(parsed.pq)) {
        setQuality(parsed.pq)
      } else { setQuality([parsed.pq]); }
    }

    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
    if (parsed.keyword !== undefined) { setKeyword(parsed.keyword); }
    if (parsed.srto !== undefined) { setSortingOrder(parsed.srto); }
    if (parsed.srtf !== undefined) {
      setSortingField(parsed.srtf); switch (parsed.srtf) {
        case 'ItemRef':
          return setItemRefButtonType('primary');
        case 'ListPrice':
          if (parsed.srto === 'ASC') { return setListPriceLowestButtonType('primary') }
          else { return setListPriceHighestButtonType('primary') }
        default:
          return setItemRefButtonType('primary');
      }
    }
    else { setItemRefButtonType('primary'); }
    
      return setOnChange(true);
    
  }

  //Redux ürünler listeleme
  const { productQuantity } = useSelector(state => state.Ecommerce);
  const { addToCart, changeProductQuantity } = ecommerceActions;
  const dispatch = useDispatch();

  const parsed = queryString.parse(location.search);

  //Hook ProductList
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useProductData(`${siteConfig.api.products.postProducts}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": category === undefined ? color : [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder }, category, parsed);
  
  //Get Category
  const [productCategories] = useFilterProductCategories(`${siteConfig.api.lookup.postProductCategories}`, {});

  //Get Type 
  // const [productTypeData, loadingFilter, setOnChangeFilter] = usePostFilter(`${siteConfig.api.lookup.getProductTypes}?categories=${category}`);

  //Post Type
  const [productTypeData, loadingFilter, setOnChangeFilter] = usePostFilter(`${siteConfig.api.lookup.postProductTypes}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Get Dimension
  // const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = usePostFilter(`${siteConfig.api.lookup.getDimensions}?categories=${category}`);

  //Post Dimension
  const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = usePostFilter(`${siteConfig.api.lookup.postDimensions}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Post Series
  const [serieData, loadingSerieFilter, setOnChangeSerieFilter] = usePostFilter(`${siteConfig.api.lookup.postSeries}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Post Color
  const [colorData, loadingColorFilter, setOnChangeColorFilter] = usePostFilter(`${siteConfig.api.lookup.postColors}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Post Surface
  const [surfaceData, loadingSurfaceFilter, setOnChangeSurfaceFilter] = usePostFilter(`${siteConfig.api.lookup.postSurfaces}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder });

  //Get Quality
  // const [productionQualityData,loadingQualityFilter,setOnChangeQualityFilter] = usePostFilter(`${siteConfig.api.lookup.getProductionQualities}?${category}`);

  //Style
  const listClass = `isoSingleCard card grid`;
  const style = { zIndex: 100 - 90 };
  const expandIconPosition = "left";
  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };
  const collapseProps = { accordion: true, expandIconPosition: { expandIconPosition }, style: { marginTop: '10px' } };
  const { Text } = Typography;

  //Pagination : Tablo  pageSize'ı değiştirir
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    const params = new URLSearchParams(location.search);
    params.delete('pgsize');
    params.delete('pgindex');

    params.append('pgsize', pageSize);
    params.append('pgindex', current);
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  //Pagination : Seçili sayfanın saklandığı state'i değiştirir
  function currentPageChange(current) {
    setPageIndex(current);

    const params = new URLSearchParams(location.search);
    params.delete('pgindex');
    params.append('pgindex', current)
    history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  //Keyword value set url
  function keywordAddUrl() {
    const params = new URLSearchParams(location.search);
    params.delete('keyword');
    params.delete('pgindex');

    if (keyword.length > 0) {
      setPageIndex(1);
      params.append('keyword', keyword);
      params.append('pgindex', 1);
      params.toString();
    }
    history.push(`${location.pathname}?${params.toString()}`);

    return setOnChange(true);
  }

  //Keywor 'Enter' search
  const keyPress = e => {
    if (e.keyCode === 13) {
      keywordAddUrl();
    }
  }

  //Keyword Search Button
  const onSearch = e => {
    keywordAddUrl();
  }

  //InputSearch Filter Event
  const onchangeInputSearch = e => {
    setKeyword(e.target.value);
  }

  //Category Filter Event
  function onChangeCategory(checkedProductGroupValue) {
    clearFilterVariables(checkedProductGroupValue.target.value);
  };

  //Sales Status Filter Event
  function onChangeSalesStatus(event) {
    setSalesStatus(event.target.value)
    const params = new URLSearchParams(location.search);
    params.delete('ss');
    params.append('ss', event.target.value);
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    params.toString();

    history.push(`${location.pathname}?${params.toString()}`);

    return setOnChange(true);
  }
  //Type Filter Event
  function onChangeType(checkedProductTypeValue) {
    setType(checkedProductTypeValue);

    const params = new URLSearchParams(location.search);
    params.delete('ut');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    if (checkedProductTypeValue.length > 0) {
      checkedProductTypeValue.forEach(item => {
        params.append('ut', item);
        params.toString();
      });
    }
    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);

    return setOnChange(true);
  };
  // //Quality Filter Event
  // function onChangeQuality(checkedProductQualityValue) {
  //   setQuality(checkedProductQualityValue);

  //   const params = new URLSearchParams(location.search);
  //   params.delete('pq');
  //   params.delete('pgindex');
  //   params.append('pgindex', 1)
  //   setPageIndex(1);
  //   if (checkedProductQualityValue.length > 0) {
  //     checkedProductQualityValue.forEach(item => {
  //       params.append('pq', item);
  //       params.toString();
  //     });
  //   }
  //   history.push(`${location.pathname}?${params.toString()}`);
  //   return setOnChange(true);
  // };

  //Dimension Filter Event
  function onChangeDimension(checkedDimensionValue) {
    const dimensionNewArray = _.map(checkedDimensionValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));
    const nullOrBlankData = _.filter(dimensionNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData) && (dimensionNewArray.length > 0)) { dimensionNewArray.push(''); }
    setDimension(dimensionNewArray)
    const params = new URLSearchParams(location.search);
    params.delete('dm');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    checkedDimensionValue.forEach(item => {
      if (item === siteConfig.nullOrEmptySearchItem) { params.append('dm', null); }
      else {
        params.append('dm', item);
        params.toString();
      }
    })
    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    return setOnChange(true);
  };

  //Series Filter Event
  function onChangeSerie(checkedSerieValue) {
    const serieNewArray = _.map(checkedSerieValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));

    const nullOrBlankData = _.filter(serieNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData) && (serieNewArray.length > 0)) { serieNewArray.push(''); }
    setSeries(serieNewArray)

    const params = new URLSearchParams(location.search);
    params.delete('se');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    checkedSerieValue.forEach(item => {
      if (item === siteConfig.nullOrEmptySearchItem) { params.append('se', null) }
      else {
        params.append('se', item);
        params.toString();
      }
    });
    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    return setOnChange(true);
  };

  //Color Filter Event
  function onChangeColor(checkedColorValue) {
    const colorNewArray = _.map(checkedColorValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));

    const nullOrBlankData = _.filter(colorNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData) && (colorNewArray.length > 0)) { colorNewArray.push(''); }

    setColor(colorNewArray);
    const params = new URLSearchParams(location.search);
    params.delete('clr');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    checkedColorValue.forEach(item => {
      if (item === siteConfig.nullOrEmptySearchItem) { params.append('clr', null); }
      else { params.append('clr', item); }
    });
    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeSurfaceFilter(true);
    return setOnChange(true);
  }

  //Surface Filter Event
  function onChangeSurface(checkedSurfaceValue) {
    const surfaceNewArray = _.map(checkedSurfaceValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));

    const nullOrBlankData = _.filter(surfaceNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData) && (surfaceNewArray.length > 0)) { surfaceNewArray.push(''); }

    setSurface(surfaceNewArray)

    const params = new URLSearchParams(location.search);
    params.delete('sfc');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    checkedSurfaceValue.forEach(item => {
      if (item === siteConfig.nullOrEmptySearchItem) { params.append('sfc', null); }
      else { params.append('sfc', item); params.toString(); }
    });
    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeSurfaceFilter(true);
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

  //Clear filter variables
  function clearFilterVariables(getProductGroupName) {
    const params = new URLSearchParams(location.search);

    //Clear Params New Search
    setType([]);
    setDimension([]);
    setSeries([]);
    setColor([]);
    setSurface([]);
    if (getProductGroupName !== undefined) {
      let productGroupName = getProductGroupName;
      params.delete('pg');
      setCategory(productGroupName);
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

    // setPageIndex(1);

    history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    // setOnChangeQualityFilter(true);
    return setOnChange(true);
  }

  //Quantity input number Show/Hide
  function inputNumberShowOrHide(value) {
    if (productQuantity !== null) {
      var selectedProduct = productQuantity.find(item => item.itemCode === value.itemCode);
      if (selectedProduct === undefined) {
        return false;
      }
      else { return true; }
    }
    else { return false; }
  }

  //Input Number return quantity value
  function inputNumberQuantityValue(product) {
    var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode);
    if (selectedProduct === undefined) {
      if (partialQuantity) { return 0 }
      return 1
    }
    else {
      return selectedProduct.quantity;
    }
  }
  //Input Number return partial quantity value
  function inputNumberPartialQuantityValue(product, isPartial = false) {
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode && item.isPartial === isPartial);
    if (selectedProduct === undefined) {
      if (partialQuantity) { return 0 }
      return 1
    }
    else {
      return selectedProduct.quantity;
    }
  }
  //Parçalı ürün sepete ekle butonunda ki değerlerin belirlenmesi
  function addCardButtonTitle(product) {
    var selectedProduct = productQuantity.find(item => item.itemCode == product.itemCode);
    const titleArray = []
    if (selectedProduct === undefined) {
      return 'Sepete Ekle'
    }
    else {
      productQuantity.forEach(productItem => {
        if (productItem.itemCode === selectedProduct.itemCode) {
          if (productItem.isPartial === true) { product.unit !== 'TOR' ? titleArray.push(productItem.quantity + ' Kutu') : titleArray.push(productItem.quantity + ' Torba') }
          else { titleArray.push(productItem.quantity + ' Palet') }
        }
      });
    }
    return titleArray.join(" + ")
  }
  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }
  //Redux product quantity change event
  function onChangeQuantity(event, productData, isPartial = false) {
    if (event.target.value > 0) {
      const selectedQuantity = event.target.value;
      if ((partialQuantity) && (!productQuantity.find(item => item.itemCode === productData.itemCode && item.isPartial === isPartial))) { return onAddProductCart(productData, true, isPartial, selectedQuantity) }
      else {
        if ((partialQuantity === true) && (event.target.value === 1)) { return onAddProductCart(productData, true, isPartial, selectedQuantity) }
        else {
          const product = productData;
          var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
          const newProductQuantity = [];
          productQuantity.forEach(productItem => {
            if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
              newProductQuantity.push(productItem);
            } else {
              const itemCode = productItem.itemCode
              const quantity = parseInt(event.target.value);
              newProductQuantity.push({
                itemCode,
                quantity,
                isPartial,
              });
            }
          });
          dispatch(changeProductQuantity(newProductQuantity));
        }
      }
    }
  };

  //removing items from the cart
  function onRemoveProductCart(product, orderPartialAddTobox = false, isPartial = false) {

    if ((product.canBeSoldPartially) && (!orderPartialAddTobox)) { setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
    else {

      inputNumberShowOrHide(product)
      var selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
      if (selectedProduct === undefined) { return; }
      if (selectedProduct.quantity !== 0) {
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode
            const quantity = productItem.quantity - 1;
            if (quantity === 0) { return; }
            newProductQuantity.push({
              itemCode,
              quantity,
              isPartial,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
      }
    }
  };
  //Adding products to the cart
  function onAddProductCart(product, orderPartialAddTobox = false, isPartial = false, selectedQuantity = 0) {

    //Kullanıcının rolüne göre ürün ekleyip çıkaramaması
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    if ((!activeUser) | (activeUser === null)) {
      if ((token.urole === 'admin') || (token.urole === 'fieldmanager') || (token.urole === 'regionmanager') || (token.urole === 'support')) { return message.error('Ürünü sepete eklemek için bayi seçimi yapmanız gerekiyor.'); }
    }
    if (selectedQuantity === 0) { selectedQuantity = 1 }
    if ((product.canBeSoldPartially) && (!orderPartialAddTobox)) { getWarehouseList(product.itemCode); setSelectedItemCode(product.itemCode); setPartialQuantity(true); }
    else {
      inputNumberShowOrHide(product)
      if (productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial) === undefined) {
        dispatch(addToCart(product, parseInt(selectedQuantity), isPartial));
        notification.info({ message: 'Sepet', description: 'Ürün ' + product.itemCode + ' Sepete Eklenmiştir', placement: 'bottomRight' });
        postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, product.itemCode + ' Ürün sepete eklendi');
      }
      else {
        const selectedProduct = productQuantity.find(item => item.itemCode === product.itemCode && item.isPartial === isPartial);
        const newProductQuantity = [];
        productQuantity.forEach(productItem => {
          if (productItem.itemCode !== selectedProduct.itemCode || productItem.isPartial !== isPartial) {
            newProductQuantity.push(productItem);
          } else {
            const itemCode = productItem.itemCode;
            const quantity = productItem.quantity + 1;
            newProductQuantity.push({
              itemCode,
              quantity,
              isPartial,
            });
          }
        });
        dispatch(changeProductQuantity(newProductQuantity));
        postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Update, product.itemCode + ' Ürünün miktarı arttırıldı.');
      }
    }
  };

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setPartialQuantity(false);
  };

  //Get Warehouse Amount Data
  async function getWarehouseList(itemCode) {
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };

    await fetch(`${siteConfig.api.warehouse}${itemCode}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        let palletQuantity = 0;
        let partialQuantity = 0;
        if (data.balances.length > 0) {
          _.each(data.balances, (item) => {
            if (item.warehouseName === 'PALETLİ SATIŞ AMBARI') { palletQuantity += item.balance } else {
              partialQuantity += item.balance;
            }
          });
          setPalletAmount(palletQuantity);
          setPartialAmount(partialQuantity);
        }
      })
      .catch();
    return productInfo;
  }
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
      <AlgoliaSearchPageWrapper className={`${className} isoAlgoliaSearchPage`}>
        <PageHeader>Ürün Arama</PageHeader>
        {newView === 'MobileView' ? <Button style={{ marginBottom: !state.collapsed ? '-20px' : '0px' }}
          className="ant-btn-primary isoAlgoliaSidebarToggle"
          onClick={() => {
            setState({ ...state, collapsed: !state.collapsed });
          }}
        >
          {btnText}
        </Button> : null}
        <div className="isoAlgoliaMainWrapper">
          <SidebarWrapper className="isoAlgoliaSidebar">
            {newView === 'MobileView' ?
              <Col>
                <Button type={itemRefButtonType} onClick={event => itemRefSorting()}>En yeniler <SortAscendingOutlined /></Button>
                <Button type={listPriceLowestButtonType} onClick={event => listPriceLowestSorting()}>En düşük fiyat <SortAscendingOutlined /></Button>
                <Button type={listPriceHighestButtonType} onClick={event => listPriceHighestSorting()}>En yüksek fiyat <SortAscendingOutlined /></Button>
              </Col> : null
            }
            <InputSearch placeholder="Ürün kodu veya ürün adı ara" // value={search}
              onChange={onchangeInputSearch}
              onSearch={onSearch}
              value={keyword}
              onKeyDown={keyPress} />
            <Collapse {...collapseProps}>
              <Panel header={<IntlMessages id="filter.category" />} key="0">
                <RadioGroup onChange={onChangeCategory} options={productCategories}
                  value={category}>
                </RadioGroup>
              </Panel>
            </Collapse>
            <Collapse {...collapseProps}>
              <Panel header={<IntlMessages id="filter.salesStatus" />} key="1">
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
            {(productTypeData.length !== 0 && productTypeData !== null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="filter.productType" />} key="2">
                  <CheckboxGroup
                    options={productTypeData}
                    value={type}
                    onChange={onChangeType}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (null)}

            {(dimensionData.length !== 0 && dimensionData !== null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="filter.dimension" />} key="3">
                  <CheckboxGroup
                    options={
                      dimensionData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    onChange={onChangeDimension}
                    value={dimension.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (null)}
            {(serieData.length !== 0 && serieData !== null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="filter.series" />} key="4">
                  <CheckboxGroup
                    value={series.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    options={
                      serieData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    onChange={onChangeSerie}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (null)}
            {(colorData.length !== 0 && colorData !== null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="filter.color" />} key="5">
                  <CheckboxGroup
                    value={color.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    options={
                      colorData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    onChange={onChangeColor}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel></Collapse>
            ) : (null)}

            {(surfaceData.length !== 0 && surfaceData !== null) ? (
              <Collapse {...collapseProps}>
                <Panel header={<IntlMessages id="filter.surface" />} key="6">
                  <CheckboxGroup
                    value={surface.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    options={
                      surfaceData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                    onChange={onChangeSurface}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  />
                </Panel>
              </Collapse>
            ) : (null)}
            <Button
              type="primary"
              icon={<ClearOutlined />}
              onClick={event => clearFilterVariables()}
              style={{ marginTop: '10px' }}
            >{<IntlMessages id="filter.clear" />}
            </Button>
          </SidebarWrapper>

          <ContentHolder>
            <Row style={{ marginBottom: '10px' }}>
              {newView === 'MobileView' ?
                null : <Col span={16}>
                  <Button type={itemRefButtonType} onClick={event => itemRefSorting()}>En yeniler <SortAscendingOutlined /></Button>
                  <Button type={listPriceLowestButtonType} onClick={event => listPriceLowestSorting()}>En düşük fiyat <SortAscendingOutlined /></Button>
                  <Button type={listPriceHighestButtonType} onClick={event => listPriceHighestSorting()}>En yüksek fiyat <SortAscendingOutlined /></Button>
                </Col>}
              {newView === 'MobileView' ?
                <Col style={{ width: '100%' }} align="right">
                  {totalDataCount > 0 && <span>{totalDataCount} adet sonuç bulundu</span>}
                </Col> : <Col span={8} style={{ width: '100%' }} align="right">
                  {totalDataCount > 0 && <span>{totalDataCount} adet sonuç bulundu</span>}
                </Col>}
            </Row>
            <Box>
              <Spin spinning={loading}>
                <Row gutter={[24, 16]}>
                  {data.map((item) => (
                    <SingleCardWrapper className={listClass} style={style}>
                      {item.canBeSoldPartially === true ? (
                        <Badge.Ribbon text="Parçalı Satışa Uygun" color='orange'>
                          <div className="isoCardImage">
                            <Link to={`${'/products/detail'}/${item.itemCode}`}>
                              <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                            </Link>{' '}
                          </div>
                        </Badge.Ribbon>
                      ) : (<div className="isoCardImage">
                        <Link to={`${'/products/detail'}/${item.itemCode}`}>
                          <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                        </Link>{' '}
                      </div>)}
                      <div className="isoCardContent">
                        <Row>
                          <Col span={6} >
                            <h3 className="isoCardTitle">{item.itemCode}</h3>
                          </Col>
                          <Col span={18} align="right" >
                            <Text mark style={{ fontSize: '80%' }}>{item.salableBalance ? ('Stok: ' + numberFormat(item.salableBalance) + ' ' + item.unit) : null}{}</Text>
                          </Col>
                        </Row>
                        <span className="isoCardDate" style={{ minHeight: '70px' }}>
                          {item.description}
                        </span>
                        {/* <span className="isoCardDate">
                          {item.color} {item.surface && '-'} {item.surface}&nbsp;
                        </span> */}
                        <div className="isoCardTitle" style={{ textAlign: 'center', minHeight: '70px' }}>{(item.canBeSoldPartially ? 'Palet: ' : '') + numberFormat(item.listPrice)} {"TL"} {'/'} {item.unit}
                          {item.canBeSoldPartially ? (<React.Fragment><br /> {'Parçalı: ' + numberFormat(item.partialPrice)} {"TL"} {'/'} {item.unit}</React.Fragment>) : null}<br />
                          <Tooltip title={
                            <div>
                              1 Palet: {item.m2Pallet} {item.unit}<br />
                              {item.m2Box ? ('1 Kutu: ' + item.m2Box + ' ' + item.unit) : null}{item.m2Box ? <br /> : null}
                              {item.canBeSoldPartially ?
                                'Sepete hem palet hem de kutu bazında ekleme yapabilirsiniz' :
                                'Sepete palet bazında ekleme yapabilirsiniz'}
                            </div>} color={"#108ee9"}>
                            <Button type='link' size="small"
                              icon={<InfoCircleOutlined />} >
                            </Button>
                          </Tooltip>
                        </div>
                        {/* //Burada kısım parçalı ürün ise popup şeklinde açılacaktır. */}
                        {partialQuantity === true & item.itemCode === selectedItemCode ? (
                          <Modal
                            title={item.itemCode + ' - ' + item.description}
                            visible={true}
                            width={700}
                            // onOk={handleOk}
                            onCancel={handleCancel}
                            maskClosable={false}
                            footer={[
                              <Button key="back" type="primary" onClick={handleCancel}>
                                Kapat
                              </Button>
                            ]}>
                            <Card bodyStyle={{ textAlign: 'center' }}>
                              {<Image
                                key={`customnav-slider--key${item.imageUrl}`}
                                src={item.imageMediumBaseUrl + item.imageMainFileName}
                                width='300px'
                              />}
                            </Card>
                            <Form.Item label="Paletli Satış (PALET)" style={{ marginTop: '10px' }}>
                              <Row align="middle">
                                <Col span={4} align="right">
                                  <Button type="primary" onClick={event => onRemoveProductCart(item, true, false)}>
                                    {<IntlMessages id="product.minus" />}
                                  </Button>
                                </Col>
                                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                  <Input
                                    id={'Paletli' + item.itemCode}
                                    onClick={event => onSelectAll('Paletli' + item.itemCode)}
                                    onChange={event => onChangeQuantity(event, item)}
                                    style={{ textAlign: "right" }}
                                    maxLength={5}
                                    defaultValue={0}
                                    step={1}
                                    value={inputNumberPartialQuantityValue(item)}
                                  />
                                </Col>
                                <Col span={4}>
                                  <Button type="primary" onClick={event => onAddProductCart(item, true, false)}>
                                    {<IntlMessages id="product.plus" />}
                                  </Button>
                                </Col>
                                <Space size={2}>
                                  <Col span={4}>
                                    <Tag color="blue">
                                      1 Palet: {item.m2Pallet} {item.unit}
                                    </Tag>
                                  </Col>
                                  {palletAmount > 0 ? (<Col span={4}>
                                    <Tag color="blue">
                                      Stok: {numberFormat(palletAmount)} {item.unit}
                                    </Tag>
                                  </Col>) : null}
                                </Space>
                              </Row>
                            </Form.Item>
                            <Form.Item label={item.unit !== 'TOR' ? 'Parçalı Satış (KUTU)' : 'Parçalı Satış(TORBA)'} >
                              <Row align="middle">
                                <Col span={4} align="right">
                                  <Button type="primary" onClick={event => onRemoveProductCart(item, true, true)}>
                                    {<IntlMessages id="product.minus" />}
                                  </Button>
                                </Col>
                                <Col span={4} align="middle" style={{ marginRight: '2px', marginLeft: '2px' }}>
                                  <Input
                                    id={'Parçalı' + item.itemCode}
                                    onClick={event => onSelectAll('Parçalı' + item.itemCode)}
                                    onChange={event => onChangeQuantity(event, item, true)}
                                    style={{ textAlign: "right" }}
                                    maxLength={5}
                                    defaultValue={1}
                                    step={1}
                                    value={inputNumberPartialQuantityValue(item, true)}
                                  />
                                </Col>
                                <Col span={4} style={{ width: '100%' }}>
                                  <Button type="primary" onClick={event => onAddProductCart(item, true, true)}>
                                    {<IntlMessages id="product.plus" />}
                                  </Button>
                                </Col>
                                <Space size={5}>
                                  <Col span={4}>
                                    {item.unit !== 'TOR' ? <Tag color="blue">
                                      1 Kutu: {item.m2Box} {item.unit}
                                    </Tag> : null}

                                  </Col>
                                  {partialAmount > 0 ? (<Col span={4}>
                                    <Tag color="blue">
                                      Stok: {numberFormat(partialAmount)} {item.unit}
                                    </Tag>
                                  </Col>) : null}
                                </Space>
                              </Row>
                            </Form.Item>
                          </Modal>

                        ) : (null)}
                        {!inputNumberShowOrHide(item) || (item.canBeSoldPartially === true) ? (
                          <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                            <Col span={20} align="middle">
                              <Button
                                type="primary" style={{ width: '100%' }}
                                onClick={event => onAddProductCart(item)}>{<IntlMessages id={item.canBeSoldPartially === true ? addCardButtonTitle(item) : 'product.cart.add'} />}
                              </Button>
                            </Col>
                          </Row>
                        ) : (
                            <Row justify="center" align="bottom" style={{ minHeight: '55px' }}>
                              <Col span={4} style={{ width: '100%' }} align="right">
                                <Button type="primary" onClick={event => onRemoveProductCart(item)}>
                                  {<IntlMessages id="product.minus" />}
                                </Button>
                              </Col>
                              <Col span={8} align="middle">
                                <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{'Palet'}</span>
                                <Input
                                  id={item.itemCode}
                                  onClick={event => onSelectAll(item.itemCode)}
                                  onChange={event => onChangeQuantity(event, item)}
                                  style={{ textAlign: "right", maxHeight: '32px' }}
                                  maxLength={25}
                                  defaultValue={1}
                                  step={1}
                                  value={inputNumberQuantityValue(item)}
                                />
                              </Col>
                              <Col span={4} style={{ width: '100%' }}>
                                <Button type="primary" onClick={event => onAddProductCart(item)}>
                                  {<IntlMessages id="product.plus" />}
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
                    current={pageIndex}
                    hideOnSinglePage
                    position="top" />
                </Row>
              </Spin>
            </Box>
          </ContentHolder>
        </div>
      </AlgoliaSearchPageWrapper>
    </React.Fragment >
  );
};

export default SearchComponent;
