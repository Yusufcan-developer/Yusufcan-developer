import React, { useState, useEffect, Children } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';
import Input from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import ExcelExport from "../ExcelExport/ExcelExport";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    xs: { span: 4 },
    sm: { span: 2 }
  },
  wrapperCol: {
    xs: { span: 16 },
    sm: { span: 8 }
  }
};

const ChequesReport = () => {

  const [iconLoading, setIconLoading] = React.useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: '',
    filteredInfo: ''
  });
  const children = [];
  const Option = SelectOption;
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const [searchKey, setSearchKey] = useState('');
  const [serialNumber, setSerialNumber] = useState();
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState()
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [selectedCheckqueType, setSelectedCheckqueType] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();

  const match = useRouteMatch();
  const queryString = require('query-string');
  const history = useHistory();

  function getQueryVariable(query) {

    const parsed = queryString.parse(location.search);

    if (parsed.from !== undefined) { setFromDate(moment(parsed.from).format('DD-MM-YYYY')) }
    if (parsed.from !== undefined) { setToDate(moment(parsed.to).format('DD-MM-YYYY')) }
    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.sno !== undefined) { setSerialNumber([parsed.sno]); }
    let checkType = [];
    if (parsed.ctype !== undefined) {
      if (Array.isArray(parsed.ctype)) {
        _.each(parsed.ctype, (item) => {
          checkType.push(item);
        });
      } else { checkType.push(parsed.ctype); }
    }
    setSelectedCheckqueType(checkType);
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
  }
  useEffect(() => {
    getQueryVariable(searchQuery)
    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  useEffect(() => {
    getQueryVariable(searchQuery)
    setChangePageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    getQueryVariable(searchQuery)
    setFromDate(fromDate);
    setToDate(toDate);
  }, [fromDate, toDate]);

  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useFetch(`${siteConfig.api.cheques}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "serialNumbers": serialNumber, "types": selectedCheckqueType, "keyword": searchKey, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });

  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);

  const [chequeTypeData] = useFilterData(`${siteConfig.api.chequeTypes}`);
  for (let i = 0; i < chequeTypeData.length; i++) {
    children.push(<Option key={chequeTypeData[i]}>{chequeTypeData[i]}</Option>);
  }
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const exportExcelButton = () => {
    ExcelExport(columns, data, 'Çek-Senet');
  }

  const searchButton = () => {

    const params = new URLSearchParams(location.search);

    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');
    params.delete('sno');
    params.delete('ctype');

    params.append('from', moment(fromDate).format('YYYY-DD-MM')); params.toString();
    params.append('to', moment(toDate).format('YYYY-DD-MM')); params.toString();
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    if (serialNumber !== undefined) { params.append('sno', serialNumber); params.toString(); }
    if (selectedCheckqueType !== undefined) {
      _.filter(selectedCheckqueType, function (item) {
        params.append('ctype', item); params.toString();
      })
    }

    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

    return setOnChange(true);
  };
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
    params.delete('serialNumber');
    params.delete('ctype');

    if (value.length === 0) { setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj); setSelectedDealerCode([]) }
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

  function changeTimePicker(value, dateString) {

    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }


  function onOk(value) {
    console.log('onOk: ', value);
  }

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    console.log("pageSize :", pageSize);
    console.log("current :", current);
    setPageSize(pageSize);
    setlocalCurrentPage(current);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current) {

    console.log("current :", current);
    setlocalCurrentPage(current);
  }
  function chequeHandleChange(value) {
    setSelectedCheckqueType(value);
  }
  let columns = [
    {
      title: "Türü",
      dataIndex: "type",
      key: "type"
    },
    {
      title: "Müşteri Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode"
    },
    {
      title: "Müşteri Ünvan",
      dataIndex: "dealerName",
      key: "dealerName"
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
      title: "Alan Kodu",
      dataIndex: "fieldCode",
      key: "fieldCode"
    },
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount.toFixed(2),
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "amount" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Vade",
      dataIndex: "issueDate",
      key: "issueDate",
      type: "date",
      render: (issueDate) => moment(issueDate).format(siteConfig.dateFormat),
      sorter: (a, b) => a.issueDate - b.issueDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "issueDate" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Seri No",
      dataIndex: "serialNumber",
      key: "serialNumber"
    },
    {
      title: "Keşide Eden",
      dataIndex: "signatureDrawer",
      key: "signatureDrawer"
    },
    {
      title: "Ödeme Yeri",
      dataIndex: "placeOfPayment",
      key: "placeOfPayment"
    },
    {
      title: "Çekin Bankası",
      dataIndex: "bank",
      key: "bank"
    },
    {
      title: "Durumu",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status - b.status,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "status" &&
        tableOptions.sortedInfo.order
    },
  ];

  //Hide order table column
  const role = window.sessionStorage.getItem("role");
  if (role === 'admin') { }
  else if (role === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.CheckingReportTableHideColumns.Field;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if (role === 'regionmanager') {
    const getHideColumns = ColumnOptionsConfig.CheckingReportTableHideColumns.Region;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if (role === 'dealer') {
    const getHideColumns = ColumnOptionsConfig.CheckingReportTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.checkingReportsTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <Row>
              <Col span={6}>
                <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.chequesType" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <TreeSelect
                  treeData={treeData}
                  onChange={onChangeDealerCode}
                  value={selectedDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Bayi Kodu Seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: '250px' }}
                  dropdownMatchSelectWidth={500}
                />
              </Col>
              <Col span={6}>
                <Select
                  mode="multiple"
                  style={{ marginBottom: '8px', width: '250px' }}
                  placeholder="Çek Türü Seçiniz"
                  onChange={chequeHandleChange}
                  value={selectedCheckqueType}
                >
                  {children}
                </Select>
              </Col>
              <Col span={6}>
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onOk={onOk}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={5}>
                <FormItem label={<IntlMessages id="page.serialNumber" />}></FormItem>
              </Col>
              <Col span={5} offset={1}>
                <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
              </Col>
              <Col span={6} offset={2}>
              </Col>
            </Row>
            <Row>
              <Col span={5}>
                <Input size="small" placeholder="Seri No" value={serialNumber} onChange={event => setSerialNumber([event.target.value])} />
              </Col>
              <Col span={5} offset={1}>
                <Input size="small" placeholder="Anahtar kelime" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={5} align="right">
                <Button type="primary" loading={iconLoading} onClick={searchButton}>
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
          <Button align="right" type="primary" loading={iconLoading} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button>
        </Col>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
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
          position="bottom"
        />
      </Box>
    </LayoutWrapper>
  );
}
export default ChequesReport;