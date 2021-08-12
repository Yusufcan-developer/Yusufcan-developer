//React
import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from 'react-router-dom';

//Components
// import Form from "@iso/components/uielements/form";
import IntlMessages from "@iso/components/utility/intlMessages";
import { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import { InputSearch, } from '@iso/components/uielements/input';
import Box from "@iso/components/utility/box";
import { Form, Col, Row, Button, Pagination, Collapse, Spin, Badge, Typography, Input, Tabs, Modal, message, TreeSelect, Table, Select } from "antd";
import PopupProductRelation from "../../../src/containers/Products/PopupProductRelation";
import viewType from '@iso/config/viewType';
import ReportPagination from "../Reports/ReportPagination";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";

//Fetch
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiRuleProductList";
import { usePostFilter } from "@iso/lib/hooks/fetchData/usePostFilterData";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';
import basicStyle from '@iso/assets/styles/constants';

//Other Library
import _ from 'underscore';
import logMessage from '@iso/config/logMessage';

//Desing style
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import ContentHolder from '@iso/components/utility/contentHolder';
import PageHeader from "@iso/components/utility/pageHeader";
import AlgoliaSearchPageWrapper from './Algolia.styles';
import { SingleCardWrapper } from './Shuffle.styles';
import { FormOutlined } from '@ant-design/icons';

import {
  SortAscendingOutlined, ClearOutlined, InfoCircleOutlined, CloseOutlined
} from '@ant-design/icons';
var jwtDecode = require('jwt-decode');
const { Panel } = Collapse;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;

const SearchComponent = () => {
  document.title = "Ürün Arama - Seramiksan B2B";
  const { rowStyle, colStyle, gutter } = basicStyle;
  const [state, setState] = React.useState({
    collapsed: true,
  });
  const { collapsed } = state;
  const className = collapsed ? '' : 'sidebarOpen';
  const btnText = collapsed ? 'Filtrele' : 'Gizle';
  let newView = 'MobileView';
  if (window.innerWidth > 769) {
    newView = 'DesktopView';
  } else if (window.innerHeight > 767) { newView = 'TabletView' }


  //Hook States
  const history = useHistory();
  const queryString = require('query-string');
  const location = useLocation();
  const [isPointAddress, setIsPointAddress] = useState();
  const [hide, setHide] = useState(false);
  const [popupData, setPopupData] = useState();
  const [visible, setVisible] = useState();
  const [form] = Form.useForm();
  const [specification, setSpecification] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [capacity, setCapacity] = useState(1);
  //Page Index,Page Size,Keywor states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState();

  //Filter menu states
  const [category, setCategory] = useState('KARO');
  const [type, setType] = useState([]);
  const [quality, setQuality] = useState([]);
  const [series, setSeries] = useState([]);
  const [dimension, setDimension] = useState([]);
  const [color, setColor] = useState([]);
  const [surface, setSurface] = useState([]);
  const [stockStatus, setStockStatus] = useState(enumerations.StockStatus.None);
  const [campaign, setCampaignCode] = useState(false);
  const [salesStatus, setSalesStatus] = useState(enumerations.SalesStatus.All);
  const [productCode, setProductCode] = useState();
  //Sorting states
  const [sortingField, setSortingField] = useState();
  const [sortingOrder, setSortingOrder] = useState();
  const [itemRefButtonType, setItemRefButtonType] = useState('dashed');
  const [listPriceLowestButtonType, setListPriceLowestButtonType] = useState('dashed');
  const [listPriceHighestButtonType, setListPriceHighestButtonType] = useState('dashed');

  //Search Filter List
  const [productTypeFilterSearch, setProductTypeFilterSearch] = useState();
  const [dimensionFilterSearch, setDimensionFilterSearch] = useState();
  const [serieFilterSearch, setSerieFilterSearch] = useState();
  const [colorFilterSearch, setColorFilterSearch] = useState();
  const [surfaceFilterSearch, setSurfaceFilterSearch] = useState();
  const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());
  const [qualityFilterSearch, setQualityFilterSearch] = useState();
  const [searchKey, setSearchKey] = useState('');
  const [productList, setProductList]=useState();
  const { Search } = Input;

  useEffect(() => {
    postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, logMessage.Products.browse);
    setCurrentPage(pageIndex);
    if (typeof category === 'undefined') {
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
    const siteMode = getSiteMode();

    //site mode paste url manuel.
    if ((siteMode !== parsed.smode) && (typeof parsed.smode !== 'undefined')) {
      setSiteMode(parsed.smode);
      setSearchSitemode(parsed.smode);
      window.location.reload(false);
    }
    if (typeof parsed.smode !== 'undefined') { setSiteMode(parsed.smode); }
    //Category get url data
    if (typeof parsed.pg !== 'undefined') {
      if (Array.isArray(parsed.pg)) {
        setCategory(parsed.pg)
      } else { setCategory(parsed.pg); }
    }

    if (typeof parsed.isPointAddress !== 'undefined') {
      const isPoint = parsed.isPointAddress == "true" ? true : false
      setIsPointAddress(isPoint);
    }

    //Type get url data
    if (typeof parsed.ut !== 'undefined') {
      if (Array.isArray(parsed.ut)) {
        setType(parsed.ut)
      } else { setType([parsed.ut]); }
    }
    //Dimension get url data
    if (typeof parsed.dm !== 'undefined') {
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
    if (typeof parsed.se !== 'undefined') {
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
    if (typeof parsed.sfc !== 'undefined') {
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
    if (typeof parsed.ss !== 'undefined') {
      setSalesStatus(parsed.ss)
    }

    //Kampanya get url data
    if (typeof parsed.campaign !== 'undefined') {
      if (parsed.campaign === 'true')
        setCampaignCode(true); else { setCampaignCode(false) }
    }

    //Stok Durumu get url data
    if (typeof parsed.stockStatus !== 'undefined') {
      setStockStatus(parsed.stockStatus);
    }

    //Product Quality get url data
    if (typeof parsed.pq !== 'undefined') {
      if (Array.isArray(parsed.pq)) {
        setQuality(parsed.pq)
      } else { setQuality([parsed.pq]); }
    }

    if (typeof parsed.pgsize !== 'undefined') { setPageSize(parseInt(parsed.pgsize)); }
    if (typeof parsed.pgindex !== 'undefined') { setPageIndex(parseInt(parsed.pgindex)); }
    if (typeof parsed.keyword !== 'undefined') { setKeyword(parsed.keyword); }
    if (typeof parsed.srto !== 'undefined') { setSortingOrder(parsed.srto); }
    if (typeof parsed.srtf !== 'undefined') {
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
  const parsed = queryString.parse(location.search);
  //Hook ProductList
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useProductData(`${siteConfig.api.products.postProducts}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "onlyHavingCampaigns": campaign, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "balanceLevel": stockStatus, "categories": category === undefined ? color : [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode }, category);

  //Get Category
  const [productCategories] = useFilterProductCategories(`${siteConfig.api.lookup.postProductCategories}`, {});

  //Post Type
  const [productTypeData, loadingFilter, setOnChangeFilter] = usePostFilter(`${siteConfig.api.lookup.postProductTypes}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

  //Post Dimension
  const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = usePostFilter(`${siteConfig.api.lookup.postDimensions}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

  //Post Series
  const [serieData, loadingSerieFilter, setOnChangeSerieFilter] = usePostFilter(`${siteConfig.api.lookup.postSeries}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

  //Post Color
  const [colorData, loadingColorFilter, setOnChangeColorFilter] = usePostFilter(`${siteConfig.api.lookup.postColors}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

  //Post Surface
  const [surfaceData, loadingSurfaceFilter, setOnChangeSurfaceFilter] = usePostFilter(`${siteConfig.api.lookup.postSurfaces}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

  //Get Quality
  const [productionQualityData, loadingQualityFilter, setOnChangeQualityFilter] = usePostFilter(`${siteConfig.api.lookup.postProductionQualities}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode });

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
    // history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  //Pagination : Seçili sayfanın saklandığı state'i değiştirir
  function currentPageChange(current) {
    setPageIndex(current);

    const params = new URLSearchParams(location.search);
    params.delete('pgindex');
    params.append('pgindex', current)
    // history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  }

  //Keyword value set url
  function keywordAddUrl() {
    const params = new URLSearchParams(location.search);
    params.delete('keyword');
    params.delete('pgindex');
    if (typeof keyword !== 'undefined') {
      if (keyword.length > 0) {
        setPageIndex(1);
        params.append('keyword', keyword);
        params.append('pgindex', 1);
        params.toString();
      }
    }
    history.push(`${location.pathname}?${params.toString()}`);

    return setOnChange(true);
  }
  //Keyword 'Enter' search
  const keyPress = e => {
    if (e.keyCode === 13) {
      keywordAddUrl();
    }
  }
  //Keyword Search Button
  const onSearch = e => {
    keywordAddUrl();
  }

  //Type
  function filterTextSearchType(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    let filterList = (productTypeData.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(type, (cloneItem) => {
        var selectedProduct = filterList.find(item => item == cloneItem);
        if (typeof selectedProduct === 'undefined') {
          filterList.push(cloneItem);
        }
      });

      setProductTypeFilterSearch(filterList);
      if (value.length === 0) { ; setProductTypeFilterSearch(''); }
    }
    else { setProductTypeFilterSearch(''); }
  }

  //Text Fields Search
  const productTypeOnSearch = value => {
    filterTextSearchType(value);
  }
  //Keyword 'Enter' search
  const searchTextFilterkeyPress = e => {
    filterTextSearchType(e.target.value);
  }
  //Dimension
  function filterTextSearchDimension(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    let filterList = (dimensionData.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(dimension, (cloneItem) => {
        var selectedDimension = filterList.find(item => item == cloneItem);
        if (typeof selectedDimension === 'undefined') {
          filterList.push(cloneItem);
        }
      });

      setDimensionFilterSearch(filterList);
      if (value.length === 0) { ; setDimensionFilterSearch(''); }
    }
    else { setDimensionFilterSearch(''); }
  }

  //Text Fields Search
  const dimensionOnSearch = value => {
    filterTextSearchDimension(value);
  }
  //Keyword 'Enter' search
  const dimensionSearchTextFilterkeyPress = e => {
    filterTextSearchDimension(e.target.value);
  }

  //Serie
  function filterTextSearchSerie(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    const searchSeria = serieData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e);

    let filterList = (searchSeria.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(_.without(series, null)
        , (cloneItem) => {
          var selectedSerie = filterList.find(item => item == cloneItem);
          if (typeof selectedSerie === 'undefined') {
            filterList.push(cloneItem);
          } else if (cloneItem === '') { }
        });

      setSerieFilterSearch(filterList);
      if (value.length === 0) { setSerieFilterSearch(''); }
    }
    else { setSerieFilterSearch(''); }
  }
  //Text Fields Search
  const serieOnSearch = value => {
    filterTextSearchSerie(value);
  }
  //Keyword 'Enter' search
  const serieSearchTextFilterkeyPress = e => {
    filterTextSearchSerie(e.target.value);
  }

  //Color
  function filterTextSearchColor(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    const searchColor = colorData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e);

    let filterList = (searchColor.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(_.without(color, null)
        , (cloneItem) => {
          var selectedSerie = filterList.find(item => item == cloneItem);
          if (typeof selectedSerie === 'undefined') {
            filterList.push(cloneItem);
          } else if (cloneItem === '') { }
        });

      setColorFilterSearch(filterList);
      if (value.length === 0) { setColorFilterSearch(''); }
    }
    else { setColorFilterSearch(''); }
  }
  //Text Fields Search
  const colorOnSearch = value => {
    filterTextSearchColor(value);
  }
  //Keyword 'Enter' search
  const colorSearchTextFilterkeyPress = e => {
    filterTextSearchColor(e.target.value);
  }

  //Surface
  function filterTextSearchSurface(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    const searchSurface = surfaceData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e);

    let filterList = (searchSurface.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(_.without(surface, null)
        , (cloneItem) => {
          var selectedSerie = filterList.find(item => item == cloneItem);
          if (typeof selectedSerie === 'undefined') {
            filterList.push(cloneItem);
          } else if (cloneItem === '') { }
        });

      setSurfaceFilterSearch(filterList);
      if (value.length === 0) { setSurfaceFilterSearch(''); }
    }
    else { setSurfaceFilterSearch(''); }
  }
  //Text Fields Search
  const surfaceOnSearch = value => {
    filterTextSearchSurface(value);
  }
  //Keyword 'Enter' search
  const surfaceSearchTextFilterkeyPress = e => {
    filterTextSearchSurface(e.target.value);
  }


  //Quality
  function filterTextSearchQuality(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    let filterList = (dimensionData.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(quality, (cloneItem) => {
        var selectedQuantity = filterList.find(item => item == cloneItem);
        if (typeof selectedQuantity === 'undefined') {
          filterList.push(cloneItem);
        }
      });

      setQualityFilterSearch(filterList);
      if (value.length === 0) { ; setQualityFilterSearch(''); }
    }
    else { setQualityFilterSearch(''); }
  }
  //Text Fields Search
  const QualityOnSearch = value => {
    filterTextSearchQuality(value);
  }
  //Keyword 'Enter' search
  const qualitySearchTextFilterkeyPress = e => {
    filterTextSearchQuality(e.target.value);
  }
  //#endregion


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

    // history.push(`${location.pathname}?${params.toString()}`);

    return setOnChange(true);
  }

  //campaign Filter Event
  function onChangeCampaing(event) {
    setCampaignCode(event.target.value)
    const params = new URLSearchParams(location.search);
    params.delete('campaign');
    params.append('campaign', event.target.value);
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    params.toString();

    // history.push(`${location.pathname}?${params.toString()}`);

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
    // history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);

    return setOnChange(true);
  };

  //Stock Status Filter Event
  function onChangeStockStatus(event) {
    setStockStatus(event.target.value)
    const params = new URLSearchParams(location.search);
    params.delete('stockStatus');
    params.append('stockStatus', event.target.value);
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    params.toString();

    // history.push(`${location.pathname}?${params.toString()}`);

    return setOnChange(true);
  }
  //Quality Filter Event
  function onChangeProductQuality(checkedProductQualityValue) {
    setQuality(checkedProductQualityValue);

    const params = new URLSearchParams(location.search);
    params.delete('pq');
    params.delete('pgindex');
    params.append('pgindex', 1)
    setPageIndex(1);
    if (checkedProductQualityValue.length > 0) {
      checkedProductQualityValue.forEach(item => {
        params.append('pq', item);
        params.toString();
      });
    }
    // history.push(`${location.pathname}?${params.toString()}`);
    return setOnChange(true);
  };

  //Dimension Filter Event
  function onChangeDimension(checkedDimensionValue) {
    const dimensionNewArray = _.map(checkedDimensionValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));
    const nullOrBlankData = _.filter(dimensionNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData.length > 0) && (dimensionNewArray.length > 0)) { dimensionNewArray.push(''); }
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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    if ((nullOrBlankData.length > 0) && (serieNewArray.length > 0)) { serieNewArray.push(''); }
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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    if ((nullOrBlankData > 0) && (colorNewArray.length > 0)) { colorNewArray.push(''); }

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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    if ((nullOrBlankData > 0) && (surfaceNewArray.length > 0)) { surfaceNewArray.push(''); }

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
    // history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    // history.push(`${location.pathname}?${params.toString()}`);
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
    setKeyword();
    setCampaignCode(false);
    setStockStatus(enumerations.StockStatus.None);
    setQuality([])

    if (typeof getProductGroupName !== 'undefined') {
      let productGroupName = getProductGroupName;
      params.delete('pg');
      setCategory(productGroupName);
      params.append('pg', productGroupName);
      params.toString();
    } else {
      if (typeof parsed.pg === 'undefined') {
        if (productCategories.length > 0) {
          setCategory(productCategories[0]);
        }
      }
    }
    params.delete('keyword');
    params.delete('ut');
    params.delete('dm');
    params.delete('se');
    params.delete('clr');
    params.delete('sfc');
    params.delete('pq');
    params.delete('pgindex');
    params.delete('campaign');
    params.append('pgindex', 1);

    // history.push(`${location.pathname}?${params.toString()}`);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    return setOnChange(true);
  }

  const siteMode = getSiteMode();
  function onCompletePopupRelation() {
    setHide(false);
  }

  //Ürünlerin kurallarını tanımlamak için girilmesi gereken kapasite degeri 
  function createRule() {
    setVisible(true);
  }

  //Seçilenler Modal iptal işlemi
  function handleCancel() {
    setVisible(false);
  };

  //Kural ekleme işlemi
  async function handleOk() {

    if ((typeof capacity !== 'undefined') && (!isNaN(capacity))) {
      //Yeni bir kural objesi tanımlanıyor.
      const rule = {
        "ruleName": 'Karo', "capacity": capacity, "critieria": {
          "keyword": keyword,
          "qualities": quality,
          "salesStatus": salesStatus,
          "onlyHavingCampaigns": campaign,
          "series": series,
          "types": type,
          "surfaces": surface,
          "colors": color,
          "dimensions": dimension,
          "balanceLevel": stockStatus,
          "categories": category === undefined ? color : [category], "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode
        }
      }
    } else {
      message.warning('Kapasite giriniz', 3);
    }
    // if ((!driverName) || (!carPlate) || (!phone) || (!dates) || (!time)) {
    //     setValidation(false);
    //     message.warning('Lütfen bilgileri eksiksiz giriniz', 3);
    //     if (!dates) { setDateValidation(false); }
    //     if (!time) { setTimeValidation(false); }
    // }
    // else if (specification === false) {
    //     message.warning('Lütfen sol alt köşede bulunan şartnameyi işaretleyiniz', 3);
    // }
    // else {
    //     let items = [];
    //     let selectedDealerCode;
    //     let distributions = localStorage.getItem('distributions');
    //     distributions = JSON.parse(distributions);
    //     distributions = _.filter(distributions, function (i) { return i.quantity > 0 });         
    //     _.each(distributions, (item) => {
    //         selectedDealerCode = item.dealerCode;
    //         items.push({
    //             distributionLineId: item.distributionLineId,
    //             amount: item.quantity,
    //             status: item.status,
    //         });
    //     });
    //     const NotUrgentCount = _.filter(distributions, function (item) { return item.status === enumerations.status.NotUrgent; });
    //     if ((items.length > 1) && (NotUrgentCount.length === 0)) {
    //         message.warning('En az 1 ürünün kalem durumunu kalabilir olarak seçmelisiniz.', 3);
    //     }
    //     else {
    //         await sendDistributionItems(items, selectedDealerCode);
    //     }
    // }
  };
  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  function onChangeCapaciy(e) {
    if (!isNaN(e.target.value)) {
      setCapacity(parseInt(e.target.value));
    }
  }
//Order Columns
let columns = [
  {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
      style: { font: { sz: "48", bold: true } },
      width: 100
  },
  {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
      width: 200,
      ellipsis: true

  },
  {
      title: "Sipariş No",
      dataIndex: "orderNo",
      key: "orderNo",
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.orderNo - b.orderNo,
      // sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
      width: 150
  },
  {
      title: "Sipariş Tarihi",
      dataIndex: "orderDate",
      key: "orderDate",
      type: "date",
      width: 200,
      sorter: (a, b) => (''),
      // sortOrder: tableOptions.sortedInfo.columnKey === 'orderDate' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
  },
  {
      title: "Cari/DBS",
      dataIndex: "dealerSubCode",
      key: "C-DBS",
      width: 100,
  },
  {
      title: "Belge No",
      dataIndex: "documentId",
      key: "documentId",
      width: 100,
  },
  {
      title: "Ödeme",
      dataIndex: "payment",
      key: "payment",
      width: 200,
  },
  {
      title: "Adres Kodu",
      dataIndex: "addressCode",
      key: "addressCode",
      width: 150,
  },
  {
      title: "Teslimat Adresi",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
      footerKey: 'Genel Toplam',
      width: 200
  },
  {
      title: "Toplam",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: 150,
      footerKey: "total",
  },
  {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 150
  },
  {
      title: "Açıklama 1",
      dataIndex: "description1",
      key: "description1",
      width: 250
  },
  {
      title: "Açıklama 2",
      dataIndex: "description2",
      key: "description2",
      width: 250
  },
  {
      title: "Açıklama 3",
      dataIndex: "description3",
      key: "description3",
      width: 250
  },
  {
      title: "Açıklama 4",
      dataIndex: "description4",
      key: "description4",
      width: 250
  },
  {
      title: "Bayi Alt Kodu",
      dataIndex: "dealerSubCode",
      key: "dealerSubCode",
      width: 120
  },
  {
      title: "Bölge Kodu",
      dataIndex: "regionCode",
      key: "regionCode",
      width: 120
  },
  {
      title: "Bölge Yöneticisi",
      dataIndex: "regionManager",
      key: "regionManager",
      width: 150
  },
  {
      title: "Saha Kodu",
      dataIndex: "fieldCode",
      key: "fieldCode",
      width: 120
  },
  {
      title: "Saha Yöneticisi",
      dataIndex: "fieldManager",
      key: "fieldManager",
      width: 150
  },
];
  const view = viewType('Reports');
  const filterView = viewType('Filter');
  return (
    <React.Fragment>
      <Tabs defaultActiveKey="dependentProducts" >
        <TabPane tab="Ürün Arama" key={enumerations.ProductRelationTypestring.Dependent}>

          <AlgoliaSearchPageWrapper className={`${className} isoAlgoliaSearchPage`}>
            {newView === 'MobileView' || newView === 'TabletView' ? <React.Fragment> {state.collapsed === true ? <Button style={{ marginBottom: !state.collapsed ? '-20px' : '0px' }}
              className="ant-btn-primary isoAlgoliaSidebarToggle"
              onClick={() => {
                setState({ ...state, collapsed: !state.collapsed });
              }}
            >
              {btnText}
            </Button> : null}<Col style={{ width: '100%' }} align="right">
                {state.collapsed !== true ?
                  <Button shape="circle"
                    onClick={() => {
                      setState({ ...state, collapsed: !state.collapsed });
                    }}
                  >
                    <CloseOutlined />
                  </Button> : null
                }
              </Col></React.Fragment> : null}

            <div className="isoAlgoliaMainWrapper">
              <SidebarWrapper className="isoAlgoliaSidebar">
                {newView === 'MobileView' ?
                  <Col>
                    <Button type={itemRefButtonType} onClick={event => itemRefSorting()}>En yeniler <SortAscendingOutlined /></Button>
                    <Button type={listPriceLowestButtonType} onClick={event => listPriceLowestSorting()}>En düşük fiyat <SortAscendingOutlined /></Button>
                    <Button type={listPriceHighestButtonType} onClick={event => listPriceHighestSorting()}>En yüksek fiyat <SortAscendingOutlined /></Button>
                  </Col> : null
                }

                <InputSearch placeholder="Ürün kodu veya ürün adı ara"
                  onChange={onchangeInputSearch}
                  onSearch={onSearch}
                  value={keyword}
                  onKeyDown={keyPress} />
                <Collapse {...collapseProps}>
                  <Panel header={<IntlMessages id={!!category ? "filter.category" : "filter.category.asterisk"} />} key="0">
                    <RadioGroup onChange={onChangeCategory} options={productCategories}
                      value={category}>
                    </RadioGroup>
                  </Panel>
                </Collapse>
                {!!category ? null :
                  <div style={{ color: 'red', fontSize: '90%' }}>*: Detaylı filtreleme için kategori seçiniz</div>}
                <Collapse {...collapseProps}>
                  <Panel header={<IntlMessages id="filter.campaing" />} key="2">
                    <RadioGroup onChange={onChangeCampaing} value={campaign} defaultValue={campaign}>
                      <Radio style={radioStyle} value={false}>
                        Hepsi
                      </Radio>
                      <Radio style={radioStyle} value={true}>
                        Kampanyalı
                      </Radio>
                    </RadioGroup>
                  </Panel>
                </Collapse>
                {/* Yeni Filtre Alanı Stok Durumu*/}
                <Collapse {...collapseProps}>
                  <Panel header={<IntlMessages id="filter.status" />} key="3">
                    <RadioGroup onChange={onChangeStockStatus} value={stockStatus} defaultValue={stockStatus}>
                      <Radio style={radioStyle} value={enumerations.StockStatus.None}>
                        Hepsi
                      </Radio>
                      <Radio style={radioStyle} value={enumerations.StockStatus.GeneralInStock}>
                        Stok Var
                      </Radio>
                      <Radio style={radioStyle} value={(category === 'KARO') ? enumerations.StockStatus.TileNotInStock : enumerations.StockStatus.GeneralNotInStock}>
                        Stok Yok
                      </Radio>
                      {(category === 'KARO') ? (<React.Fragment>
                        <Radio style={radioStyle} value={enumerations.StockStatus.Tile10000AndMore}>
                          10.000+  M2
                        </Radio></React.Fragment>) : (null)}
                    </RadioGroup>
                  </Panel>
                </Collapse>
                {(productionQualityData.length !== 0 && productionQualityData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="Kalite" />} key="2">
                      <Search
                        id='typeInputSearch'
                        placeholder="Kalite araması"
                        allowClear
                        onSearch={QualityOnSearch}
                        onKeyUp={qualitySearchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        options={qualityFilterSearch && qualityFilterSearch.length > 0 ? qualityFilterSearch : productionQualityData}
                        value={quality}
                        onChange={onChangeProductQuality}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}
                {(productTypeData.length !== 0 && productTypeData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.productType" />} key="4">
                      <Search
                        id='typeInputSearch'
                        placeholder="Ürün tipi araması"
                        allowClear
                        onSearch={productTypeOnSearch}
                        onKeyUp={searchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        options={productTypeFilterSearch && productTypeFilterSearch.length > 0 ? productTypeFilterSearch : productTypeData}
                        value={type}
                        onChange={onChangeType}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}

                {(dimensionData.length !== 0 && dimensionData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.dimension" />} key="5">
                      <Search
                        placeholder="Ebat araması"
                        allowClear
                        onSearch={dimensionOnSearch}
                        onKeyUp={dimensionSearchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        options={
                          dimensionFilterSearch && dimensionFilterSearch.length > 0 ? dimensionFilterSearch : dimensionData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)
                        }
                        onChange={onChangeDimension}
                        value={dimension.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}
                {(serieData.length !== 0 && serieData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.series" />} key="6">
                      <Search
                        placeholder="Seri araması"
                        allowClear
                        onSearch={serieOnSearch}
                        onKeyUp={serieSearchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        value={series.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        options={
                          serieFilterSearch && serieFilterSearch.length > 0 ? serieFilterSearch : serieData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)
                        }
                        onChange={onChangeSerie}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}
                {(colorData.length !== 0 && colorData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.color" />} key="7">
                      <Search
                        placeholder="Renk araması"
                        allowClear
                        onSearch={colorOnSearch}
                        onKeyUp={colorSearchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        value={color.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        options={
                          colorFilterSearch && colorFilterSearch.length > 0 ? colorFilterSearch : colorData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        onChange={onChangeColor}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel></Collapse>
                ) : (null)}

                {(surfaceData.length !== 0 && surfaceData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.surface" />} key="8">
                      <Search
                        placeholder="Yüzey araması"
                        allowClear
                        onSearch={surfaceOnSearch}
                        onKeyUp={surfaceSearchTextFilterkeyPress}
                      />
                      <CheckboxGroup
                        value={surface.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        options={
                          surfaceFilterSearch && surfaceFilterSearch.length > 0 ? surfaceFilterSearch : surfaceData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
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
                <Col span={8} offset={16} align="right" >
                  <Button type="primary" size="small" style={{ marginBottom: '5px' }} onClick={event => createRule()}
                    icon={<FormOutlined />} >
                    {<IntlMessages id="forms.button.createRule" />}
                  </Button>
                </Col>
                <Row style={{ marginBottom: '10px' }}>
                  {newView === 'MobileView' ?
                    null : <Col span={16}>
                      <Button type={itemRefButtonType} onClick={event => itemRefSorting()}>En yeniler<SortAscendingOutlined /></Button>
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
                      {data.map((item, i) => (
                        <SingleCardWrapper className={listClass} style={style} xs={{ span: 12 }} sm={{ span: 12 }} lg={{ span: 12 }} >
                          {item.canBeSoldPartially === true && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (
                            <React.Fragment>
                              <Badge.Ribbon text="Parçalı Satışa Uygun" color='orange' placement='end'>
                                {item.campaignCode === '' ? ''
                                  : <Badge.Ribbon text="Kampanyalı" color='blue' placement='start'>
                                  </Badge.Ribbon>}
                                <div className="isoCardImage">
                                  <Link to={`${'/products/detail'}/${item.itemCode}?smode=${siteMode}`}>
                                    <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                  </Link>{' '}
                                </div>
                              </Badge.Ribbon>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              {item.campaignCode === '' ?
                                <div className="isoCardImage">
                                  <Link to={`${'/products/detail'}/${item.itemCode}?smode=${siteMode}`}>
                                    <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                  </Link>{' '}
                                </div> : <Badge.Ribbon text="Kampanyalı" color='blue' placement='start'>
                                  <div className="isoCardImage">
                                    <Link to={`${'/products/detail'}/${item.itemCode}?smode=${siteMode}`}>
                                      <img alt="Ürün Fotoğrafı" src={item.imageMediumBaseUrl + item.imageMainFileName} />
                                    </Link>{' '}
                                  </div></Badge.Ribbon>}
                            </React.Fragment>)}
                          {hide === true && i === 0 ?
                            <PopupProductRelation
                              hide={hide}
                              item={popupData}
                              dependentProducts={[]}
                              relatedProducts={[]}
                              onComplete={onCompletePopupRelation}
                            /> : null}
                          <div className="isoCardContent">
                            <Row>
                              <Col span={6} >
                                <h3 className="isoCardTitle">{item.itemCode}</h3>
                              </Col>
                              <Col span={18} align="right" >
                                <Text mark style={{ fontSize: '80%' }}>{item.salableBalanceFriendlyText ? ('Stok: ' + item.salableBalanceFriendlyText) : null}{ }</Text>
                              </Col>
                            </Row>
                            <span className="isoCardDate" style={{ minHeight: '70px' }}>
                              {item.description}
                              <br />
                              <Col className="isoCardTitle" align="center" >
                                {item.descriptionExtra}
                              </Col>
                            </span>
                          </div>
                        </SingleCardWrapper>
                      ))}
                    </Row>
                    <Pagination onShowSizeChange={onShowSizeChange}
                      onChange={currentPageChange}
                      pageSize={pageSize}
                      total={totalDataCount}
                      current={pageIndex}
                      hideOnSinglePage
                      position="top" />
                  </Spin>
                </Box>

              </ContentHolder>
            </div>
          </AlgoliaSearchPageWrapper>

        </TabPane>
        <TabPane tab="Kurallar" key={enumerations.ProductRelationTypestring.Related}>
        <LayoutWrapper>
        <Box>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>                               
                                <Col span={6} >
                                    <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Ürün adı, Kural adı ... giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />

                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" >
                                    {<IntlMessages id="forms.button.label_Search" />}
                                </Button>
                            </Col>
                        </Row>
                       
                    </Panel>
                </Collapse>
            </Box>
            <Box >
               
                <ReportPagination
                    onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={pageIndex}
                    position="top"
                />
                <Table
                    className="components-table-demo-nested"
                    columns={columns}
                    dataSource={data}
                    // onChange={handleChange}
                    loading={loading}
                    // expandable={{ 'expandedRowRender': expandedRowRender }}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    bordered={false}
                    // summary={() => {
                    //     return renderFooter(columns, data, true, aggregatesOverall, true)
                    // }}
                />
                <ReportPagination
                    onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={pageIndex}
                    position="bottom"
                />
            </Box>
            </LayoutWrapper>
        </TabPane>
      </Tabs>
      <Modal
        width={500}
        visible={visible}
        title={"Kapasite Onaylama"}
        cancelText="İptal"
        okText='Onayla'
        maskClosable={false}
        onCancel={handleCancel}
        onOk={handleOk}
        // okButtonProps={{ disabled: specification }}
        footer={[
          <Button key="back" onClick={handleCancel}>
            İptal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleOk}
          >
            Kaydet
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
        >
          <Box >
            <Row>
              <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Form.Item name="capacity"
                  rules={[{ required: true, message: 'Kapasite giriniz!' }]}
                >
                  <label style={{
                    fontSize: '14px', fontWeight: '500'
                  }}>
                    Kapasite *
                    <Input
                      id={'capacity'}
                      onClick={event => onSelectAll('capacity')}
                      onChange={event => onChangeCapaciy(event)}
                      style={{ textAlign: "right", maxHeight: '32px', width: '100px' }}
                      maxLength={25}
                      defaultValue={1}
                      step={1}
                      placeholder="Zorunlu alan giriniz"
                      value={capacity}
                    />
                  </label>
                </Form.Item>
              </Col>
            </Row>
          </Box>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default SearchComponent;