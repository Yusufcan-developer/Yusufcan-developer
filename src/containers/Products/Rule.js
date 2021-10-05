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
import { Form, Col, Row, Table, Button, Pagination, Collapse, Spin, Badge, Typography, Input, Tabs, Modal, message, Switch, Space, Select, Comment, Avatar, DatePicker, Tag } from "antd";
import PopupProductRelation from "../../../src/containers/Products/PopupProductRelation";
import viewType from '@iso/config/viewType';
import ReportPagination from "../Reports/ReportPagination";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import numberFormat from "@iso/config/numberFormat";
import Dragdrop from '../Reports/Dragdrop';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import ReactJson from 'react-json-view'

//Fetch
import { useProductData } from "@iso/lib/hooks/fetchData/usePostApiRuleProductList";
import { usePostFilter } from "@iso/lib/hooks/fetchData/usePostFilterData";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

//Other Library
import _ from 'underscore';
import logMessage from '@iso/config/logMessage';

//Desing style
import { SidebarWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import ContentHolder from '@iso/components/utility/contentHolder';
import AlgoliaSearchPageWrapper from './Algolia.styles';
import { SingleCardWrapper } from './Shuffle.styles';

import {
  SortAscendingOutlined, ClearOutlined, FormOutlined, CloseOutlined, ExclamationOutlined, UnorderedListOutlined, EyeOutlined
} from '@ant-design/icons';
var jwtDecode = require('jwt-decode');
const { Panel } = Collapse;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const SearchComponent = () => {
  document.title = "Kurallar - Seramiksan B2B";
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
  const [capacity, setCapacity] = useState(1);
  const [dealerLimit, setDealerLimit] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [selectedruleObject, setSelectedRuleObject] = useState();
  const [selectedruleObjectText, setSelectedRuleObjectText] = useState();
  const [queryText, setQueryText] = useState();
  const [queryPreview, setQueryPreview] = useState(false);
  const [createRuleTabDisabled, setCreateRuleTabDisable] = useState(true);
  const { RangePicker } = DatePicker;

  const [selectedItem, setSelectedItem] = useState();
  const [componentSize, setComponentSize] = useState('default');

  //Page Index,Page Size,Keywor states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState();
  const [ruleSearchKey, setRuleSearchKey] = useState();

  //Filter menu states
  const [category, setCategory] = useState('KARO');
  const [type, setType] = useState([]);
  const [quality, setQuality] = useState([]);
  const [series, setSeries] = useState([]);
  const [dimension, setDimension] = useState([]);
  const [color, setColor] = useState([]);
  const [surface, setSurface] = useState([]);
  const [stockStatus, setStockStatus] = useState(enumerations.StockStatus.None);
  const [productProduction, setProductProduction] = useState([]);
  const [campaign, setCampaignCode] = useState(false);
  const [salesStatus, setSalesStatus] = useState(enumerations.SalesStatus.All);
  const [ruleName, setRuleName] = useState();
  const [ruleNo, setRuleNo] = useState();
  const [description, setDescription] = useState('');
  const [isLocked, setIsLocked] = useState();
  const [ruleStatus, setRuleStatus] = useState(enumerations.RuleStatus.Active);
  const [filterStatus, setFilterStatus] = useState();
  const [priority, setPriority] = useState();
  const [ruleEditing, setRuleEditing] = useState(false);
  const [ruleSaveLoading, setRuleSaveLoading] = useState(false);
  const [deleteRuleVisible, setDeleteRuleVisible] = useState(false);

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
  const [searchSiteMode, setSearchSitemode] = useState(getSiteMode(enumerations.SiteMode.Admin));
  const [qualityFilterSearch, setQualityFilterSearch] = useState();
  const [productProductionFilterSearch, setProductProductionFilterSearch] = useState();
  const [ruleType, setRuleType] = useState();
  const [searchKey, setSearchKey] = useState('');
  const { Search } = Input;
  const statusChildren = [];

  useEffect(() => {
    postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, logMessage.Products.browse);
    setCurrentPage(pageIndex);
    if (typeof category === 'undefined') {
      setOnChangeFilter(true);
      setOnChangeDimensionsFilter(true);
      setOnChangeSerieFilter(true);
      setOnChangeColorFilter(true);
      setOnChangeSurfaceFilter(true);
      setOnChangeProductProductionFilter(true);
    }
  }, [pageIndex]);

  const parsed = queryString.parse(location.search);
  //Hook ProductList
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useProductData(`${siteConfig.api.products.postProducts}`, typeof selectedruleObject === 'undefined' ? { "keyword": keyword, "qualities": quality, "productionStatus": productProduction, "salesStatus": salesStatus, "onlyHavingCampaigns": campaign, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "balanceLevel": stockStatus, "categories": category === undefined ? color : [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' } : selectedruleObject, category);

  //Kurallar Listesi
  const [ruleData, ruleLoading, rulecurrentPage, rulesetCurrentPage, rulechangePageSize, rulesetChangePageSize, ruleTotalDataCount, ruleSetOnChange] =
    useProductData(`${siteConfig.api.report.rules}`, typeof selectedruleObject === 'undefined' ? { "keyword": ruleSearchKey, "status": filterStatus ? filterStatus : [ruleStatus], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode } : selectedruleObject, category);

  let searchUrl = queryString.parse(location.search);
  //Status
  const [statusType] = useFilterData(`${siteConfig.api.lookup.ruleStatus}`, searchUrl);
  for (let i = 0; i < statusType.length; i++) {
    statusChildren.push(<Option key={statusType[i].Key}>{statusType[i].Value}</Option>);
  }

  //Get Category
  const [productCategories] = useFilterProductCategories(`${siteConfig.api.lookup.postProductCategories}`, {});

  //Post Type
  const [productTypeData, loadingFilter, setOnChangeFilter] = usePostFilter(`${siteConfig.api.lookup.postProductTypes}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Post Dimension
  const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = usePostFilter(`${siteConfig.api.lookup.postDimensions}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Post Series
  const [serieData, loadingSerieFilter, setOnChangeSerieFilter] = usePostFilter(`${siteConfig.api.lookup.postSeries}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Post Color
  const [colorData, loadingColorFilter, setOnChangeColorFilter] = usePostFilter(`${siteConfig.api.lookup.postColors}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Post Surface
  const [surfaceData, loadingSurfaceFilter, setOnChangeSurfaceFilter] = usePostFilter(`${siteConfig.api.lookup.postSurfaces}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Get Quality
  const [productionQualityData, loadingQualityFilter, setOnChangeQualityFilter] = usePostFilter(`${siteConfig.api.lookup.postProductionQualities}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

  //Pos Product Production Status
  const [productProductionStatusData, loadingProductProductionFilter, setOnChangeProductProductionFilter] = usePostFilter(`${siteConfig.api.lookup.postproductionStatusData}`, { "keyword": keyword, "qualities": quality, "salesStatus": salesStatus, "series": series, "types": type, "surfaces": surface, "colors": color, "dimensions": dimension, "productionStatus": productProduction, "categories": [category], "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": 'Admin' });

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

    return setOnChange(true);
  }

  //Pagination : Seçili sayfanın saklandığı state'i değiştirir
  function currentPageChange(current) {
    setPageIndex(current);

    return setOnChange(true);
  }

  //Keyword value set url
  function keywordAddUrl() {
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
  const ruleSearchButton = e => {
    ruleSetOnChange(true);
  }
  //Keyword 'Enter' search
  const ruleKeyPress = e => {
    if (e.keyCode === 13) {
      ruleSetOnChange(true);
    }
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


  //Production Product
  function filterTextSearchProductProduction(value) {
    let searchString = value.toLocaleLowerCase('tr').split(' ')
    let filterList = (productProductionStatusData.filter(value => {
      let containsAtLeastOneWord = false;
      searchString.forEach(word => {
        if (value.toLowerCase('tr').includes(word))
          containsAtLeastOneWord = true;
      })
      if (containsAtLeastOneWord)
        return value
    }))
    if (filterList.length > 0) {
      _.each(productProduction, (cloneItem) => {
        var selectedProductProduction = filterList.find(item => item == cloneItem);
        if (typeof selectedProductProduction === 'undefined') {
          filterList.push(cloneItem);
        }
      });

      setProductProductionFilterSearch(filterList);
      if (value.length === 0) { ; setProductProductionFilterSearch(''); }
    }
    else { setProductProductionFilterSearch(''); }
  }
  //Text Fields Search
  const ProductProductionOnSearch = value => {
    filterTextSearchProductProduction(value);
  }
  //Keyword 'Enter' search
  const productProductionSearchTextFilterkeyPress = e => {
    filterTextSearchProductProduction(e.target.value);
  }
  //EndRegion

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

  //Type Filter Event
  function onChangeType(checkedProductTypeValue) {
    setType(checkedProductTypeValue);

    setPageIndex(1);
    // history.push(`${location.pathname}?${params.toString()}`);
    setSelectedRuleObject();
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    setOnChangeProductProductionFilter(true);

    return setOnChange(true);
  };

  //Quality Filter Event
  function onChangeProductQuality(checkedProductQualityValue) {
    debugger

    const qualityNewArray = _.map(checkedProductQualityValue.map(e => e === siteConfig.nullOrEmptySearchItem || e === '' ? null : e));
    const nullOrBlankData = _.filter(qualityNewArray, function (Item) {
      if (Item === null || Item === '') {
        return true;
      }
    });
    if ((nullOrBlankData.length > 0) && (qualityNewArray.length > 0)) { qualityNewArray.push(''); }
    setQuality(qualityNewArray);
    setPageIndex(1);

    return setOnChange(true);
  };
  //Product Production Filter Event
  function onChangeProductProduction(checkedProductProductionValue) {
    setProductProduction(checkedProductProductionValue);
    setPageIndex(1);
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
    setDimension(dimensionNewArray);
    setPageIndex(1);
    // history.push(`${location.pathname}?${params.toString()}`);
    setSelectedRuleObject();
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
    setPageIndex(1);
    setSelectedRuleObject();
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
    setPageIndex(1);

    setSelectedRuleObject();
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

    setSurface(surfaceNewArray);

    setPageIndex(1);
    setSelectedRuleObject();
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
    setItemRefButtonType('primary');
    setListPriceHighestButtonType('dashed');
    setListPriceLowestButtonType('dashed');
    return setOnChange(true);
  }
  //List Price Lowest Sorting
  function listPriceLowestSorting() {
    setSortingField('ListPrice');
    setSortingOrder('ASC');
    setListPriceLowestButtonType('primary');
    setItemRefButtonType('dashed');
    setListPriceHighestButtonType('dashed');
    return setOnChange(true);
  }
  //List Price Highest Sorting
  function listPriceHighestSorting() {
    setSortingField('ListPrice');
    setSortingOrder('DESC');
    setListPriceHighestButtonType('primary');
    setListPriceLowestButtonType('dashed');
    setItemRefButtonType('dashed');
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
    setProductProduction([]);
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
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    setOnChangeProductProductionFilter(true);
    setSelectedRuleObject();
    return setOnChange(true);
  }

  const siteMode = getSiteMode();
  function onCompletePopupRelation() {
    setHide(false);
  }

  //Ürünlerin kurallarını tanımlamak için girilmesi gereken kapasite degeri 
  function createRule(item) {
    setVisible(true);
    if (ruleEditing && ruleEditing === true) {
      setRuleNo(item.ruleNo);
      setRuleName(item.name);
      setCapacity(item.capacity);
      setPriority(item.priority);
      setDealerLimit(item.dealerLimit);
    }
  }

  //Seçilenler Modal iptal işlemi
  function handleCancel() {
    clearParams();
  };

  function clearParams() {
    setVisible(false);
    setDeleteRuleVisible(false);
    setRuleNo();
    setRuleName();
    setDescription();
    setCapacity(1);
    setPriority();
    setDealerLimit(0);
  };

  //Query Modal popup
  function queryPreviewModalCancel() {
    setQueryPreview(false);
  }

  //Kural ekleme işlemi
  async function handleOk() {
    if ((typeof capacity !== 'undefined') && (!isNaN(capacity)) && (typeof ruleName !== 'undefined')) {
      //Yeni bir kural objesi tanımlanıyor.

      const query = {
        "keyword": keyword,
        "productionStatus": productProduction,
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
      const rule = {
        "ruleNo": ruleNo,
        "name": ruleName, "description": description, "status": ruleStatus, "priority": parseInt(priority), "capacity": parseFloat(capacity),
        "dealerLimit": parseFloat(dealerLimit), "query": query
      }
      await postSaveRule(rule);
    } else {
      message.warning('Bilgileri eksiksiz giriniz!!!', 3);
    }
  };

  //Save Rule
  async function postSaveRule(reqBody) {
    setRuleSaveLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.report.postRules, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (typeof data !== 'undefined') {
          if (data.isSuccessful === false) {
            message.warning({ content: 'Kural kaydetme işlemi başarısızdır. ', duration: 2 });
            postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Add, logMessage.Rule.error);
          } else if (data.status === 400) {
            message.warning({ content: 'Kural kaydetme işlemi başarısızdır. ', duration: 2 });
            postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Add, logMessage.Rule.error);
          }
          else {
            message.success({ content: 'Kural başarılı bir şekilde kayıt edilmiştir ', duration: 2 });
            postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Add, logMessage.Rule.save);
            clearParams();
            ruleSetOnChange(true);
            setActiveTabKey('0');
            setCreateRuleTabDisable(true);
          }
        }
      })
      .catch();
    setRuleSaveLoading(false);
  }

  //Miktar girilen text alanında tüm değerleri seçiyor
  function onSelectAll(id) {
    document.getElementById(id).select();
  }

  function onChangeCapaciy(e) {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      setCapacity(value);
    }
  }

  function onChangeCustomerLimit(e) {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      setDealerLimit(value);
    }
  }

  function onChangePriority(value) {
    setPriority(value);
  }

  //Kural Silme işlemi
  function deleteRuleShowPopup(item) {
    debugger
    setRuleName(item.name);
    setRuleNo(item.id)
    setDeleteRuleVisible(true);
  }

  //Kural silme fetch işlemi
  async function deleteRule() {
    //Get User Info
    let productInfo;
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.report.deleteRule}${ruleNo}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        debugger

        productInfo = data;
      })
      .catch();
    return productInfo;
  }
  function selectedRule(item) {
    const rule = (item.query);
    if (rule && rule.categories) {
      setCategory(rule.categories[0]);
      setType(rule.types);
      setQuality(rule.qualities);
      setSalesStatus(rule.salesStatus);
      setCampaignCode(rule.onlyHavingCampaigns);
      setSeries(rule.series);
      setSurface(rule.surfaces);
      setColor(rule.colors);
      setDimension(rule.dimensions);
      setProductProduction(rule.productionStatus);

      setOnChangeDimensionsFilter(true);
      setOnChangeSerieFilter(true);
      setOnChangeColorFilter(true);
      setOnChangeSurfaceFilter(true);
      setOnChangeFilter(true);
      setOnChangeProductProductionFilter(true);
      setSelectedRuleObject();
    }
    setSelectedRuleObject(rule);
    var newObj = {};

    Object.keys(rule).forEach(function (key) {
      if (rule[key].length !== 0)
        newObj[key] = rule[key];
    });
    setSelectedRuleObjectText(newObj);
    setActiveTabKey('1');
    setRuleEditing(true);
    setRuleNo(item.ruleNo);
    setRuleName(item.name);
    setSelectedItem(item);
    setOnChange(true);

  }
  function callback(key) {
    if (key !== '1') { setSelectedRuleObject(); setCreateRuleTabDisable(true); }
    setActiveTabKey(key);
    setRuleEditing(false);
    setRuleName();
    setRuleNo();
    // if (key === enumerations.ProductRelationTypestring.Dependent) { this.setState({ productRelatedTypeTab: enumerations.ProductRelationTypestring.Dependent, productTypeTitle: 'Bağlı Ürün' }); }
    // else { this.setState({ productRelatedTypeTab: enumerations.ProductRelationTypestring.Related, productTypeTitle: 'İlgili Ürün' }); }
    // this.formRef.current.resetFields();
    // this.formRef.current.setFieldsValue({ product: this.state.productCode })
  }

  //Kriter Görüntüleme işlemleri
  function queryShowText(text) {
    setQueryPreview(true);
    setQueryText(text);
  }

  //Change Status Type
  function statusHandleChange(value) {
    setFilterStatus(value);
  }

  //RadioButton değişiklikleri
  function onChangeAmountEntered(e) {
    if (!isNaN(e.target.value)) {
      setDealerLimit(parseInt(e.target.value));
    }
  }

  //Rule Columns
  let columns = [

    {
      title: "Öncelik Sırası",
      dataIndex: "priority",
      key: "priority",
      width: 125,
      render: (text) => '#' + text

    },
    {
      title: "Adı",
      dataIndex: "name",
      key: "name",
      style: { font: { sz: "48", bold: true } },
      width: 150,
    },
    {
      title: "Kodu",
      dataIndex: "ruleNo",
      key: "ruleNo",
      width: 100,
      ellipsis: true,
    },
    {
      title: "Kapasite",
      dataIndex: "capacity",
      key: "capacity",
      width: 100,
      render: (capacity) => numberFormat(capacity)
    },
    {
      title: "Cari Limiti",
      dataIndex: "dealerLimit",
      key: "dealerLimit",
      width: 100,
      render: (dealerLimit) => numberFormat(dealerLimit)
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Durumu",
      dataIndex: "statusText",
      key: "statusText",
      width: 50,
      render: (statusText) => (
        <>
          {
            statusText === 'Aktif' ? (
              (<Tag color={'green'} key={statusText}>
                {statusText}
              </Tag>)

            ) : (
              <Tag color={'red'} key={statusText}>
                {statusText}
              </Tag>)}
        </>
      ),
    },
    {
      title: "Kriter",
      dataIndex: "query",
      key: "query",
      width: 50,
      render: (text, record) => (
        <React.Fragment>
          <Button onClick={() => {
            queryShowText(text);

          }}>
            {'Göster'}  <EyeOutlined />
          </Button></React.Fragment>
      ),
      // render: (query) => JSON.stringify(query)
    },
    {
      dataIndex: 'operation',
      render: (_, record, rowIndex) => {
        return (
          <React.Fragment>

            <a onClick={() => selectedRule(record)}>
              <i className="ion-android-create" />
            </a>
            <a onClick={() => deleteRuleShowPopup(record)} style={{marginLeft:'15px'}}>
              <i className="ion-android-close" />
            </a>
          </React.Fragment>
        )
      },
    },
  ];

  //Kural adı değiştirme
  const handleChangeRuleName = e => {
    setRuleName(e.target.value);
  }

  //Kural açıklaması değiştirme
  function handleDescription(e) {
    setDescription(e.target.value);
  }

  //Select Component Aktiflik durumu değiştirme 
  function isLockedChange(value) {
    if (value === true) { setRuleStatus(enumerations.RuleStatus.Active) }
    else { setRuleStatus(enumerations.RuleStatus.Archived) }
    setIsLocked(!value);
  }

  //Component Size
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const TabTitle = ({ name, value }) => {
    return (

      value === '0' ? <span><UnorderedListOutlined />
        {name}
      </span> : <span><FormOutlined />
        {name}
      </span>)
  }

  //Tab change and clear data
  function createRuleTab() {
    setActiveTabKey('1'); setCreateRuleTabDisable(false); setType([]);
    setDimension([]);
    setSeries([]);
    setColor([]);
    setSurface([]);
    setKeyword();
    setCampaignCode(false);
    setStockStatus(enumerations.StockStatus.None);
    setQuality([]);
    setOnChangeFilter(true);
    setOnChangeDimensionsFilter(true);
    setOnChangeSerieFilter(true);
    setOnChangeColorFilter(true);
    setOnChangeSurfaceFilter(true);
    setOnChangeProductProductionFilter(true);
    setSelectedRuleObject();
    return setOnChange(true);
  }
  //Talep oluşturma durumları seçimi
  const onChangeRuleTypeRadioButton = e => {
    setCapacity(1);
    setRuleType(e.target.value);
  }
  const view = viewType('Reports');
  const filterView = viewType('Filter');
  return (
    <React.Fragment>
      <Tabs activeKey={activeTabKey} onChange={event => callback()} >
        <TabPane tab={<TabTitle name="Kural Listesi" value="0" />} key="0" >
          <LayoutWrapper>
            <Col span={typeof ruleNo !== 'undefined' ? 24 : 24} align="right" >
              <Button type="primary" size="small" style={{ marginBottom: '5px' }} onClick={event => createRuleTab()}
                icon={<FormOutlined />} >
                {< IntlMessages id="forms.button.createRule" />}
              </Button>
            </Col>
            <Box>
              <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                <Panel header={<IntlMessages id="page.filtered" />} key="0">
                  {view !== 'MobileView' ?
                    <Row>
                      <Col span={6} >
                        <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                      </Col>
                      <Col span={6} >
                        <FormItem label={<IntlMessages id="page.ruleStatus" />}></FormItem>
                      </Col>
                    </Row>
                    : null}
                  <Row>
                    <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                      <Input size="small" placeholder="Ürün adı, Kural adı ... giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={ruleSearchKey} onKeyDown={ruleKeyPress} onChange={event => setRuleSearchKey(event.target.value)} />
                    </Col>
                    <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                      <Select
                        mode="multiple"
                        style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                        placeholder="Durum Seçiniz"
                        onChange={statusHandleChange}
                        value={filterStatus}
                      >
                        {statusChildren}
                      </Select>
                    </Col>
                    <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                      <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={ruleSearchButton} >
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
                total={ruleTotalDataCount}
                current={pageIndex}
                position="top"
              />
              <Table
                columns={columns}
                dataSource={ruleData}
                className="components-table-demo-nested"
                scroll={{ x: 'max-content' }}
                pagination={false}
              // onRow={(record) => ({
              //   onClick: () => (selectedRule(record))
              // })}
              />
              <ReportPagination
                onShowSizeChange={onShowSizeChange}
                onChange={currentPageChange}
                pageSize={pageSize}
                total={ruleTotalDataCount}
                current={pageIndex}
                position="bottom"
              />
            </Box>
          </LayoutWrapper>
        </TabPane>
        <TabPane disabled={createRuleTabDisabled} tab={<TabTitle name="Kural Detayı" value="1" />} key="1">
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
              <SidebarWrapper className="isoAlgoliaRuleSidebar">
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
                {(productionQualityData.length !== 0 && productionQualityData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="Kalite" />} key="2">
                      {productionQualityData.length > 5 ?
                        <Search
                          id='typeInputSearch'
                          placeholder="Kalite araması"
                          allowClear
                          onSearch={QualityOnSearch}
                          onKeyUp={qualitySearchTextFilterkeyPress}
                        /> : null}
                      <CheckboxGroup
                        // options={qualityFilterSearch && qualityFilterSearch.length > 0 ? qualityFilterSearch : productionQualityData}
                        // value={quality}
                        value={quality.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)}
                        options={
                          qualityFilterSearch && qualityFilterSearch.length > 0 ? qualityFilterSearch : productionQualityData.map(e => e === null ? siteConfig.nullOrEmptySearchItem : e)
                        }
                        onChange={onChangeProductQuality}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}

                {(productProductionStatusData.length !== 0 && productProductionStatusData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="Üretim Durumu" />} key="6">
                      {productProductionStatusData.length > 5 ?
                        <Search
                          id='typeInputSearch'
                          placeholder="Üretim durumu araması"
                          allowClear
                          onSearch={ProductProductionOnSearch}
                          onKeyUp={filterTextSearchProductProduction}
                        /> : null}
                      <CheckboxGroup
                        options={productProductionFilterSearch && productProductionFilterSearch.length > 0 ? productProductionFilterSearch : productProductionStatusData}
                        value={productProduction}
                        onChange={onChangeProductProduction}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      />
                    </Panel>
                  </Collapse>
                ) : (null)}
                {(productTypeData.length !== 0 && productTypeData !== null) ? (
                  <Collapse {...collapseProps}>
                    <Panel header={<IntlMessages id="filter.productType" />} key="4">
                      {productTypeData.length > 5 ?
                        <Search
                          id='typeInputSearch'
                          placeholder="Ürün tipi araması"
                          allowClear
                          onSearch={productTypeOnSearch}
                          onKeyUp={searchTextFilterkeyPress}
                        /> : null}
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
                      {dimensionData.length > 5 ?
                        <Search
                          placeholder="Ebat araması"
                          allowClear
                          onSearch={dimensionOnSearch}
                          onKeyUp={dimensionSearchTextFilterkeyPress}
                        /> : null}
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
                      {serieData.length > 5 ?
                        <Search
                          placeholder="Seri araması"
                          allowClear
                          onSearch={serieOnSearch}
                          onKeyUp={serieSearchTextFilterkeyPress}
                        /> : null}
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
                      {colorData.length > 5 ?
                        <Search
                          placeholder="Renk araması"
                          allowClear
                          onSearch={colorOnSearch}
                          onKeyUp={colorSearchTextFilterkeyPress}
                        /> : null}
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
                      {surfaceData.length > 5 ?
                        <Search
                          placeholder="Yüzey araması"
                          allowClear
                          onSearch={surfaceOnSearch}
                          onKeyUp={surfaceSearchTextFilterkeyPress}
                        /> : null}
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
                <Col span={typeof ruleNo !== 'undefined' ? 24 : 24} align="right" >
                  <Button type="primary" size="small" style={{ marginBottom: '5px' }} onClick={event => createRule(selectedItem)}
                    icon={<FormOutlined />} >
                    {ruleEditing && ruleEditing === true ?
                      < IntlMessages id="forms.button.editingRule" /> : < IntlMessages id="forms.button.createRule" />}
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
      </Tabs>
      <Modal
        width={800}
        visible={visible}
        title={ruleNo ? ruleNo + '-' + ruleName : 'Kural Oluştur'}
        cancelText="İptal"
        okText='Onayla'
        maskClosable={false}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={ruleSaveLoading}
          >
            İptal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleOk}
            disabled={ruleSaveLoading}
          >
            Kaydet
          </Button>
        ]}
      >

        <Spin tip="İşlem uzun sürebilir lütfen bekleyiniz..." spinning={ruleSaveLoading}
        >
        </Spin>
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          initialValues={{
            size: componentSize,
          }}
          onValuesChange={onFormLayoutChange}
          size={componentSize}
        >
          <Box >
            <Form.Item label="Kod">
              <Input value={ruleNo} disabled={true} />
            </Form.Item>
            <Form.Item label="Adı">
              <Input
                type='ruleName'
                placeholder="Zorunlu alan giriniz"
                // style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}

                value={ruleName}
                onChange={handleChangeRuleName}
              />
            </Form.Item>

            <Form.Item label="Kapasite">
            <Radio.Group onChange={onChangeRuleTypeRadioButton} value={ruleType} style={{ paddingBottom: '25px' }} >
                <Space direction="vertical">
                  <Radio value={1}>Eksi Bakiye Limiti
                    {ruleType === 1 ? <Input id='minus' style={{ width: 100, marginLeft: 10 }} value={capacity} onChange={event => onChangeCapaciy(event)} onClick={event => onSelectAll('minus')} /> : null}</Radio>
                  <Radio value={2}>Toplam Sipariş Miktarı
                    {ruleType === 2 ? <React.Fragment><Input id='order' style={{ width: 100, marginLeft: 10 }} value={capacity} onChange={event => onChangeCapaciy(event)} onClick={event => onSelectAll('order')} />   <RangePicker
                      // disabled={selectedRadioItem === 2 ? false : true}
                      // format={siteConfig.dateFormat}
                      // onChange={changeTimePicker}
                      style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                    // value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
                    /> </React.Fragment> : null}</Radio>

                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Cari Limiti">
              <Input
                id="dealerLimit"
                onClick={event => onSelectAll("dealerLimit")}
                onChange={event => onChangeCustomerLimit(event)}
                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                value={dealerLimit}
              />
             
            </Form.Item>

            <Form.Item label="Öncelik Sırası">
              <Select
                showSearch
                optionFilterProp="children"
                onChange={event => onChangePriority(event)}
                value={priority}
                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="1">1 - Yüksek Öncelikli</Option>
                <Option value="2">2</Option>
                <Option value="3">3</Option>
                <Option value="4">4</Option>
                <Option value="5">5</Option>
                <Option value="6">6</Option>
                <Option value="7">7</Option>
                <Option value="8">8</Option>
                <Option value="9">9</Option>
                <Option value="10">10 - Düşük Öncelikli</Option>

              </Select>
            </Form.Item>
            {/* <Form.Item label="Tarih">
              <RangePicker
                // disabled={selectedRadioItem === 2 ? false : true}
                // format={siteConfig.dateFormat}
                // onChange={changeTimePicker}
                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
              // value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
              />
            </Form.Item> */}
            <Form.Item label="Aktif / Pasif">
              <Switch id={"isLocked"} checkedChildren="Açık" unCheckedChildren="Kapalı" checked={!isLocked} onChange={isLockedChange} />
            </Form.Item>

            <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
              {<label style={{
                fontSize: '14px', fontWeight: '500'
              }}>
                Açıklama
                {

                }
              </label>}
            </Col>
            <TextArea onChange={handleDescription} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '830px' : '100%' }}
            />
          </Box>
        </Form>
      </Modal>
      <Modal title="Kriterler" visible={queryPreview} onCancel={queryPreviewModalCancel} size='150px' footer={[
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={queryPreviewModalCancel}
        >
          Tamam
        </Button>
      ]}>
        <ReactJson src={queryText} />

      </Modal>
      <Modal
        visible={deleteRuleVisible}
        title={ruleName + " kuralı silinecektir"}
        okText="Sil"
        cancelText="İptal"
        maskClosable={false}
        onCancel={handleCancel}
        onOk={deleteRule}
      >
        <p>{ruleName+ ' ' + 'kuralını silme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz?'}</p>
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: 'public',
          }}
        >
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default SearchComponent;