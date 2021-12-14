//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import { Table, Row, Col, TreeSelect, Radio } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { usePostDeliveryReport } from "@iso/lib/hooks/fetchData/usePostDeliveryReport";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Style
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';

//Other Library
import _ from 'underscore';
import ExcelExport from "./ExcelExport";
import moment from 'moment';
import 'moment/locale/tr';
import logMessage from '@iso/config/logMessage';
import enumerations from "../../config/enumerations";
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;
const DeliveriesReport = () => {
  document.title = "Sevkiyat - Seramiksan B2B";

  const [searchKey, setSearchKey] = useState('');
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(0, 'days').toDate()));
  const [toDate, setToDate] = useState(moment(new Date()));
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [selectedRadioItem, setSelectedRadioItem] = useState(1);
  const [newUrlParams, setNewUrlParams] = useState('');
  const [privateDate, setPrivateDate] = useState('Bugun');
  const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());
  const location = useLocation();
  const queryString = require('query-string');
  const history = useHistory();
  const Option = SelectOption;

  //Burada ki useEffect'ler page index page size
  useEffect(() => {
    postSaveLog(enumerations.LogSource.ReportDeliveries, enumerations.LogTypes.Browse, logMessage.Reports.Deliveries.browse);
    setCurrentPage(pageIndex);
    getVariablesFromUrl();
  }, [pageIndex]);

  let searchUrl = queryString.parse(location.search);
  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, deliveryDetailData, aggregatesOverall] =
    usePostDeliveryReport(`${siteConfig.api.report.postDeliveriesv2}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate !== null ? fromDate.format('YYYY-MM-DD') : null, "to": toDate !== null ? toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode }, searchUrl);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl() {
    const parsed = queryString.parse(location.search);
    const siteMode = getSiteMode();

    //site mode paste url manuel.
    if ((siteMode !== parsed.smode) && (typeof parsed.smode !== 'undefined')) {
      setSiteMode(parsed.smode);
      setSearchSitemode(parsed.smode);
      window.location.reload(false);
    }
    if (typeof parsed.smode !== 'undefined') { setSiteMode(parsed.smode); }
    if (typeof parsed.from !== 'undefined') { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
    if (typeof parsed.from !== 'undefined') { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
    if (typeof parsed.keyword !== 'undefined') { setSearchKey(parsed.keyword); }
    if (typeof parsed.pgsize !== 'undefined') { setPageSize(parseInt(parsed.pgsize)); }
    if (typeof parsed.pgindex !== 'undefined') { setPageIndex(parseInt(parsed.pgindex)); }
    if (typeof parsed.sortingField !== 'undefined') { sortingField = parsed.sortingField; }
    if (typeof parsed.sortingOrder !== 'undefined') { sortingOrder = parsed.sortingOrder; }
    let newDealarCode = []

    if (typeof parsed.fic !== 'undefined') {
      if (Array.isArray(parsed.fic)) {
        _.each(parsed.fic, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.fic) }
    }

    if (typeof parsed.rec !== 'undefined') {
      if (Array.isArray(parsed.rec)) {
        _.each(parsed.rec, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.rec) }
    }

    if (typeof parsed.dec !== 'undefined') {
      if (Array.isArray(parsed.dec)) {
        _.each(parsed.dec, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.dec) }
    }
    setSelectedDealerCode(newDealarCode);

    //Bayi kodlarının Tree select özelliğine göre düzenlenmesi.
    let fieldArrObj = [];
    let regionArrObj = [];
    let dealerArrObj = [];

    if (newDealarCode.length === 0) { return setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj) }
    _.filter(newDealarCode, function (item) {
      if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj); }
      else if (item.split("|").length === 2) {
        regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj);
      }
      else {
        dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj);
      }
    });
    onChangeDealerCode(newDealarCode);

    return setOnChange(true);
  }

  //Get Search Data
  function dataSearch(selectedPageIndex, selectedPageSize) {
    const params = new URLSearchParams(location.search);
    const siteMode = getSiteMode();

    params.delete('smode');
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');
    if ((fromDate !== '' & toDate !== '') && (fromDate !== null & toDate !== null)) {
      params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
      params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    }
    if (typeof sortingOrder !== 'undefined') { params.append('sortingOrder', sortingOrder); }
    if (typeof sortingField !== 'undefined') { params.append('sortingField', sortingField); }
    if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    params.append('smode', siteMode); params.toString();

    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);
    setSearchSitemode(siteMode);

    return setOnChange(true);
  }

  //Search Button Event
  const searchButton = () => {
    dataSearch();
  };

  //Keyword 'Enter' search
  const keyPress = e => {
    if (e.keyCode === 13) {
      dataSearch();
    }
  }

  //Change DealerCode
  function onChangeDealerCode(value) {
    let fieldArrObj = [];
    let regionArrObj = [];
    let dealerArrObj = [];
    const params = new URLSearchParams(location.search);
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');
    params.delete('pgindex');
    params.delete('pgsize');
    params.delete('smode');

    if (value.length === 0) { setNewUrlParams(''); params.delete('fic'); params.delete('rec'); params.delete('dec'); setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj); setSelectedDealerCode([]) }
    else {
      _.filter(value, function (item) {
        if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj); params.append('fic', item); params.toString(); }
        else if (item.split("|").length === 2) {
          regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj); params.append('rec', item); params.toString();
        }
        else {
          dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj); params.append('dec', item); params.toString();
        }
        setSelectedDealerCode(value)
        setNewUrlParams(params.toString());
      });
    }
  };

  //Change from and To date
  function changeTimePicker(value, dateString) {
    if (value !== null) {
      setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
      setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
    }
    else {
      setToDate(null);
      setFromDate(null);
    }
  }

  //Search DailerName Tree Select Component
  function filterTreeNodeDealerCode(value, treeNode) {
    if (value && treeNode && treeNode.title) {
      const filterValue = value.toLocaleLowerCase('tr')
      const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
      return treeNodeTitle.indexOf(filterValue) !== -1;
    }
    return false;
  }

  const handleChange = (pagination, filters, sorter) => {
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
    if (typeof sorter !== 'undefined') {
      if (sorter.order === "descend") {
        sortingOrder = 'DESC';
      } else { sortingOrder = 'ASC'; }

      sortingField = sorter.field;
      dataSearch()
    }
  };

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageIndex(current);
    setPageSize(pageSize);
    dataSearch(current, pageSize);
  }

  function onChangeRadioButton(e) {
    setSelectedRadioItem(e.target.value);
    setPrivateDate(null);
  }

  //Sevkiyat Kalemleri Expand İşlemi
  function expandedRowRender(row, index) {
    let deliveryDetailIndex;
    let partialUnitData;
    _.each(deliveryDetailData, (item, i) => {
      if (item.Key === row.waybillId) { return deliveryDetailIndex = i }
    });
    if (typeof deliveryDetailIndex !== 'undefined') {
      partialUnitData = _.groupBy(deliveryDetailData[deliveryDetailIndex].Value, function (item) { return item.unit; });
    }
    else { partialUnitData = null }
    const r = _.map(partialUnitData, (item) => {
      return (
        <Table
          columns={deliveryDetailDataColumn}
          dataSource={item}
          pagination={false}
          bordered={false}
          summary={() => {
            return renderFooter(deliveryDetailDataColumn, item, false)
          }}
        />);
    });

    return (<React.Fragment>{r} </React.Fragment>);
  };

  //Change Cheques Type
  function privateDateHandleChange(value) {

    setPrivateDate(value);

    if (value === 'SonBirHafta') {
      setFromDate(moment(moment().subtract(7, 'days').toDate()));
      setToDate(moment(new Date()));
    }
    else if (value === 'Bugun') {
      setFromDate(moment(moment().subtract(0, 'days').toDate()));
      setToDate(moment(new Date()));
    }
    else if (value === 'SonUcGun') {
      setFromDate(moment(moment().subtract(3, 'days').toDate()));
      setToDate(moment(new Date()));
    } else if (value === 'SonBirAy') {
      setFromDate(moment(moment().subtract(30, 'days').toDate()));
      setToDate(moment(new Date()));
    }
    else if (value === 'SonUcAy') {
      setFromDate(moment(moment().subtract(90, 'days').toDate()));
      setToDate(moment(new Date()));
    }
    else if (value === 'SonAltiAy') {
      setFromDate(moment(moment().subtract(180, 'days').toDate()));
      setToDate(moment(new Date()));
    }
    else if (value === 'SonBirYil') {
      setFromDate(moment(moment().subtract(366, 'days').toDate()));
      setToDate(moment(new Date()));
    }
  }

  //Excel Oluşturma
  const exportExcelButton = () => {
    postSaveLog(enumerations.LogSource.ReportDeliveries, enumerations.LogTypes.Export, logMessage.Reports.Deliveries.exportExcel);
    ExcelExport(columns, data, 'Sevkiyatlar', deliveryDetailData, deliveryDetailDataColumn, 'delivery');
  }

  let columns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode"
    },
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "İrsaliye No",
      dataIndex: "waybillId",
      key: "waybillId",
      sorter: (a, b) => '',
      sortOrder: tableOptions.sortedInfo.columnKey === 'waybillId' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],

    },
    {
      title: "İrsaliye Tarihi",
      dataIndex: "waybillDate",
      key: "waybillDate",
      type: "date",
      sorter: (a, b) => '',
      sortOrder: tableOptions.sortedInfo.columnKey === 'deliveryDate' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
      render: (deliveryDate) => moment(deliveryDate).format(siteConfig.dateFormat),
    },
    {
      title: "İrsaliye Saati",
      dataIndex: "waybillTime",
      key: "waybillTime",
      align: "center",
      footerKey: 'Genel Toplam',
    },
    {
      title: "KDV'li toplam",
      dataIndex: "totalCost",
      key: "totalCost",
      align: "right",
      footerKey: "totalCost",
      render: (totalCost) => numberFormat(totalCost),
    },
    {
      title: "Teslimat Adresi",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress"
    },
    {
      title: "Plaka",
      dataIndex: "description3",
      key: "description3"
    },
    {
      title: "Belge No",
      dataIndex: "documentId",
      key: "documentId",
      sorter: (a, b) => '',
      sortOrder: tableOptions.sortedInfo.columnKey === 'documentId' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Açıklama 1",
      dataIndex: "description1",
      key: "description1"
    },
    {
      title: "Açıklama 2",
      dataIndex: "description2",
      key: "description2"
    },
    {
      title: "Açıklama 4",
      dataIndex: "description4",
      key: "description4"
    },
    {
      title: "Bayi Alt Kodu",
      dataIndex: "dealerSubCode",
      key: "dealerSubCode"
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCode",
      key: "regionCode"
    },

    {
      title: "Bölge Yöneticisi",
      dataIndex: "regionManager",
      key: "regionManager"
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCode",
      key: "fieldCode"
    },

    {
      title: "Saha Yöneticisi",
      dataIndex: "fieldManager",
      key: "fieldManager"
    },
  ];

  let deliveryDetailDataColumn = [{
    title: "Bayi Kodu",
    dataIndex: "dealerCode",
    key: "dealerCode"
  },
  {
    title: "Bayi Adı",
    dataIndex: "dealerName",
    key: "dealerName"
  },
  {
    title: "İrsaliye No",
    dataIndex: "waybillId",
    key: "waybillId",
    sorter: (a, b) => '',
    sortOrder: tableOptions.sortedInfo.columnKey === 'waybillId' && tableOptions.sortedInfo.order,
    sortDirections: ['descend', 'ascend'],

  },
  {
    title: "Teslimat Tarihi",
    dataIndex: "deliveryDate",
    key: "deliveryDate",
    type: "date",
    sorter: (a, b) => '',
    sortOrder: tableOptions.sortedInfo.columnKey === 'deliveryDate' && tableOptions.sortedInfo.order,
    sortDirections: ['descend', 'ascend'],
    render: (deliveryDate) => moment(deliveryDate).format(siteConfig.dateFormat),
  },
  {
    title: "Teslimat Adresi",
    dataIndex: "deliveryAddress",
    key: "deliveryAddress"
  },
  {
    title: "Sipariş No",
    dataIndex: "orderNo",
    key: "orderNo",
    sorter: (a, b) => '',
    sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: "Ürün Kodu",
    dataIndex: "itemCode",
    key: "itemCode",
  },
  {
    title: "Ürün Açıklaması ",
    dataIndex: "itemDescription",
    key: "itemDescription"
  },
  {
    title: "Miktar",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    footerKey: "amount",
    render: (amount) => numberFormat(amount),
  },
  {
    title: "KDV'li toplam",
    dataIndex: "totalCost",
    key: "totalCost",
    align: "right",
    footerKey: "totalCost",
    render: (totalCost) => numberFormat(totalCost),
  },
  {
    title: "Birim",
    dataIndex: "unit",
    key: "unit",
    align: "center"
  },
  {
    title: "Plaka",
    dataIndex: "plateNo",
    key: "plateNo",
    align: "center"
  },
  {
    title: "Şoför Adı",
    dataIndex: "driverName",
    key: "driverName",
    align: "center"
  },
  {
    title: "Şoför Telefonu",
    dataIndex: "driverPhone",
    key: "driverPhone",
    align: "center"
  },
  {
    title: "Çıkış Tarihi",
    dataIndex: "departureDate",
    key: "departureDate",
    align: "center",
    type: "date",
    sorter: (a, b) => '',
    sortOrder: tableOptions.sortedInfo.columnKey === 'departureDate' && tableOptions.sortedInfo.order,
    sortDirections: ['descend', 'ascend'],
    render: (departureDate) => moment(departureDate).format(siteConfig.dateFormat),
  },
  {
    title: "Çıkış Saati",
    dataIndex: "departureTime",
    key: "departureTime",
    align: "center"
  },
  {
    title: "Tonaj",
    dataIndex: "tonnage",
    key: "tonnage",
    align: "right",
    footerKey: "tonnage",
    render: (tonnage) => numberFormat(tonnage),
  },
  {
    title: "Bayi Alt Kodu",
    dataIndex: "dealerSubCode",
    key: "dealerSubCode"
  },
  {
    title: "Bölge Kodu",
    dataIndex: "regionCode",
    key: "regionCode"
  },

  {
    title: "Bölge Yöneticisi",
    dataIndex: "regionManager",
    key: "regionManager"
  },
  {
    title: "Saha Kodu",
    dataIndex: "fieldCode",
    key: "fieldCode"
  },

  {
    title: "Saha Yöneticisi",
    dataIndex: "fieldManager",
    key: "fieldManager"
  }];

  //Hide order table column
  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.ShippingTableHideColumns.Field;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if (token.urole === 'regionmanager') {
    const getHideColumns = ColumnOptionsConfig.ShippingTableHideColumns.Region;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')|| (token.urole === 'dealersub')) {
    const getHideColumns = ColumnOptionsConfig.ShippingTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  const view = viewType('Reports');
  const filterView = viewType('Filter');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.shippingReportsTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            {view !== 'MobileView' ?
              <Row>
                <Col span={6}>
                  <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
                </Col>
                <Col span={6} >
                  <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                </Col>
                <Col span={6} >
                  <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                </Col>
                <Col span={5} offset={1}>
                </Col>
              </Row>
              : null}
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <TreeSelect
                  treeData={treeData}
                  value={selectedDealerCode}
                  onChange={onChangeDealerCode}
                  filterTreeNode={filterTreeNodeDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Bayi Kodu Seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  dropdownMatchSelectWidth={500}
                />
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Radio.Group onChange={onChangeRadioButton} value={selectedRadioItem}>
                  <Row>
                    <Col span={2} >
                      <Radio value={1} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} size="small">
                      </Radio>
                    </Col>
                    <Col style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
                      <Select
                        placeholder="Tarih aralığı seçiniz"
                        disabled={selectedRadioItem === 1 ? false : true}
                        style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                        onChange={privateDateHandleChange}
                        optionFilterProp="children"
                        value={privateDate}
                      >
                        <Option value="Bugun">Bugün</Option>
                        <Option value="SonUcGun">Son 3 gün</Option>
                        <Option value="SonBirHafta">Son 1 Hafta</Option>
                        <Option value="SonBirAy">Son 1 Ay</Option>
                        <Option value="SonUcAy">Son 3 Ay</Option>
                        <Option value="SonAltiAy">Son 6 Ay</Option>
                        <Option value="SonBirYil">Son 1 Yıl</Option>
                      </Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={2} >
                      <Radio value={2} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">

                      </Radio>
                    </Col>
                    <Col style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
                      <RangePicker
                        disabled={selectedRadioItem === 2 ? false : true}
                        format={siteConfig.dateFormat}
                        onChange={changeTimePicker}
                        style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                        value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
                      />
                    </Col>
                  </Row>
                </Radio.Group>
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Input style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} size="small" placeholder="Anahtar kelime" value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col xs={{ offset: 0, span: 24 }} sm={{ offset: 1, span: 2 }}  >
                <Button style={{ width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
                  {<IntlMessages id="forms.button.label_Search" />}
                </Button>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box>
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" style={{ marginBottom: '5px' }}
            icon={<DownloadOutlined />} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button>
        </Col>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={pageIndex}
          position="top"
        />
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          expandable={{ 'expandedRowRender': expandedRowRender }}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
          summary={() => {
            return renderFooter(columns, data, true, aggregatesOverall, true)
          }}
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
  );
}

export default DeliveriesReport;