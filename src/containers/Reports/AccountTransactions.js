import React, { useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, TreeSelect } from "antd";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import ExcelExport from "../ExcelExport/ExcelExport";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

export default function () {
  const [searchKey, setSearchKey] = useState('');
  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [iconLoading, setIconLoading] = React.useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20)
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState()
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();

  const queryString = require('query-string');
  const history = useHistory();

  function getQueryVariable(query) {

    const parsed = queryString.parse(location.search);

    if (parsed.from !== undefined) { setFromDate(moment(parsed.from).format('DD-MM-YYYY')) }
    if (parsed.from !== undefined) { setToDate(moment(parsed.to).format('DD-MM-YYYY')) }
    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }   
    if ((parsed.pgindex !== undefined)&& (selectedCurrentPage===0)) { setlocalCurrentPage(parseInt(parsed.pgindex)); }
    

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
    console.log("currentPage!", localCurrentPage);
    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  useEffect(() => {
    getQueryVariable(searchQuery)
    console.log("pageSize!", pageSize);
    setChangePageSize(pageSize);
  }, [pageSize]);

  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useFetch(`${siteConfig.api.transactions}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });

  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const exportExcelButton = () => {
    ExcelExport(columns, data, 'Cari Hareketler');
  }
  function dataSearch(selectedPageIndex,selectedPageSize) {
    const params = new URLSearchParams(location.search);
    
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');

    params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    if (selectedPageSize) { params.append('pgsize', selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { params.append('pgindex', localCurrentPage) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

    return setOnChange(true);
  }
  const searchButton = () => {
    dataSearch();
  };

  function changeTimePicker(value, dateString) {

    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }
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
  function onChange(value, dateString) {
    console.log("Selected Time: ", value);
    console.log("Başlanıç Tarihi: ", dateString[0]);
    console.log("Bitiş Tarihi: ", dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
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
    setPageSize(pageSize);
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    dataSearch(current,pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current) {
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    dataSearch(current);
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
      title: "Bölge Müdürü",
      dataIndex: "regionManager",
      key: "regionManager"
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      type: "date",
      render: (date) => moment(date).format(siteConfig.dateFormat),
      sorter: (a, b) => a.date - b.date,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "date" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Belge numarası",
      dataIndex: "documentId",
      key: "documentId",
      sorter: (a, b) => a.documentId.length - b.documentId.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "documentId" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "TR Kod",
      dataIndex: "trCode",
      key: "trCode",
      align: "center"
    },
    {
      title: "İşlem Tipi",
      dataIndex: "transactionType",
      key: "transactionType"
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Borç",
      dataIndex: "debt",
      key: "debt",
      align: "right",
      sorter: (a, b) => a.debt - b.debt,
      render: (debt) => debt.toFixed(2),
      sortOrder:
        tableOptions.sortedInfo.columnKey === "debt" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Kredi",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      render: (credit) => credit.toFixed(2),
      sorter: (a, b) => a.credit - b.credit,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "credit" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Para Birimi",
      dataIndex: "currency",
      key: "currency",
      align: "center"
    }
  ];

  //Hide order table column
  const role = window.sessionStorage.getItem("role");
  if (role === 'admin') { }
  else if (role === 'fieldmanager') {
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
  else if (role === 'regionmanager') {
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
  else if (role === 'dealer') {
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
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.customerRecordTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
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
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onOk={onOk}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
              <Col span={6}>
                <Input size="small" placeholder="Anahtar kelime" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={5} offset={1}>
                <Button type="primary" loading={iconLoading} onClick={searchButton}>
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
          <Button align="right" type="primary" loading={iconLoading} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button>
        </Col>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={localCurrentPage}
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
          current={localCurrentPage}
          position="bottom"
        />
      </Box>
    </LayoutWrapper>
  );
}
