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
import { Table, Row, Col, Pagination, TreeSelect, Descriptions, Typography } from "antd";

//Fetch
import { useOrderFollowData } from "@iso/lib/hooks/fetchData/usePostApiOrderFollowUpData";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";

//Styles
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";

//Other Library
import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const OrdersReport = () => {

  const queryString = require('query-string');
  const history = useHistory();

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
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();
  const { Text } = Typography;

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    setCurrentPage(pageIndex);
    getVariablesFromUrl(searchQuery)
  }, [pageIndex]);

  useEffect(() => {
    setChangePageSize(pageSize);
    getVariablesFromUrl(searchQuery)
  }, [pageSize]);

  //Rapor
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray, orderDetailData] =
    useOrderFollowData(`${siteConfig.api.report.postOrders}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize });

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

  //Sipariş Kalemleri Görüntüleme
  async function onExpand(expandedKeys) {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  //Sipariş Kalemleri Expand İşlemi
  function expandedRow(row, index) {
    let orderDetailIndex;
    _.each(orderDetailData, (item, i) => {
      if (item.Key === row.orderNo) { return orderDetailIndex = i }
    });
    return (<Table
      columns={OrderDetailcolumns}
      dataSource={orderDetailData[orderDetailIndex].Value}
      pagination={false}
      scroll={{ x: 'max-content' }}
      size="medium"
      bordered={false}
    />);
  };

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
    if (selectedPageSize) { params.append('pgsize', selectedPageSize) } else { params.append('pgsize', pageSize) }
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
    dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current) {
    setPageIndex(current);
    dataSearch(current);
  }

  //Excel Oluşturma
  const exportExcelButton = () => {
    ExcelExport(columns, data, 'Geçmiş Siparişler');
  }
  //Order Detail Columns
  const OrderDetailcolumns = [
    {
      title: "Tip",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    {
      title: "Ürün Açıklaması",
      dataIndex: "itemDescription",
      key: "itemDescription"
    },
    {
      title: "Birim",
      dataIndex: "unit",
      key: "unit",
      align: "center"
    },
    {
      title: "Miktar",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (amount) => numberFormat(amount)
    },
    {
      title: "Kalan miktar",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "center",
      render: (remainingAmount) => numberFormat(remainingAmount)
    },
    {
      title: "Birim fiyat",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (unitPrice) => numberFormat(unitPrice)
    },
    {
      title: "Dağıtım Önerilen Miktar",
      dataIndex: "distributionSuggestedAmount",
      key: "distributionSuggestedAmount",
      align: "right",
      render: (distributionSuggestedAmount) =>numberFormat(distributionSuggestedAmount)
    },
    {
      title: "Dağıtım Gerçek Tutar",
      dataIndex: "distributionActualAmount",
      key: "distributionActualAmount",
      align: "right",
      render: (distributionActualAmount) =>numberFormat(distributionActualAmount)
    },
    {
      title: "Teslimat Tutarı",
      dataIndex: "deliveryAmount",
      key: "deliveryAmount",
      align: "right",
      render: (deliveryAmount) => numberFormat(deliveryAmount)
    },

  ];

  //Order Columns
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
      title: "Sipariş No",
      dataIndex: "orderNo",
      key: "orderNo",
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.orderNo - b.orderNo,
      sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Sipariş Tarihi",
      dataIndex: "orderDate",
      key: "orderDate",
      type: "date",
      sorter: (a, b) => a.orderDate - b.orderDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "orderDate" &&
        tableOptions.sortedInfo.order,
      render: (orderDate) => moment(orderDate).format(siteConfig.dateFormat)
    },
    {
      title: "Belge No",
      dataIndex: "documentId",
      key: "documentId",
      sorter: (a, b) => a.documentId - b.documentId,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "documentId" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Ödeme",
      dataIndex: "payment",
      key: "payment",
    },
    {
      title: "Adres Kodu",
      dataIndex: "addressCode",
      key: "addressCode",
    },
    {
      title: "Teslimat Adresi",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
    },
    {
      title: "Toplam",
      dataIndex: "total",
      key: "total",
      align: "right",
      sorter: (a, b) => a.total - b.total,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "total" &&
        tableOptions.sortedInfo.order,
      render: (total) => numberFormat(total)
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status - b.status,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "status" &&
        tableOptions.sortedInfo.order

    },
    {
      title: "Açıklama 1",
      dataIndex: "description1",
      key: "description1",
    },
    {
      title: "Açıklama 2",
      dataIndex: "description2",
      key: "description2",
    },
    {
      title: "Açıklama 3",
      dataIndex: "description3",
      key: "description3",
    },
    {
      title: "Açıklama 4",
      dataIndex: "description4",
      key: "description4",
    },
    {
      title: "Bayi Alt Kodu",
      dataIndex: "dealerSubCode",
      key: "dealerSubCode",
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCode",
      key: "regionCode",
    },
    {
      title: "Bölge Yöneticisi",
      dataIndex: "regionManager",
      key: "regionManager",
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCode",
      key: "fieldCode",
    },
    {
      title: "Saha Yöneticisi",
      dataIndex: "fieldManager",
      key: "fieldManager",
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
          dataIndex: getHideColumns[index].dataIndex
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
        {<IntlMessages id="page.orderFollowUp.header" />}
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
                  value={selectedDealerCode}
                  onChange={onChangeDealerCode}
                  filterTreeNode={filterTreeNodeDealerCode}
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
                  style={{ marginBottom: '8px', width: '250px' }}
                />

              </Col>
              <Col span={6}>
                <Input size="small" placeholder="Ürün Adı, Sipariş No ... giriniz" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
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
      <Box >
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" style={{ marginBottom: '5px' }} loading={iconLoading}
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
          expandable={{ 'expandedRowRender': expandedRow }}
          pagination={false}
          onExpand={onExpand}
          // scroll={{ x: 'calc(700px + 50%)' }}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
          summary={pageData => {
            let totalAmount = 0;
            pageData.forEach(({ total }) => {
              totalAmount +=  total;
            });
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell>Toplam Tutar</Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text type="danger">{numberFormat(totalAmount)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
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

export default OrdersReport;