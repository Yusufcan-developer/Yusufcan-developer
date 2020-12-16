//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, TreeSelect } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { usePostLogFetch } from "@iso/lib/hooks/fetchData/usePostLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { useUserFetch } from "@iso/lib/hooks/fetchData/usePostUserApi";

//Style
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "../Reports/ReportPagination";
import viewType from '@iso/config/viewType';

//Other Library
import ExcelExport from "../Reports/ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;
export default function () {
  document.title = "Olay Günlükleri - Seramiksan B2B";

  const children = [];
  const Option = SelectOption;
  const [searchKey, setSearchKey] = useState('');
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [roleNames, setRoleNames] = useState();
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()));
  const [toDate, setToDate] = useState(moment(new Date()));
  const [userIds, setUserIds] = useState();
  const [newUrlParams, setNewUrlParams] = useState('');
  const [selectedLogType, setSelectedLogType] = useState();
  const [selectedLogSource, setSelectedLogSource] = useState();
  const location = useLocation();
  const queryString = require('query-string');
  const history = useHistory();

  //Burada ki useEffect'ler page index page size
  useEffect(() => {
    getVariablesFromUrl()
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    getVariablesFromUrl()
    setChangePageSize(pageSize);
  }, [pageSize]);

  let searchUrl = queryString.parse(location.search);
  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    usePostLogFetch(`${siteConfig.api.security.postLog}`, { "logSources": selectedLogSource, "logTypes": selectedLogType, "userIds": userIds, "from": fromDate.format('YYYY-MM-DD'), "to": toDate.format('YYYY-MM-DD'), "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder }, searchUrl);

  //Kullanıcı listesi
  const [userData] =
    useUserFetch(`${siteConfig.api.users.postUsers}`, { "keyword": searchKey, "isActive": null, "roleNames": roleNames, "pageIndex": 0, "pageCount": 10000000 });
  const lookupDealerChildren = [];
  _.each(userData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.id}>{item.firstName === '' ? item.username + '-' + item.title : item.username + '-' + item.firstName + ' ' + item.lastName}</Option>);
  });

  //Log Tipleri
  const [logTypeData] = useFilterData(`${siteConfig.api.security.getLogTypes}`, searchUrl);
  const lookUpLogType = [];
  _.each(logTypeData, (item) => {
    lookUpLogType.push(<Option key={item.Key}>{item.Value}</Option>);
  });

  //Log Source
  const [logSourceData] = useFilterData(`${siteConfig.api.security.getLogSources}`, searchUrl);
  const lookUpLogSource = [];
  _.each(logSourceData, (item) => {
    lookUpLogSource.push(<Option key={item.Key}>{item.Value}</Option>);
  });

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

    let type = [];
    if (parsed.type !== undefined) {
      if (Array.isArray(parsed.type)) {
        _.each(parsed.type, (item) => {
          type.push(item);
        });
      } else { type.push(parsed.type); }
    }

    let source = [];
    if (parsed.source !== undefined) {
      if (Array.isArray(parsed.source)) {
        _.each(parsed.source, (item) => {
          source.push(item);
        });
      } else { source.push(parsed.source); }
    }

    let user = [];
    if (parsed.user !== undefined) {
      if (Array.isArray(parsed.user)) {
        _.each(parsed.user, (item) => {
          user.push(parseInt(item));
        });
      } else { user.push(parseInt(parsed.user)); }
    }

    setSelectedLogType(type);
    setSelectedLogSource(source);
    setUserIds(user);

    return setOnChange(true);
  }

  function dealerCodeHandleChange(value) {
    let userObj = [];
    const params = new URLSearchParams(location.search);
    params.delete('user');
    params.delete('user')
    params.delete('type');
    params.delete('source');
    params.delete('from');
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');
    if (value.length === 0) { setNewUrlParams(''); params.delete('user'); setUserIds(userObj); }
    else {
      _.filter(value, function (item) {
        userObj.push(parseInt(item)); params.append('user', item); params.toString();
      });
    }
    setUserIds(userObj);
    setNewUrlParams(params.toString());
  }

  //Get Search Data
  function dataSearch(selectedPageIndex, selectedPageSize) {
    const params = new URLSearchParams(location.search);
    params.delete('user')
    params.delete('type');
    params.delete('source');
    params.delete('from');
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


  //Change from and To date
  function changeTimePicker(value, dateString) {
    setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
    setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
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

  //Change Source
  function logSourceHandleChange(value) {
    let sourceObj = [];
    const params = new URLSearchParams(location.search);
    params.delete('user');
    params.delete('source');
    params.delete('from');
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');

    if (value.length === 0) { setNewUrlParams(''); params.delete('source'); setSelectedLogSource(sourceObj); }
    else {
      _.filter(value, function (item) {
        sourceObj.push(item); params.append('source', item); params.toString();
      });
    }
    setSelectedLogSource(sourceObj);
    setNewUrlParams(params.toString());
  }
  //Change Log Type
  function logTypeHandleChange(value) {
    let typeObj = [];
    const params = new URLSearchParams(location.search);
    params.delete('user')
    params.delete('type');
    params.delete('from');
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');

    if (value.length === 0) { setNewUrlParams(''); params.delete('type'); setSelectedLogType(typeObj); }
    else {
      _.filter(value, function (item) {
        typeObj.push(item); params.append('type', item); params.toString();
      });
    }
    setSelectedLogType(typeObj);
    setNewUrlParams(params.toString());
  }
  let columns = [
    {
      title: "Kullanıcı Adı",
      dataIndex: "userFullName",
      key: "userFullName"
    },
    {
      title: "Hesap No",
      dataIndex: "accountNo",
      key: "accountNo"
    },
    {
      title: "Kullanıcı Hesap Adı",
      dataIndex: "accountName",
      key: "accountName"
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      type: "date",
      render: (date) => moment(date).format(siteConfig.dateFormatAddTime),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'date' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Olay Kaynağı",
      dataIndex: "logSourceName",
      key: "logSource",
    },
    {
      title: "Olay Tipi",
      dataIndex: "logTypeName",
      key: "logType",
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "İp Adresi",
      dataIndex: "ipAddress",
      key: "ipAddress",
    },

  ];

  //Hide order table column
  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Field;
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
    const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Region;
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
    const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  //Keyword 'Enter' search
  const keyPress = e => {
    if (e.keyCode === 13) {
      dataSearch();
    }
  }
  //Excel Oluşturma
  const exportExcelButton = () => {
    ExcelExport(columns, data, 'Kullanıcı Olay Günlügü');
  }

  const view = viewType('Logs');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.logs.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            {view !== 'MobileView' ?
              <Row>
                <Col span={6}>
                  <FormItem label={<IntlMessages id="page.users" />}></FormItem>
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
                <Select
                  showSearch
                  mode="multiple"
                  dropdownMatchSelectWidth={500}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  placeholder="Kullanıcı Seçiniz"
                  optionFilterProp="children"
                  value={userIds}
                  onChange={dealerCodeHandleChange}
                  filterOption={(input, option) =>
                    option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {lookupDealerChildren}
                </Select>
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
                <Input size="small" placeholder="Anahtar kelime" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
              </Col>
            </Row>
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} >
                <FormItem label={<IntlMessages id="page.transactionTypes" />}></FormItem>
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} >
                <FormItem label={<IntlMessages id="page.logSources" />}></FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  mode="multiple"
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  placeholder="Olay Tipi Seçiniz"
                  onChange={logTypeHandleChange}
                  value={selectedLogType}
                >
                  {lookUpLogType}
                </Select>

              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  mode="multiple"
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  placeholder="Olay Kaynağı Seçiniz"
                  onChange={logSourceHandleChange}
                  value={selectedLogSource}
                >
                  {lookUpLogSource}
                </Select>

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
