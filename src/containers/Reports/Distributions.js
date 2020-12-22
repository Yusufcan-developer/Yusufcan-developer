//React
import React, { useState, useEffect } from "react";
import { NavLink, useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, TreeSelect } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

//Configs
import { DownloadOutlined } from '@ant-design/icons';
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';

//Other Library
import enumerations from "../../config/enumerations";
import _ from 'underscore';
import ExcelExport from "./ExcelExport";
import logMessage from "../../config/logMessage";
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
  document.title = "Dağıtım Listesi - Seramiksan B2B";

  const children = [];
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
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const [selectedStatusType, setSelectedStatusType] = useState();
  const [address, setAddress] = useState();
  const [lookupAddressChildren, setLookupAddressChildren] = useState();

  const queryString = require('query-string');
  const history = useHistory();

  //Burada ki useEffect'ler page index page size sonuçlarına göre veri getiriyor.
  useEffect(() => {
    postSaveLog(enumerations.LogSource.ReportDistributions, enumerations.LogTypes.Browse, logMessage.Reports.Distributions.browse);
    getVariablesFromUrl()
    setCurrentPage(pageIndex);
    const token = jwtDecode(localStorage.getItem("id_token"));
    if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
      getAdress(token.dcode);
    }
  }, [pageIndex]);

  let searchUrl = queryString.parse(location.search);
  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
    useFetch(`${siteConfig.api.report.postDistributions}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey,"status": selectedStatusType, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address  }, searchUrl);

  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

  //Durum Tipleri
  const [statusTypeData] = useFilterData(`${siteConfig.api.lookup.getDistributionStatusTypes}`, searchUrl);
  for (let i = 0; i < statusTypeData.length; i++) {
    children.push(<Option key={statusTypeData[i]}>{statusTypeData[i]}</Option>);
  }
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

    let statusGetType = [];
    if (parsed.status !== undefined) {
      if (Array.isArray(parsed.status)) {
        _.each(parsed.status, (item) => {
          statusGetType.push(item);
        });
      } else { statusGetType.push(parsed.status); }
    }
    setSelectedStatusType(statusGetType);

    let getAddress=[];
    if (parsed.address !== undefined) {
      if (Array.isArray(parsed.address)) {
        _.each(parsed.address, (item) => {
          getAddress.push(item);
        });
      } else { getAddress.push(parsed.address); }
    }
    setAddress(getAddress);
    
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
    params.delete('status');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('sortingField');
    params.delete('sortingOrder');
    params.delete('address');

    params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    if (sortingOrder !== undefined) { params.append('sortingOrder', sortingOrder); }
    if (sortingField !== undefined) { params.append('sortingField', sortingField); }
    if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
  
    _.filter(selectedStatusType, function (item) {
      params.append('status', item); params.toString();
    });

    _.forEach(address, (item) => {
      params.append('address', item); params.toString();
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
  //Change DealerCode
  async function onChangeDealerCode(value) {
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
    params.delete('address');

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
      if (dealerArrObj.length === 1) { await getAdress(dealerArrObj[0]); }
    }
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

  //Search DailerName Tree Select Component
  function filterTreeNodeDealerCode(value, treeNode) {
    if (value && treeNode && treeNode.title) {
      const filterValue = value.toLocaleLowerCase('tr')
      const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
      return treeNodeTitle.indexOf(filterValue) !== -1;
    }
    return false;
  }  
  
  //Change Status Type
  function statusTypeHandleChange(value) {
    setSelectedStatusType(value);
  }

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

 //Select Component Rol değiştirme 
  function addressHandleChange(value) {
    setAddress(value);
  }
//Get adress
async function getAdress(dealerCodes) {
  //Get User Info  
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
    }
  };
  await fetch(siteConfig.api.lookup.getAddresses.replace('{dealerCodes}', dealerCodes), requestOptions)
    .then(response => {
      const status = apiStatusManagement(response);
      return status;
    })
    .then(data => {
      const addressChildren = [];
      _.each(data, (item, i) => {
        addressChildren.push(<Option key={item.addressCode}>{item.addressCode + '-' + item.addressTitle + '-' + item.address2 + '-' + item.phone}</Option>);
      });
      setLookupAddressChildren(addressChildren)
    })
    .catch();
  return data;
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
      title: "Durum",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Dağıtım Kodu",
      dataIndex: "distributionId",
      key: "distributionId",
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'distributionId' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Dağıtım Sipariş Tarihi",
      dataIndex: "distributionOrderDate",
      key: "distributionOrderDate",
      key: "toDate",
      render: (distributionOrderDate) => moment(distributionOrderDate).format(siteConfig.dateFormat),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'distributionOrderDate' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Adres Kodu",
      dataIndex: "addressCode",
      key: "addressCode"
    },
    {
      title: "Adres Açıklama",
      dataIndex: "addressDescription",
      key: "addressDescription"
    },
    {
      title: "Sipariş No",
      dataIndex: "orderNo",
      key: "orderNo",
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
      sorter: (a, b) => a.itemCode.length - b.itemCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "itemCode" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Ürün Açıklaması",
      dataIndex: "itemDescription",
      key: "itemDescription"
    },
    {
      title: "Birim",
      dataIndex: "unit",
      key: "unit"
    },
    {
      title: "Ağırlık Birimi",
      dataIndex: "unitWeight",
      key: "unitWeight",
      footerKey:'Genel Toplam',
    },
    {
      title: "Planlanan Miktar",
      dataIndex: "plannedAmount",
      key: "plannedAmount",
      render: (plannedAmount) => numberFormat(plannedAmount),
      sorter: (a, b) => a.plannedAmount - b.plannedAmount,
      align: "right",
      sortOrder:
        tableOptions.sortedInfo.columnKey === "plannedAmount" &&
        tableOptions.sortedInfo.order,
      footerKey: "plannedAmount"
    },
    {
      title: "Dağıtılan  Miktar",
      dataIndex: "distributedAmount",
      key: "distributedAmount",
      align: "right",
      render: (distributedAmount) => numberFormat(distributedAmount),
      footerKey: "distributedAmount"
    },
    {
      title: "Kalan  Miktar",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "right",
      render: (remainingAmount) => numberFormat(remainingAmount),
      sorter: (a, b) => (''),
      sortOrder: tableOptions.sortedInfo.columnKey === 'remainingAmount' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
      footerKey: "remainingAmount"
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
    const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Field;
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
    const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Region;
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
    const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Dealer;
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
    postSaveLog(enumerations.LogSource.ReportDistributions, enumerations.LogTypes.Export, logMessage.Reports.Distributions.exportExcel);
    ExcelExport(columns, data, 'Dağıtım Listesi');
  }

  const view = viewType('Reports');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.distributionTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            {view !== 'MobileView' ?
              <Row>
                <Col span={view !== 'MobileView' ? 6 : 0} >
                  <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
                </Col>
                <Col span={view !== 'MobileView' ? 6 : 0} >
                  <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                </Col>  
                <Col span={view !== 'MobileView' ? 6 : 0} >
                <FormItem label={<IntlMessages id="page.addressTitle" />}></FormItem>
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
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%'  }}
                  dropdownMatchSelectWidth={500}
                />
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%'  }}
                />
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  mode={"multiple"}
                  style={{ width: '100%' }}
                  placeholder="Sevk Adresi Seçiniz"
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                  value={address}
                  dropdownMatchSelectWidth={750}
                  onChange={addressHandleChange}
                  filterOption={(input, option) =>
                    option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
                  }
                >
                  {lookupAddressChildren}
                </Select>
              </Col>
            </Row>
            {view!=='MobileView'?
            <Row>            
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                <FormItem label={<IntlMessages id="page.statusType" />}></FormItem>
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                  <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                </Col>
            </Row>
            :null}
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  mode="multiple"
                  style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%'  }}
                  placeholder="Durumu Tipi Seçiniz"
                  onChange={statusTypeHandleChange}
                  value={selectedStatusType}
                >
                  {children}
                </Select>
              </Col>

              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Input size="small" placeholder="Anahtar kelime" value={searchKey} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%'  }} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Button style={{ marginBottom: '8px',  width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
                  {<IntlMessages id="forms.button.label_Search" />}
                </Button>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box >
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
            return renderFooter(columns, data ,false ,aggregatesOverall,true)
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
