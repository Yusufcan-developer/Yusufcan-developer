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
import { Table, Row, Col, TreeSelect, Radio } from "antd";
import Input from '@iso/components/uielements/input';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Config
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import { DownloadOutlined } from '@ant-design/icons';
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';

//Other Library
import _ from 'underscore';
import ExcelExport from "./ExcelExport";
import moment from 'moment';
import enumerations from "../../config/enumerations";
import logMessage from "../../config/logMessage";
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;

export default function () {
  document.title = "Teminat Mektupları - Seramiksan B2B";

  const [searchKey, setSearchKey] = useState('');
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()));
  const [toDate, setToDate] = useState(moment(new Date('2100-02-02')));
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState()
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const [privateDate, setPrivateDate] = useState('Tumu');
  const [selectedRadioItem, setSelectedRadioItem] = useState(1);
  const location = useLocation();
  const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());
  const queryString = require('query-string');
  const history = useHistory();
  const Option = SelectOption;

  //Burada ki useEffect'ler page index page size  hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    postSaveLog(enumerations.LogSource.ReportLetters, enumerations.LogTypes.Browse, logMessage.Reports.Letters.browse);
    getVariablesFromUrl()
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  let searchUrl = queryString.parse(location.search);
  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
    useFetch(`${siteConfig.api.report.postLetters}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate !== null ? fromDate.format('YYYY-MM-DD') : null, "to": toDate !== null ? toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode }, searchUrl);
  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

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
    params.delete('pgsize');
    params.delete('pgindex');

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
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
  }

  function onChangeRadioButton(e) {
    setSelectedRadioItem(e.target.value);
    setPrivateDate(null);
  }

  //Change Cheques Type
  function privateDateHandleChange(value) {
    setPrivateDate(value);

    if (value === 'Tumu') {
      setFromDate(moment(moment().subtract(180, 'days').toDate()));
      setToDate(moment(new Date('2100-02-02')));
    }
    if (value === 'GelecekBirHafta') {
      setFromDate(moment(new Date()));
      setToDate(moment(moment().add(7, 'days').toDate()));
    }
    if (value === 'GelecekOnbesGun') {
      setFromDate(moment(new Date()));
      setToDate(moment(moment().add(15, 'days').toDate()));
    }
    else if (value === 'GelecekBirAy') {
      setFromDate(moment(new Date()));
      setToDate(moment(moment().add(30, 'days').toDate()));
    }
    else if (value === 'GelecekUcAy') {
      setFromDate(moment(new Date()));
      setToDate(moment(moment().add(90, 'days').toDate()));
    } else if (value === 'GelecekAltiAy') {
      setFromDate(moment(new Date()));
      setToDate(moment(moment().add(180, 'days').toDate()));
    }
  }

  //Excel Oluştur
  const exportExcelButton = () => {
    postSaveLog(enumerations.LogSource.ReportLetters, enumerations.LogTypes.Export, logMessage.Reports.Letters.exportExcel);
    ExcelExport(columns, data, 'Teminat Mektubu');
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
      key: "dealerName"
    },
    {
      title: "Bitiş Tarihi",
      dataIndex: "toDate",
      key: "toDate",
      render: (toDate) => (toDate !== null ? moment(toDate).format(siteConfig.dateFormat) : '-'),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'toDate' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Belge No",
      dataIndex: "documentId",
      key: "documentId",
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'documentId' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Başlangıç Tarihi",
      dataIndex: "fromDate",
      key: "fromDate",
      type: "date",
      render: (fromDate) => moment(fromDate).format(siteConfig.dateFormat),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'fromDate' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "TR Kodu",
      dataIndex: "trCode",
      key: "trCode",
      align: "center",
      footerKey: 'Genel Toplam',
    },
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => numberFormat(amount),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'amount' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
      footerKey: "amount"
    },
    {
      title: "Banka",
      dataIndex: "bank",
      key: "bank"
    },
    {
      title: "Şube",
      dataIndex: "branch",
      key: "branch"
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

  //Hide order table column
  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.GuaranteeLetterTableHideColumns.Field;
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
    const getHideColumns = ColumnOptionsConfig.GuaranteeLetterTableHideColumns.Region;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
    const getHideColumns = ColumnOptionsConfig.GuaranteeLetterTableHideColumns.Dealer;
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
        {<IntlMessages id="page.GuaranteeLetterTitle.header" />}
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
                  <FormItem label={<IntlMessages id="page.endDateRangeTitle" />}></FormItem>
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
                  onChange={onChangeDealerCode}
                  value={selectedDealerCode}
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
                        <Option value="Tumu">Tümü</Option>
                        <Option value="GelecekBirHafta">Gelecek 1 hafta</Option>
                        <Option value="GelecekOnbesGun">Gelecek 15 gün</Option>
                        <Option value="GelecekBirAy">Gelecek 1 ay</Option>
                        <Option value="GelecekUcAy">Gelecek 3 ay</Option>
                        <Option value="GelecekAltiAy">Gelecek 6 ay</Option>
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
                <Input size="small" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} placeholder="Anahtar kelime" value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
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
          loading={loading}
          pagination={false}
          // scroll={{ x: 'calc(700px + 50%)' }}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
          summary={() => {
            return renderFooter(columns, data, false, aggregatesOverall, true)
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
