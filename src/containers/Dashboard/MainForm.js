//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import { Table, Row, Col, Select } from "antd";
import Collapse from "@iso/components/uielements/collapse";

//Fetch
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "../Reports/ReportSummary";
import { getIsPointAddressDelivery } from '@iso/lib/helpers/isPointAddressDelivery';
import { setIsPointAddressDelivery } from '@iso/lib/helpers/setIsPointAddressDelivery';

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
  const [dealerCodes, setDealerCodes] = useState()
  const location = useLocation();
  const [newUrlParams, setNewUrlParams] = useState('')

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


  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
    usePostDBSTotalReport(`${siteConfig.api.report.postDBSTotal}`, { "dealerCodes": dealerCodes, "pageIndex": pageIndexDBSTotal - 1, "pageCount": pageSizeDBSTotal });

  const [accountData, accountLoading, accountCurrentPage, setCurrentPageAccount, accountPageSize, setChangePageSizeAccount, AccountTotalDataCount, AccountSetOnChange, aggregateData, expandData] =
    usePostAccountBalancesReport(`${siteConfig.api.report.postAccountBalances}`, { "dealerCodes": dealerCodes, "pageIndex": pageIndexAccountBalance - 1, "pageCount": pageSizeAccountBalance });

  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData] = useGetLookupTreeData(`${siteConfig.api.lookup.getDealerCodes}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });

  //Url'i çözümleme işlemi
  function getVariablesFromUrl() {
    const parsed = queryString.parse(location.search);
    const isPointAddress=getIsPointAddressDelivery();
    
    //isPointAddress paste url manuel.
    if ((isPointAddress.toString() !==  parsed.ispd) && (typeof parsed.ispd !== 'undefined')) {
      window.location.reload(false);
    }
    if (typeof parsed.ispd !== 'undefined') { setIsPointAddressDelivery(parsed.ispd); }

    let dealerCode = [];
    if (typeof parsed.dealer !== 'undefined') {
      if (Array.isArray(parsed.dealer)) {
        _.each(parsed.dealer, (item) => {
          dealerCode.push(item);
        });
      } else { dealerCode.push(parsed.dealer); }
    }
    setDealerCodes(dealerCode);
  }

  //Get Search Data
  function dataSearch() {
    const params = new URLSearchParams(location.search);
    const isPointAddress=getIsPointAddressDelivery();

    params.delete('ispd');
    params.delete('dealer'); {
      _.forEach(dealerCodes, (item) => {
        params.append('dealer', item); params.toString();
      });
      params.append('ispd', isPointAddress); params.toString();
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
  const filterView=viewType('Filter');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.mainForm.header" />}
      </PageHeader>
      <Box >
        <Collapse accordion  defaultActiveKey={filterView !== 'MobileView' ? ['0']  :null }  >
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <Row>
              <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                <Select
                  showSearch
                  mode="multiple"
                  dropdownMatchSelectWidth={500}
                  style={{ marginBottom: '8px', width: '100%' }}
                  placeholder="Bayi seçiniz"
                  optionFilterProp="children"
                  value={dealerCodes}
                  onChange={dealerCodeHandleChange}
                  filterOption={(input, option) =>
                    option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
                  }
                >
                  {lookupDealerChildren}
                </Select>
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