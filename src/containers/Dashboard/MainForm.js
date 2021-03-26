//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import { Table, Row, Col, Select, TreeSelect } from "antd";
import Collapse from "@iso/components/uielements/collapse";

//Fetch
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "../Reports/ReportSummary";

//Other Library
import ExcelExport from "../Reports/ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
import { usePostDBSTotalReport } from "../../library/hooks/fetchData/usePostDBSTotal";
import { usePostAccountBalancesReport } from "../../library/hooks/fetchData/usePostAccountBalances";
import ReportPagination from "../Reports//ReportPagination";
import enumerations from "../../config/enumerations";
import logMessage from '@iso/config/logMessage';
import viewType from '@iso/config/viewType';
import { DownloadOutlined } from '@ant-design/icons';

moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const { Option } = Select;

const MainForm = () => {
  document.title = "Ana Ekran - Seramiksan B2B";

  const queryString = require('query-string');
  const history = useHistory();
  const [iconLoading, setIconLoading] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndexDBSTotal, setPageIndexDBSTotal] = useState(1);
  const [pageSizeDBSTotal, setPageSizeDBSTotal] = useState(20)
  const [pageIndexAccountBalance, setPageIndexAccountBalance] = useState(1);
  const [pageSizeAccountBalance, setPageSizeAccountBalance] = useState(20);
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const location = useLocation();
  const [newUrlParams, setNewUrlParams] = useState('')
  const [selectedDealerCode, setSelectedDealerCode] = useState();

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Browse, logMessage.MainForm.browse);
    if (pageIndexDBSTotal === 1) {
      getVariablesFromUrl();
    }
    setCurrentPage(pageIndexDBSTotal);
  }, [pageIndexDBSTotal]);

  useEffect(() => {
    setChangePageSize(pageSizeDBSTotal);
  }, [pageSizeDBSTotal]);

  useEffect(() => {
    setCurrentPageAccount(pageIndexAccountBalance);
  }, [pageIndexAccountBalance]);

  useEffect(() => {
    setChangePageSizeAccount(pageSizeAccountBalance);
  }, [pageSizeAccountBalance]);

  let searchUrl = queryString.parse(location.search);

  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
    usePostDBSTotalReport(`${siteConfig.api.report.postDBSTotal}`, { "dealerCodes": dealerCodes, "pageIndex": pageIndexDBSTotal - 1, "pageCount": pageSizeDBSTotal });

  const [accountData, accountLoading, accountCurrentPage, setCurrentPageAccount, accountPageSize, setChangePageSizeAccount, AccountTotalDataCount, AccountSetOnChange, aggregateData, expandData] =
    usePostAccountBalancesReport(`${siteConfig.api.report.postAccountBalances}`, { "dealerCodes": dealerCodes, "pageIndex": pageIndexAccountBalance - 1, "pageCount": pageSizeAccountBalance });

  //Bayi,Bölge ve Saha kodlarının getirilmesi
  const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl() {
    const parsed = queryString.parse(location.search); 

    let newDealarCode = []
    //Field url data
    if (typeof parsed.fic !== 'undefined') {
        if (Array.isArray(parsed.fic)) {
            _.each(parsed.fic, (item, i) => {
                newDealarCode.push(item);
            });
        } else { newDealarCode.push(parsed.fic) }
    }

    //RegionCode url data
    if (typeof parsed.rec !== 'undefined') {
        if (Array.isArray(parsed.rec)) {
            _.each(parsed.rec, (item, i) => {
                newDealarCode.push(item);
            });
        } else { newDealarCode.push(parsed.rec) }
    }

    //Dealar url data
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
  }

  //Get Search Data
  function dataSearch() {
    const params = new URLSearchParams(location.search);
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('dealer'); {
      _.forEach(dealerCodes, (item) => {
        params.append('dealer', item); params.toString();
      });
      let createUrl = null;
      if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
      history.push(`${location.pathname}?${createUrl}`);

      AccountSetOnChange(true);
      setOnChange(true);
    }
  }

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSizeDBSTotal(pageSize);
    setPageIndexDBSTotal(current);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageIndexDBSTotal(current);
    setPageSizeDBSTotal(pageSize);
  }

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowCariToplamlarSizeChange(current, pageSize) {
    setPageSizeAccountBalance(pageSize);
    setPageIndexAccountBalance(current);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentCariToplamlarPageChange(current, pageSize) {
    setPageIndexAccountBalance(current);
    setPageSizeAccountBalance(pageSize);
  }

  //Cari Toplamlar Kalemleri Expand İşlemi
  function expandedRow(row, index) {
    let aggregateIndex;
    _.each(expandData, (item, i) => {
      if (item.dealerCode === row.dealerCode) { return aggregateIndex = i }
    });
    const aggregateFilterData = _.filter(expandData, function (Item) {
      if (Item.dealerCode === row.dealerCode) {
        return true;
      }
    });

    return (<Table
      columns={aggregateColumns}
      dataSource={aggregateFilterData}
      pagination={true}
      scroll={{ x: 'max-content' }}
      summary={() => {
        return renderFooter(aggregateColumns, aggregateFilterData, false)
      }}
    />);
  };

  //Select Component Bayi Kodu değiştirme 
  function dealerCodeHandleChange(value) {
    setDealerCodes(value);
  }
  //Excel Oluşturma
  const exportExcelButton = () => {
    // postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Export, logMessage.Reports.Order.exportExcel);
    ExcelExport(AccountColumns, accountData, 'Cari Toplamlar');
  }
  //Excel Oluşturma
  const exportDBSExcelButton = () => {
    // postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Export, logMessage.Reports.Order.exportExcel);
    ExcelExport(columns, data, 'DBS Toplamları');
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

  //Change DealerCode
  async function onChangeDealerCode(value) {
    let fieldArrObj = [];
    let regionArrObj = [];
    let dealerArrObj = [];
    setDealerCodes([]);
    setFieldCodes([]);
    setRegionCodes([]);
    const params = new URLSearchParams(location.search);
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('dealer');

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
      footerKey: 'Genel Toplam',
    },
    {
      title: "Güncel DBS Bakiyesi",
      dataIndex: "currentDbsBalance",
      key: "currentDbsBalance",
      render: (currentDbsBalance) => numberFormat(currentDbsBalance),
      align: "right",
      footerKey: 'currentDbsBalance',
    },
    {
      title: "Güncel DBS Risk Toplamı",
      dataIndex: "currentDbsRiskTotal",
      key: "currentDbsRiskTotal",
      render: (currentDbsRiskTotal) => numberFormat(currentDbsRiskTotal),
      align: "right",
      footerKey: 'currentDbsRiskTotal'
    },
    {
      title: "Onaysız Siparişler",
      dataIndex: "unapprovedOrders",
      key: "unapprovedOrders",
      render: (unapprovedOrders) => numberFormat(unapprovedOrders),
      align: "right",
      footerKey: 'unapprovedOrders'
    },
    {
      title: "Bayi DBS Limiti",
      dataIndex: "dealerDbsLimit",
      key: "dealerDbsLimit",
      render: (dealerDbsLimit) => numberFormat(dealerDbsLimit),
      align: "right",
      footerKey: 'dealerDbsLimit'
    },
  ];

  let AccountColumns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
    },
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
      footerKey: 'Genel Toplam',
    },
    {
      title: "Cari Hesap Bakiyesi",
      dataIndex: "currentAccountBalance",
      key: "currentAccountBalance",
      render: (currentAccountCutOffTotals) => numberFormat(currentAccountCutOffTotals),
      align: "right",
      footerKey: 'currentAccountBalance'
    },
    {
      title: "Güncel Hesap Toplamı",
      dataIndex: "currentAccountTotals",
      key: "currentAccountTotals",
      render: (currentAccountTotals) => numberFormat(currentAccountTotals),
      align: "right",
      footerKey: 'currentAccountTotals'
    },


    {
      title: "Hesap Kesim Tutarı",
      dataIndex: "lastAccountCutOffBalance",
      key: "lastAccountCutOffBalance",
      render: (lastAccountCutOffTotals) => numberFormat(lastAccountCutOffTotals),
      align: "right",
      footerKey: 'lastAccountCutOffBalance'
    },
    {
      title: "Kalan Hesap Kesim Bakiyesi",
      dataIndex: "monthlyAccountCutOffBalance",
      key: "monthlyAccountCutOffBalance",
      render: (monthlyAccountCutOffBalance) => numberFormat(monthlyAccountCutOffBalance),
      align: "right",
      footerKey: 'monthlyAccountCutOffBalance'
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
      align: "right",
    },
    {
      title: "Hesap Kesim Durumu",
      dataIndex: "accountStatus",
      key: "accountStatus",
    },
  ];

  let aggregateColumns = [
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "İşlem Tipi",
      dataIndex: "transactionType",
      key: "transactionType",
      footerKey: 'Genel Toplam'
    },
    {
      title: "Borç",
      dataIndex: "debt",
      key: "debt",
      render: (debt) => numberFormat(debt),
      align: "right",
      footerKey: 'debt'
    },
    {
      title: "Alacak",
      dataIndex: "credit",
      key: "credit",
      render: (credit) => numberFormat(credit),
      align: "right",
      footerKey: 'credit'
    },
  ]

  //Hide order table column
  //Get Token and Token Decode
  const token = jwtDecode(localStorage.getItem("id_token"));
  if (token.urole === 'admin') { }
  else if (token.urole === 'fieldmanager') {
    const getHideColumns = ColumnOptionsConfig.AggregateTableHideColumns.Field;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        aggregateColumns = _.without(aggregateColumns, _.findWhere(aggregateColumns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if (token.urole === 'regionmanager') {
    const getHideColumns = ColumnOptionsConfig.AggregateTableHideColumns.Region;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        aggregateColumns = _.without(aggregateColumns, _.findWhere(aggregateColumns, {
          dataIndex: getHideColumns[index].dataIndex
        }
        ))
      }
    }
  }
  else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
    const getHideColumns = ColumnOptionsConfig.AggregateTableHideColumns.Dealer;
    if (getHideColumns.length > 0) {
      for (let index = 0; index < getHideColumns.length; index++) {
        aggregateColumns = _.without(aggregateColumns, _.findWhere(aggregateColumns, {
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
  const view = viewType('Reports');
  const filterView = viewType('Filter');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.mainForm.header" />}
      </PageHeader>
      <Box >
        <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}  >
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
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
              <Col span={view !== 'MobileView' ? 1 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
              </Col>
              <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" loading={iconLoading} onClick={dataSearch} >
                {<IntlMessages id="forms.button.label_Search" />}
              </Button>
            </Row>
          </Panel>
        </Collapse>
      </Box>
      <Box >
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" style={{ marginBottom: '5px' }}
            icon={<DownloadOutlined />} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button>
        </Col>
        <h2 style={{ marginBottom: '10px' }}>Cari Toplamları</h2>
        <ReportPagination
          onShowSizeChange={onShowCariToplamlarSizeChange}
          onChange={currentCariToplamlarPageChange}
          pageSize={pageSizeAccountBalance}
          total={AccountTotalDataCount}
          current={pageIndexAccountBalance}
          position="top"
        />
        <Table
          columns={AccountColumns}
          dataSource={accountData}
          loading={accountLoading}
          pagination={false}
          size="medium"
          bordered={false}
          scroll={{ x: 1000 }}
          expandable={{ 'expandedRowRender': expandedRow }}
          summary={() => {
            return renderFooter(AccountColumns, accountData, true, aggregateData, true)
          }}
        />
        <ReportPagination
          onShowSizeChange={onShowCariToplamlarSizeChange}
          onChange={currentCariToplamlarPageChange}
          pageSize={pageSizeAccountBalance}
          total={AccountTotalDataCount}
          current={pageIndexAccountBalance}
          position="bottom"
        />
      </Box>
      <Box >
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" style={{ marginBottom: '5px' }}
            icon={<DownloadOutlined />} onClick={exportDBSExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button>
        </Col>
        <h2 style={{ marginBottom: '10px' }}>DBS Toplamları</h2>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSizeDBSTotal}
          total={totalDataCount}
          current={pageIndexDBSTotal}
          position="top"
        />
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          size="medium"
          bordered={false}
          summary={() => {
            return renderFooter(columns, data, false, aggregatesOverall, true)
          }}
        />
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSizeDBSTotal}
          total={totalDataCount}
          current={pageIndexDBSTotal}
          position="bottom"
        />
      </Box>
    </LayoutWrapper>
  );
}

export default MainForm;