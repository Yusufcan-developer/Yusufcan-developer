//React
import React, { useState, useEffect, state } from "react";
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
import { Table, Row, Col, Tag, Modal, Radio } from "antd";
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
import viewType from '@iso/config/viewType';

//Other Library
import ExcelExport from "../Reports/ExcelExport";
import { strikeout } from "../Ecommerce/Cart/color.css";
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
let countControl = 0;
let selectedTotalCount = 0;
export default function () {

  document.title = "Bildirimler - Seramiksan B2B";

  const Option = SelectOption;
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
  const [newUrlParams, setNewUrlParams] = useState('');
  const [selectedNotificationType, setSelectedNotificationType] = useState();
  const [selectedIsRead, setSelectedIsRead] = useState();
  const [selectedRadioItem, setSelectedRadioItem] = useState(1);
  const [privateDate, setPrivateDate] = useState('Bugun');
  const location = useLocation();
  const queryString = require('query-string');
  const history = useHistory();
  const [selectedItemsId, setSelectedItemsId] = useState([]);
  const [selectAllLoading, setSelectedLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  let dataAddKeyValue;
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
    usePostNotificationFetch(`${siteConfig.api.security.postNotification}`, { "notificationTypes": selectedNotificationType, "isRead": selectedIsRead, "userIds": [uid], "from":fromDate !== null ?  fromDate.format('YYYY-MM-DD') : null, "to":toDate !== null ?  toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder }, searchUrl);

  if (data.length > 0) {
    dataAddKeyValue = _.each(data, (item) => {
      item['key'] = item['id'];
    });
  }
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
    if (parsed.from !== undefined) { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
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

    if ((fromDate !== '' & toDate !== '') && (fromDate !== null & toDate !== null)){
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
  //Keyword 'Enter' search
  const keyPress = e => {
    if (e.keyCode === 13) {
      dataSearch();
    }
  }
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

  function onChangeRadioButton(e) {
    setSelectedRadioItem(e.target.value);
    setPrivateDate(null);
  }

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
      ellipsis: true,
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
    }
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
  async function postNotificationIsread(notificationId, multipleIdPost) {
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
          countControl += 1;
          if (multipleIdPost) {
            if (countControl === selectedItemsId.length) {
              countControl = 0;
              window.location.reload(true);
            }
          }
        }
      })
      .catch();
  }
  async function multiplePostNotificationIsRead() {
    _.each(selectedItemsId, (item) => {
      postNotificationIsread(item, true);
    });
  }
  function selectedNotification(item) {
    if (!item.isRead) {
      postNotificationIsread(item.id);
    }
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
      onOk() { if (!item.isRead) { window.location.reload(true); } },
    });
  }
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onSelect: (record, selected, selectedRows) => {
      let selectedIds = []
      if (selectedRows.length > 0) {
        _.each(selectedRows, (item) => {
          if (item !== undefined) {
            selectedIds.push(item.id);
          }
        });
        setSelectedItemsId(selectedIds);
        selectedTotalCount = selectedIds.length;
        setHasSelected(true);
      }
      else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); }
    },
    onSelectAll: (record, selected, selectedRows) => {
      let selectedIds = []
      if (record) {
        _.each(selectedRows, (item) => {
          selectedIds.push(item.id);
        });
        if (selectedRows.length > 0) {
          setSelectedItemsId(selectedIds);
          selectedTotalCount = selectedIds.length;
          setHasSelected(true);
        }
      }
      else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); }
    }
  };
  const view = viewType('Notifications');
  const filterView = viewType('Filter');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.notification.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            {view !== 'MobileView' ?
              <Row>
                <Col span={6}>
                  <FormItem label={<IntlMessages id="page.isReadStatus" />}></FormItem>
                </Col>
                <Col span={6} >
                  <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                </Col>
              </Row>
              : null}
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  showSearch
                  mode="single"
                  dropdownMatchSelectWidth={200}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
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
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Input size="small" placeholder="Anahtar kelime" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
              </Col>
            </Row>
            {view !== 'MobileView' ?
              <Row>
                <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                  <FormItem label={<IntlMessages id="page.notificationTypes" />}></FormItem>
                </Col>
                <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                  <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                </Col>
              </Row> : null}
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  mode="multiple"
                  dropdownMatchSelectWidth={380}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  placeholder="Bildirim Tipi Seçiniz"
                  onChange={notificationTypeHandleChange}
                  value={selectedNotificationType}
                >
                  {lookUpNotificationType}
                </Select>

              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Radio.Group onChange={onChangeRadioButton} value={selectedRadioItem} style={view === 'MobileView' ? null : { marginLeft: '-30px' }}>
                  <Row>
                    <Col span={2} >
                      <Radio value={1} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
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
                      <Radio value={2} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} size="small">
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
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" disabled={!hasSelected} loading={selectAllLoading} onClick={() => (multiplePostNotificationIsRead())}>
            Okundu Olarak İşaretle
          </Button>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `${selectedTotalCount} Öğe seçildi` : ''}
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={dataAddKeyValue}
          onChange={handleChange}
          loading={loading}
          pagination={false}
          scroll={{ x: 'calc(700px + 50%)' }}
          size="medium"
          bordered={false}
          rowSelection={{
            ...rowSelection
          }}
          rowClassName={(record, index) => (record.isRead === true ? 'table-background-color-notification-isUnRead' : "table-background-color-notification-isUnRead")}
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
