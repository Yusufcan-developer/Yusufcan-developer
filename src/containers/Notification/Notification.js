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
import { Table, Row, Col, Tag, Modal } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { usePostNotificationFetch } from "@iso/lib/hooks/fetchData/usePostNotification";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";

//Style
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "../Reports/ReportPagination";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
//Other Library
import ExcelExport from "../Reports/ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
import { bool } from "prop-types";
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;
export default function () {

  document.title = "Bildirimler - Seramiksan B2B";
  let newView = 'MobileView';
  if (window.innerWidth > 1220) {
    newView = 'DesktopView';
  }
  const Option = SelectOption;
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
  const [newUrlParams, setNewUrlParams] = useState('');
  const [selectedNotificationType, setSelectedNotificationType] = useState();
  const [selectedIsRead, setSelectedIsRead] = useState();
  const location = useLocation();
  const queryString = require('query-string');
  const history = useHistory();

  //Burada ki useEffect'ler page index page size
  useEffect(() => {
    getVariablesFromUrl()
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  const token = jwtDecode(localStorage.getItem("id_token"));
  let searchUrl = queryString.parse(location.search);
  let uid = parseInt(token.uid);
  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    usePostNotificationFetch(`${siteConfig.api.security.postNotification}`, { "notificationTypes": selectedNotificationType, "isRead": selectedIsRead, "userIds": [uid], "from": fromDate.format('YYYY-MM-DD'), "to": toDate.format('YYYY-MM-DD'), "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder }, searchUrl);

  //Notifcation Tipleri
  const [notifacationTypeData] = useFilterData(`${siteConfig.api.security.getNotificationType}`, searchUrl);
  const lookUpNotificationType = [];
  _.each(notifacationTypeData, (item) => {
    lookUpNotificationType.push(<Option key={item.Key}>{item.Value}</Option>);
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
    if (parsed.isRead !== undefined) {
      if (parsed.isRead === 'true') { setSelectedIsRead(true) }
      else if (parsed.isRead === 'false') { setSelectedIsRead(false) }
      else { setSelectedIsRead(null) }
    }

    let type = [];
    if (parsed.type !== undefined) {
      if (Array.isArray(parsed.type)) {
        _.each(parsed.type, (item) => {
          type.push(item);
        });
      } else { type.push(parsed.type); }
    }
    setSelectedNotificationType(type);
    return setOnChange(true);
  }


  //Get Search Data
  function dataSearch(selectedPageIndex, selectedPageSize) {
    const params = new URLSearchParams(location.search);

    params.delete('isRead');
    params.delete('type');
    params.delete('from');
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');
    if (selectedIsRead !== undefined) { params.append('isRead', selectedIsRead); }
    if (fromDate !== '' & toDate !== '') {
      params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
      params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    }
    if (sortingOrder !== undefined) { params.append('sortingOrder', sortingOrder); }
    if (sortingField !== undefined) { params.append('sortingField', sortingField); }
    if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    _.filter(selectedNotificationType, function (item) {
      params.append('type', item); params.toString();
    });

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

  //Change Notification Type
  function notificationTypeHandleChange(value) {
    setSelectedNotificationType(value);
  }
  let columns = [
    {
      title: "Bildirim Tipi",
      dataIndex: "notificationTypeName",
      key: "logSource",
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Okundu Durumu",
      dataIndex: "isRead",
      key: "isRead",
      render: isRead => (
        <>
          {!isRead ? (
            <Tag color={'red'} key={false}>
              {'Okunmadı'}
            </Tag>
          ) : (
              <Tag color={'green'} key={true}>
                {'Okundu'}
              </Tag>
            )}
        </>
      ),
    },
    {
      title: "Oluşturan",
      dataIndex: "createdByUserId",
      key: "createdByUserId",
    },
    {
      title: "Oluşturulma Tarihi",
      dataIndex: "createdOn",
      key: "createdOn",
      type: "createdOn",
      render: (createdOn) => (moment(createdOn).format(siteConfig.dateFormatAddTime)),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'createdOn' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Okunma Tarihi",
      dataIndex: "readOn",
      key: "readOn",
      type: "readOn",
      render: (readOn) => (readOn !== null ? moment(readOn).format(siteConfig.dateFormatAddTime) : '-'),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'readOn' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
  ];

  //Hide order table column
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
  function statusHandleChange(value) {
    setSelectedIsRead(value);
  }
  //Excel Oluşturma
  const exportExcelButton = () => {
    ExcelExport(columns, data, 'Bildirim');
  }
  async function postNotificationIsred(notificationId) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    let newPostIsReadUrl = siteConfig.api.security.postIsRead.replace('{notificationId}', notificationId);
    await fetch(`${newPostIsReadUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response, true);
        return status;
      })
      .then(data => {
        if (data !== 'Unauthorized1') {
        }
      })
      .catch();
  }
  function selectedNotification(item) {
    postNotificationIsred(item.id);
    Modal.info({
      okText: 'Tamam',
      width: 500,
      title: item.notificationTypeName,
      content: (
        <div>
          <br />
          <p>{(moment(item.createdOn).format(siteConfig.dateFormatAddTime))}</p>
          <br />
          <p>{item.description}</p>
        </div>
      ),
      onOk() { window.location.reload(true);},
    });
  }
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.notification.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            {newView !== 'MobileView' ?
              <Row>
                <Col span={6}>
                  <FormItem label={<IntlMessages id="page.isReadStatus" />}></FormItem>
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
              <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
                <Select
                  showSearch
                  mode="single"
                  dropdownMatchSelectWidth={200}
                  style={{ marginBottom: '8px', width: '250px' }}
                  placeholder="Bildirim Durumu Seçiniz"
                  optionFilterProp="children"
                  value={selectedIsRead}
                  onChange={statusHandleChange}
                >
                  <Option value={true} label="Okundu">
                    <div className="demo-option-label-item">
                      Okundu
      </div>
                  </Option>
                  <Option value={false} label="Okunmadı">
                    <div className="demo-option-label-item">
                      Okunmadı
      </div>
                  </Option>
                  <Option value={null} label="Hepsi">
                    <div className="demo-option-label-item">
                      Hepsi
      </div>
                  </Option>
                </Select>
              </Col>
              <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
              <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
                <Input size="small" placeholder="Anahtar kelime" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={newView !== 'MobileView' ? 5 : 0} offset={newView !== 'MobileView' ? 1 : 0} >
                <Button type="primary" onClick={searchButton}>
                  {<IntlMessages id="forms.button.label_Search" />}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={newView !== 'MobileView' ? 6 : 0} >
                <FormItem label={<IntlMessages id="page.notificationTypes" />}></FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
                <Select
                  mode="multiple"
                  style={{ marginBottom: '8px', width: '320px' }}
                  placeholder="Bildirim Tipi Seçiniz"
                  onChange={notificationTypeHandleChange}
                  value={selectedNotificationType}
                >
                  {lookUpNotificationType}
                </Select>

              </Col>
              <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
                <Col span={newView === 'MobileView' ? 5 : 0} offset={newView === 'MobileView' ? 1 : 0} >
                  <Button type="primary" onClick={searchButton}>
                    {<IntlMessages id="forms.button.label_Search" />}
                  </Button>
                </Col>
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
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
          onRow={(record) => ({
            onClick: () => (selectedNotification(record))
          })}
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
