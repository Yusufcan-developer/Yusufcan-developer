//React
import React, { useState, useEffect } from "react";
import {useLocation } from 'react-router-dom';

//Components
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import { Table, Row, Col, Pagination, Typography,  Select } from "antd";
import Collapse from "@iso/components/uielements/collapse";
//Fetch
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";

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
const { Option } = Select;
const MainForm = () => {
  document.title = "Ana Ekran - Seramiksan B2B";
  const queryString = require('query-string');
  
  const [iconLoading, setIconLoading] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [pageIndexAccount, setPageIndexAccount] = useState(1);
  const [pageSizeAccount, setPageSizeAccount] = useState(20);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [dealerCodes, setDealerCodes] = useState()
  const location = useLocation();

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    setChangePageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    setCurrentPageAccount(pageIndexAccount);
  }, [pageIndexAccount]);

  useEffect(() => {
    setChangePageSizeAccount(pageSizeAccount);
  }, [pageSizeAccount]);

  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    usePostDBSTotalReport(`${siteConfig.api.report.postDBSTotal}`, {"dealerCodes": dealerCodes, "pageIndex": pageIndex - 1, "pageCount": pageSize });

  const [accountData, accountLoading, accountCurrentPage, setCurrentPageAccount, accountPageSize, setChangePageSizeAccount, AccountTotalDataCount, AccountSetOnChange,aggregateData] =
    usePostCariToplamlarReport(`${siteConfig.api.report.postCariTotal}`, {"dealerCodes": dealerCodes, "pageIndex": pageIndexAccount - 1, "pageCount": pageSizeAccount });

  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData] = useGetLookupTreeData(`${siteConfig.api.lookup.getDealerCodes}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });

  //Url'i çözümleme işlemi
  function getVariablesFromUrl(query) {

    //Url değerini alıyoruz.
    const parsed = queryString.parse(location.search);

    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
    let newDealarCode = []

    //Dealar url data
    if (parsed.dec !== undefined) {
      if (Array.isArray(parsed.dec)) {
        _.each(parsed.dec, (item, i) => {
          newDealarCode.push(item);
        });
      } else { newDealarCode.push(parsed.dec) }
    }
    // setSelectedDealerCode(newDealarCode);
    
  }

  //Get Search Data
  function dataSearch() {   
    AccountSetOnChange(true);
    return setOnChange(true);
  }

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
    setPageSizeAccount(pageSize);
    setPageIndexAccount(current);
    // dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentCariToplamlarPageChange(current, pageSize) {
    setPageIndexAccount(current);
    setPageSizeAccount(pageSize);
    //  dataSearch(current,pageSize);
  }

  //Cari Toplamlar Kalemleri Expand İşlemi
  function expandedRow(row, index) {
    let aggregateIndex;
    _.each(aggregateData, (item, i) => {
      if (item.dealerCode === row.dealerCode) { return aggregateIndex = i }
    });
    const aggregateFilterData=_.filter(aggregateData, function (Item) {
      if (Item.dealerCode === row.dealerCode ) {
        return true;
      }});
      
    return (<Table
      columns={aggregateColumns}
      dataSource={aggregateFilterData}
      pagination={true} 
      scroll={{ x: 'max-content' }}  
    />);
  };

  //Select Component Bayi Kodu değiştirme 
  function dealerCodeHandleChange(value) {
    setDealerCodes(value);
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
    },
    {
      title: "Güncel Hesap Bakiyesi",
      dataIndex: "currentAccountTotals",
      key: "currentAccountTotals",
      render: (currentAccountTotals) => numberFormat(currentAccountTotals),
      align: "right",
    },
    {
      title: "Hesap Bakiyesi",
      dataIndex: "currentAccountBalance",
      key: "currentAccountBalance",
      render: (currentAccountCutOffTotals) => numberFormat(currentAccountCutOffTotals),
      align: "right",
    },
   
    {
      title: "Hesap Kesim BakiyeTutarı",
      dataIndex: "lastAccountCutOffBalance",
      key: "lastAccountCutOffBalance",
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
      align: "right",
    },
    {
      title: "Hesap Kesim Durumu",
      dataIndex: "accountStatus",
      key: "accountStatus",
    },
  ];

  let aggregateColumns=[
    {
      title: "Bayi Adı",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "İşlem Tipi",
      dataIndex: "transactionType",
      key: "transactionType",
    },
    {
      title: "Borç",
      dataIndex: "debt",
      key: "debt",
      render: (debt) => numberFormat(debt),
      align: "right",
    },
    {
      title: "Alacak",
      dataIndex: "credit",
      key: "credit",
      render: (credit) => numberFormat(credit),
      align: "right",
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

  let infoHeader = null;
  if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
    // infoHeader = (
    //   // <Col span={12}>
    //   //   <Form.Item label="Bayi Kodu">
    //   //     <span className="ant-form-text">{code}</span>
    //   //   </Form.Item>
    //   //   <Form.Item label="Unvanı">
    //   //     <span className="ant-form-text">{name}</span>
    //   //   </Form.Item>
    //   // </Col>
    // );
  }

  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.mainForm.header" />}
      </PageHeader>
      {infoHeader}
      <Box >
      <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
      <Row>
          <Col span={6}>
            <Select
              showSearch
              mode="multiple"
              dropdownMatchSelectWidth={500}
              style={{ width: '100%' }}
              placeholder="Bayi seçiniz"
              optionFilterProp="children"
              value={dealerCodes}
              onChange={dealerCodeHandleChange}
              filterOption={(input, option) =>
                option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {lookupDealerChildren}
            </Select>
          </Col>
          <Col span={1}>
              </Col>
          <Button type="primary" loading={iconLoading} onClick={dataSearch} >
            {<IntlMessages id="forms.button.label_Search" />}
          </Button>
        </Row>
        </Panel>
        </Collapse>
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
          columns={AccountColumns}
          dataSource={accountData}
          loading={accountLoading}
          pagination={false}
          size="medium"
          bordered={false}
          expandable={{ 'expandedRowRender': expandedRow }}
        />
        <ReportPagination
          onShowSizeChange={onShowCariToplamlarSizeChange}
          onChange={currentCariToplamlarPageChange}
          pageSize={pageSizeAccount}
          total={AccountTotalDataCount}
          current={pageIndexAccount}
          position="bottom"
        />
      </Box>
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
          scroll={{ x: 1000 }} 
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

export default MainForm;