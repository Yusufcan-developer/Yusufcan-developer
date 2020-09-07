//React
import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';

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
import { Table, Row, Col, Pagination, TreeSelect, Descriptions, Typography, Tag, Select } from "antd";

//Fetch
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { usePostDBSTotal1 } from "@iso/lib/hooks/fetchData/usePostDBSTotal";
//Styles
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import numberFormat from "@iso/config/numberFormat";

//Other Library
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
import { usePostDBSTotalReport } from "../../library/hooks/fetchData/usePostDBSTotal";
import { usePostCariToplamlarReport } from "../../library/hooks/fetchData/usePostCariToplamlar";
import ReportPagination from "../Reports//ReportPagination";
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const MainForm = () => {

  const queryString = require('query-string');
  const history = useHistory();

  const [lookupAddressChildren, setLookupAddressChildren] = useState();
  const [searchKey, setSearchKey] = useState('');
  const [expandedKeys, setExpandedKeys] = useState();
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [iconLoading, setIconLoading] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [pageIndexCariToplamlar, setPageIndexCariToplamlar] = useState(1);
  const [pageSizeCariToplamlar, setPageSizeCariToplamlar] = useState(20)
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('');
  const [adress, setAdress] = useState();
  const location = useLocation();
  const { searchQuery } = useParams();
  const { Text } = Typography;

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    setCurrentPage(pageIndex);
    // getVariablesFromUrl(searchQuery)
  }, [pageIndex]);

  useEffect(() => {
    setChangePageSize(pageSize);
    // getVariablesFromUrl(searchQuery)
  }, [pageSize]);

  useEffect(() => {
    setCurrentPageCariToplamlar(pageIndexCariToplamlar);
    // getVariablesFromUrl(searchQuery)
  }, [pageIndexCariToplamlar]);

  useEffect(() => {
    setChangePageSizeCariToplamlar(pageSizeCariToplamlar);
    // getVariablesFromUrl(searchQuery)
  }, [pageSizeCariToplamlar]);

  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray, orderDetailData] =
    usePostDBSTotalReport(`${siteConfig.api.report.postDBSTotal}`, { "pageIndex": pageIndex - 1, "pageCount": pageSize });

  const [cariToplamlarData, cariToplamlarloading, cariToplamlarcurrentPage, setCurrentPageCariToplamlar, CariToplamlarchangePageSize, setChangePageSizeCariToplamlar, CariToplamlartotalDataCount, CariToplamlarsetOnChange] =
    usePostCariToplamlarReport(`${siteConfig.api.report.postCariTotal}`, { "pageIndex": pageIndexCariToplamlar - 1, "pageCount": pageSizeCariToplamlar });

  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl(query) {

    //Url değerini alıyoruz.
    const parsed = queryString.parse(location.search);

    if (parsed.from !== undefined) { setFromDate(moment(parsed.from).format('DD-MM-YYYY')) }
    if (parsed.from !== undefined) { setToDate(moment(parsed.to).format('DD-MM-YYYY')) }
    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
    let newDealarCode = []

    //Field url data
    if (parsed.fic !== undefined) {
      if (Array.isArray(parsed.fic)) {
        _.each(parsed.fic, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.fic) }
    }

    //RegionCode url data
    if (parsed.rec !== undefined) {
      if (Array.isArray(parsed.rec)) {
        _.each(parsed.rec, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.rec) }
    }

    //Dealar url data
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

    if (fromDate != '' & toDate != '') {
      params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
      params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    }
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

  //Search DailerName Tree Select Component
  function filterTreeNodeDealerCode(value, treeNode) {
    if (value && treeNode && treeNode.title) {
      const filterValue = value.toLocaleLowerCase('tr')
      const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
      return treeNodeTitle.indexOf(filterValue) != -1;
    }
    return false;
  }

  //Change from and To date
  function changeTimePicker(value, dateString) {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
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
    setPageIndex(current);
    // dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageIndex(current);
    setPageSize(pageSize);
    // dataSearch(current,pageSize);
  }

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowCariToplamlarSizeChange(current, pageSize) {
    setPageSizeCariToplamlar(pageSize);
    setPageIndexCariToplamlar(current);
    // dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentCariToplamlarPageChange(current, pageSize) {
    setPageIndexCariToplamlar(current);
    setPageSizeCariToplamlar(pageSize);
    //  dataSearch(current,pageSize);
  }
  //Select Component Rol değiştirme 
  function addressHandleChange(value) {
    setAdress(value);
  }
  //DBS Toplamlar Columns
  let columns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
    },
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "Güncel DBS Bakiyesi",
      dataIndex: "currentDbsBalance",
      key: "currentDbsBalance",
      render: (currentDbsBalance) => numberFormat(currentDbsBalance),
      align: "right",
    },
    {
      title: "Güncel DBS Risk Toplamı",
      dataIndex: "currentDbsRiskTotal",
      key: "currentDbsRiskTotal",
      render: (currentDbsRiskTotal) => numberFormat(currentDbsRiskTotal),
      align: "right",
    },
    {
      title: "Onaysız Siparişler",
      dataIndex: "unapprovedOrders",
      key: "unapprovedOrders",
      render: (unapprovedOrders) => numberFormat(unapprovedOrders),
      align: "right",
    },
    {
      title: "Bayi DBS Limiti",
      dataIndex: "dealerDbsLimit",
      key: "dealerDbsLimit",
      render: (dealerDbsLimit) => numberFormat(dealerDbsLimit),
      align: "right",
    },
  ];

  let CariToplamlarColumns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
    },
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "Güncel Bayi Bakiye",
      dataIndex: "currentAccountBalance",
      key: "currentAccountBalance",
      render: (currentAccountBalance) => numberFormat(currentAccountBalance),
      align: "right",
    },
    {
      title: "Güncel Hesap Toplamı",
      dataIndex: "currentAccountTotals",
      key: "currentAccountTotals",
      render: (currentAccountTotals) => numberFormat(currentAccountTotals),
      align: "right",
    },
    {
      title: "Güncel Hesap Kesim Tutarı",
      dataIndex: "currentAccountCutOffTotals",
      key: "currentAccountCutOffTotals",
      render: (currentAccountCutOffTotals) => numberFormat(currentAccountCutOffTotals),
      align: "right",
    },
    {
      title: "Son Hesap Kesim Tutarı",
      dataIndex: "lastAccountCutOffTotals",
      key: "lastAccountCutOffTotals",
      render: (lastAccountCutOffTotals) => numberFormat(lastAccountCutOffTotals),
      align: "right",
    },
    {
      title: "Son Hesap Kesim Tarihi",
      dataIndex: "lastAccountCutOffDate",
      key: "lastAccountCutOffDate",
      sorter: (a, b) => a.lastAccountCutOffDate - b.lastAccountCutOffDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "lastAccountCutOffDate" &&
        tableOptions.sortedInfo.order,
      render: (lastAccountCutOffDate) => moment(lastAccountCutOffDate).format(siteConfig.dateFormat),
    },
    {
      title: "Hesap Kesim Durumu",
      dataIndex: "accountStatus",
      key: "accountStatus",
    },
  ];
  //Hide order table column
  //Get Token and Token Decode
  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Field;
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
    const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Region;
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
    const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        columns = _.without(columns, _.findWhere(columns, {
          key: getHideColumns[index].key
        }
        ))
      }
    }
  }

  //hide column Description 1 , Description 2 , Description 3 , Description 4
  let descriptionHide = true;
  for (let index = 1; index < 5; index++) {
    let descriptionTitle = 'description' + index;
    _.each(data, (item, i) => {
      switch (descriptionTitle) {
        case 'description1':
          if (item.description1 != '') { return descriptionHide = false }
          break;
        case 'description2':
          if (item.description2 != '') { return descriptionHide = false }
          break;
        case 'description3':
          if (item.description3 != '') { return descriptionHide = false }
          break;
        case 'description4':
          if (item.description4 != '') { return descriptionHide = false }
          break;
        default:
          break;
      }
    });

    if (descriptionHide === true) {
      columns = _.without(columns, _.findWhere(columns, {
        dataIndex: descriptionTitle
      }));
    }
  }
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.mainForm.header" />}
      </PageHeader>
      {/* Data list volume */}
      <Box >
        <h2 style={{ marginBottom: '10px' }}>DBS Toplamları</h2>
        {/* <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={pageIndex}
          position="top"
        /> */}
        <Table
          columns={columns}
          dataSource={data}
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
      <Box >
        <h2 style={{ marginBottom: '10px' }}>Cari Toplamları</h2>
        {/* <ReportPagination
          onShowSizeChange={onShowCariToplamlarSizeChange}
          onChange={currentCariToplamlarPageChange}
          pageSize={pageSizeCariToplamlar}
          total={CariToplamlartotalDataCount}
          current={pageIndexCariToplamlar}
          position="top"
        /> */}
        <Table
          title={() => "Cari Toplamlar"}
          columns={CariToplamlarColumns}
          dataSource={cariToplamlarData}
          loading={loading}
          pagination={false}
          // scroll={{ x: 'calc(700px + 50%)' }}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}

        />
        <ReportPagination
          onShowSizeChange={onShowCariToplamlarSizeChange}
          onChange={currentCariToplamlarPageChange}
          pageSize={pageSizeCariToplamlar}
          total={CariToplamlartotalDataCount}
          current={pageIndexCariToplamlar}
          position="bottom"
        />
      </Box>
    </LayoutWrapper>
  );
}

export default MainForm;