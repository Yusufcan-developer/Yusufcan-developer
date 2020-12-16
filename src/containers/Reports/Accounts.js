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
import { Table, Row, Col, Pagination, TreeSelect, Tag } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import { DownloadOutlined } from '@ant-design/icons';
import siteConfig from "@iso/config/site.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';

//Other Library
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
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
  document.title = "Cari Kayıtlar - Seramiksan B2B";
  
  const [searchKey, setSearchKey] = useState('');
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()));
  const [toDate, setToDate] = useState(moment(new Date()));
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')

  const location = useLocation();
  const queryString = require('query-string');
  const history = useHistory();

  //Burada ki useEffect'ler page index page size göre verileri getiriyor.
  useEffect(() => {
    postSaveLog(enumerations.LogSource.ReportAccounts, enumerations.LogTypes.Browse, logMessage.Reports.Accounts.browse);
    getVariablesFromUrl()
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  let searchUrl = queryString.parse(location.search);
  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useFetch(`${siteConfig.api.security.postAccounts}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder }, searchUrl);

  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl() {

    const parsed = queryString.parse(location.search);

    if (parsed.from !== undefined) { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
    if (parsed.from !== undefined) { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
    if (parsed.sortingField !== undefined) { sortingField = parsed.sortingField; }
    if (parsed.sortingOrder !== undefined) { sortingOrder = parsed.sortingOrder; }
    let newDealarCode = []

    if (parsed.fic !== undefined) {
      if (Array.isArray(parsed.fic)) {
        _.each(parsed.fic, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.fic) }
    }

    if (parsed.rec !== undefined) {
      if (Array.isArray(parsed.rec)) {
        _.each(parsed.rec, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.rec) }
    }

    if (parsed.dec !== undefined) {
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

    if (fromDate !== '' & toDate !== '') {
      params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
      params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    }
    if (sortingOrder !== undefined) { params.append('sortingOrder', sortingOrder); }
    if (sortingField !== undefined) { params.append('sortingField', sortingField); }
    if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

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
    setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
    setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
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
    if (sorter !== undefined) {
      if (sorter.order === "descend") {
        sortingOrder = 'DESC';
      } else { sortingOrder = 'ASC'; }

      sortingField = sorter.field;
      dataSearch()
    }
  };

  //Pagination : Tablo  pageSize'ı değiştirir
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
  }

  // Pagination : Seçili sayfanın saklandığı state'i değiştirir
  function currentPageChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
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
      title: "Cari/DBS",
      dataIndex: "dealerSubCode",
      key: "dealerSubCode",
      render: dealerSubCode => (
        <>
          {!dealerSubCode.endsWith('D') ? (
            <Tag color={'green'} key={dealerSubCode}>
              {'CARİ'}
            </Tag>
          ) : (
              <Tag color={'geekblue'} key={dealerSubCode}>
                {'DBS'}
              </Tag>
            )}
        </>
      ),
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
    {
      title: "Bakiye",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => numberFormat(balance),
      sorter: (a, b) => a.balance - b.balance,
      align: "right",
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'documentId' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
      footerKey: "balance"
    },
    {
      title: "Bakiye Durumu",
      dataIndex: "balanceStatus",
      key: "balanceStatus"
    },
    {
      title: "HK Durumu",
      dataIndex: "financialStatus",
      key: "financialStatus",
      render: (financialStatus) => (
        <>
          {financialStatus === 9 ? (
            (<Tag color={'Red'} key={financialStatus}>
              {financialStatus}
            </Tag>)

          ) : (
              <Tag color={'Grey'} key={financialStatus}>
                {financialStatus}
              </Tag>)}
        </>
      ),
    },
    {
      title: "Adres",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "İletişim",
      dataIndex: "contact",
      key: "contact"
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Bayi Alt Kodu",
      dataIndex: "dealerSubCode",
      key: "dealerSubCode"
    }
  ];
  //Hide order table column

  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.CustomerListTableHideColumns.Field;
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
    const getHideColumns = ColumnOptionsConfig.CustomerListTableHideColumns.Region;
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
    const getHideColumns = ColumnOptionsConfig.CustomerListTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }

  //Excel Oluştur
  const exportExcelButton = () => {
    postSaveLog(enumerations.LogSource.ReportAccounts, enumerations.LogTypes.Export, logMessage.Reports.Accounts.exportExcel);
    ExcelExport(columns, data, 'Cari Kayıtlar');
  }

  const view = viewType('Reports');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.customerListTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
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
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                />
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
            return renderFooter(columns, data)
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
