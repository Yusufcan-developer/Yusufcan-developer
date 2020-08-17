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
import { Table, Row, Col, Pagination, TreeSelect,Dropdown,Menu } from "antd";

//Fetch
import { useCartListData } from "@iso/lib/hooks/fetchData/useGetCartList";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";

//Styles
import { DownloadOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
//import ColumnOptionsConfig from "../../config/ColumnOptions.config";
// import ReportPagination from "./ReportPagination";

//Other Library
// import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
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
  const [startingPageIndex,setStartingPageIndex]=useState(1);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    // getVariablesFromUrl(searchQuery)
  }, [pageIndex]);

  //Cart Data
  const [cartData, loadingCartData, setOnChange] = useCartListData(`${siteConfig.api.carts.cartGetAll}?includeItems=${true}`);

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
    // setExpandedKeys(expandedKeys);
    // setAutoExpandParent(false);
  };

  // //Sipariş Kalemleri Expand İşlemi
  // function expandedRow(row, index) {
  //   let orderDetailIndex;
  //   _.each(orderDetailData, (item, i) => {
  //     if (item.Key === row.orderNo) { return orderDetailIndex = i }
  //   });
  //   return (<Table
  //     columns={OrderDetailcolumns}
  //     dataSource={orderDetailData[orderDetailIndex].Value}
  //     pagination={false}
  //     scroll={{ x: 'max-content' }}
  //     size="medium"
  //     bordered={false}
  //   />);
  // };
  
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

    params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
    if (selectedPageSize) { params.append('pgsize', selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else {setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
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
    
    if (value.length === 0) {setNewUrlParams(''); params.delete('fic');params.delete('rec'); params.delete('dec'); setFieldCodes( fieldArrObj); setRegionCodes( regionArrObj); setDealerCodes( dealerArrObj); setSelectedDealerCode([]) }
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

  //Change from and To date
  function changeTimePicker(value, dateString) {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }
  //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Düzenle</Menu.Item>
    </Menu>
  );
   //Menü Secimlerine Göre Modal açma işlemleri
  //3 Adet Modal bulunmaktadır.Bunlar işlemler menüsü secimlerine göre Kullanıcı Düzenleme,Parola yenileme ve Kullanıcı silme modalları
  function handleMenuClick(value) {
    switch (value.key) {
      case '1':
        // setVisible(true);
        // fieldRegionAndDealearVisible(objectRole.roleName);
        break;
    
      default:
        break;
    }
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
//   const exportExcelButton = () => {
//     ExcelExport(columns, data, 'Geçmiş Siparişler');
//   }
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
      title: "Açıklama",
      dataIndex: "description",
      key: "description"
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
      render: (amount) => amount.toFixed(2)
    },
    {
      title: "Kalan miktar",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "center",
      render: (remainingAmount) => remainingAmount.toFixed(2)
    },
    {
      title: "Birim fiyat",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (unitPrice) => unitPrice.toFixed(2)
    },
    {
      title: "KDV",
      dataIndex: "vat",
      key: "vat",
      align: "center",
      render: (vat) => vat.toFixed(2)
    },
    {
      title: "Dağıtım Önerilen Miktar",
      dataIndex: "distributionSuggestedAmount",
      key: "distributionSuggestedAmount",
      align: "right",
      render: (distributionSuggestedAmount) => distributionSuggestedAmount.toFixed(2)
    },
    {
      title: "Dağıtım Gerçek Tutar",
      dataIndex: "distributionActualAmount",
      key: "distributionActualAmount",
      align: "right",
      render: (distributionActualAmount) => distributionActualAmount.toFixed(2)
    },
    {
      title: "Teslimat Tutarı",
      dataIndex: "deliveryAmount",
      key: "deliveryAmount",
      align: "right",
      render: (deliveryAmount) => deliveryAmount.toFixed(2)
    },

  ];

  //Cart Columns
  let columns = [
    {
      title: "Bağlı Hesap Numarası",
      dataIndex: "accountNo",
      key: "accountNo",
    },
    {
      title: "Sepet Id",
      dataIndex: "cartId",
      key: "cartId",
    },  
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      type: "date",
      sorter: (a, b) => a.orderDate - b.orderDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "date" &&
        tableOptions.sortedInfo.order,
      render: (orderDate) => moment(orderDate).format(siteConfig.dateFormat)
    },
    {
      title: "İşlemler",
      dataIndex: "title",
      key: "title",
      fixed: "right",
      render: (text, record) => (
        <Dropdown overlay={menu} trigger={['click']} >
          <Button onClick={event => { console.log('xxxx')}}>
            İşlemler  <DownOutlined />
          </Button>
        </Dropdown>

      ),
    }
   
  ];

  //Hide order table column
  //Get Token and Token Decode
//   const token = jwtDecode(localStorage.getItem("id_token"));
//   if (token.urole === 'admin') { }
//   else if (token.urole === 'fieldmanager') {
//     const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Field;
//     if (getHideColumns.length > 0) {
//       for (let index = 0; index < getHideColumns.length; index++) {
//         columns = _.without(columns, _.findWhere(columns, {
//           dataIndex: getHideColumns[index].dataIndex
//         }
//         ))
//       }
//     }
//   }
//   else if (token.urole === 'regionmanager') {
//     const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Region;
//     if (getHideColumns.length > 0) {
//       for (let index = 0; index < getHideColumns.length; index++) {
//         columns = _.without(columns, _.findWhere(columns, {
//           dataIndex: getHideColumns[index].dataIndex
//         }
//         ))
//       }
//     }
//   }
//   else if (token.urole === 'dealer') {
//     const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Dealer;
//     if (getHideColumns.length > 0) {
//       for (let index = 0; index < getHideColumns.length; index++) {
//         columns = _.without(columns, _.findWhere(columns, {
//           dataIndex: getHideColumns[index].dataIndex
//         }
//         ))
//       }
//     }
//   }
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.ActiveCarts.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <Row>
              <Col span={6}>
                <FormItem label={<IntlMessages id="page.accountNo" />}></FormItem>
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
                  // treeData={{}}
                  value={selectedDealerCode}
                  onChange={onChangeDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Hesap Kodu Seçiniz"}
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
                <Input size="small" placeholder="" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
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
          {/* <Button type="primary" size="small" style={{ marginBottom: '5px' }} loading={iconLoading}
            icon={<DownloadOutlined />} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button> */}
        </Col>
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
          dataSource={cartData}
          onChange={handleChange}
          loading={loadingCartData}
          // expandable={{ 'expandedRowRender': expandedRow }}
          pagination={false}
          onExpand={onExpand}
          // scroll={{ x: 'calc(700px + 50%)' }}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
        />
        {/* <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={pageIndex}
          position="bottom"
        /> */}
      </Box>
    </LayoutWrapper>
  );
}

export default OrdersReport;