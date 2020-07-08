import React, {  useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect } from "antd";
import { Link, useHistory, useRouteMatch,useParams,useLocation } from 'react-router-dom';
import { PoweroffOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input, { InputGroup } from '@iso/components/uielements/input';
import { useOrderFollowData } from "@iso/lib/hooks/fetchData/usePostApiOrderFollowUpData";
import { useGetOrderItems } from "@iso/lib/hooks/fetchData/useGetOrderItems";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import siteConfig from "@iso/config/site.config";
import columnConfig from "@iso/config/ColumnOptions.config";
import moment from 'moment';
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import { key } from "styled-theme";
import { string,arrayOf } from "prop-types";
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


const OrderFollowUp = () => {
  //******************************************************************************************************************* */
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
//******************************************************************************************************************* */
/*********************************************** CUSTOM HOOKS ************************************************************ */
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState();
  const [selectedDealerCode, setSelectedDealerCode]=useState();
  const [newUrlParams,setNewUrlParams]=useState('') 
  const location = useLocation();
  const { searchQuery } = useParams();

  const match = useRouteMatch();
  const queryString = require('query-string');
  const history = useHistory();

  function getQueryVariable(query) {

    const parsed = queryString.parse(location.search);
    
    if(parsed.from!==undefined){setFromDate(moment(parsed.from).format('DD-MM-YYYY'))}
    if(parsed.from!==undefined){setToDate(moment(parsed.to).format('DD-MM-YYYY'))} 

    let newDealarCode = []
    if ((parsed.fic !== undefined)) {
      _.each(parsed.fic, (item, i) => {
        newDealarCode.push(item);
      }); setSelectedDealerCode(newDealarCode)
    }
    if (parsed.rec !== undefined) {
      if(Array.isArray(parsed.rec)){
        _.each(parsed.rec, (item, i) => {
          newDealarCode.push(item);
        });
      }else {newDealarCode.push(parsed.rec)}
     
    }
   
    if (parsed.dec !== undefined) {
      if(Array.isArray(parsed.dec)){
        _.each(parsed.dec, (item, i) => {
          newDealarCode.push(item);
        });
      }else {newDealarCode.push(parsed.dec)}
     
    }
    let fieldArrObj = [];
    let regionArrObj= [];
    let dealerArrObj= [];

    if(newDealarCode.length===0){return setFieldCodes(fieldArrObj);setRegionCodes(regionArrObj);setDealerCodes(dealerArrObj)}
    _.filter(newDealarCode, function (item) {
      if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj);  }
      else if (item.split("|").length === 2) {
        regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj);  
      }
      else {
        dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj); 
      }
    });
 
  }

  useEffect(() => {    
    setCurrentPage(localCurrentPage);
    getQueryVariable(searchQuery)
  }, [localCurrentPage]);

  useEffect(() => {    
    setChangePageSize(pageSize);
    getQueryVariable(searchQuery)
  }, [pageSize]);

  useEffect(() => {
    setFromDate(fromDate);
    setToDate(toDate);
    getQueryVariable(searchQuery)
  }, [fromDate, toDate]);


  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray] =
    useOrderFollowData(`${siteConfig.api.orders}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });

  const [dataGetApi, loadingGetApi , setOnChangeGetApi, setOrderId] = useGetOrderItems(`${siteConfig.api.orderDetail}`);

const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
/*********************************************** CUSTOM HOOKS ************************************************************ */

  const onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys); 

    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeys => {
    console.log("onCheck", checkedKeys);
    setCheckedKeys(checkedKeys);
  };

  const onSelect = (selectedKeys, info) => {
    console.log("onSelect", info);
    setSelectedKeys(selectedKeys);
  };
  const searchButton = () => {  
   
    const params = new URLSearchParams(location.search);

    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');

    params.append('from',moment(fromDate).format('YYYY-DD-MM'));params.toString();
    params.append('to',moment(toDate).format('YYYY-DD-MM'));params.toString();
    if(searchKey.length> 0){params.append('keyword',searchKey);params.toString();}   
    let createUrl=null;
    if(newUrlParams.length> 0){createUrl=newUrlParams+'&'+params; }else{createUrl=params}
    
    history.push(`${location.pathname}?${createUrl}`);   

    return setOnChange(true);
  };
  
  function onChangeDealerCode(value) {
    
    let fieldArrObj = [];
    let regionArrObj= [];
    let dealerArrObj= [];
    const params = new URLSearchParams(location.search);
    params.delete('dec');
    params.delete('rec');
    params.delete('fic');
    params.delete('from')
    params.delete('to');
    params.delete('keyword');

    if (value.length === 0) {setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj); setSelectedDealerCode([]) }
    else{
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
    console.log("xxxx onOk: ", value);
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
function currentPageChange(current){  
  console.log("current :", current);
  setlocalCurrentPage(current);
}


const expandedRow = (row, index) => {

  setOrderId(orderIdArray);

console.log("orderIdArray :", orderIdArray);
console.log("dataGetApi", dataGetApi);

return (  <Table columns={OrderDetailcolumns} dataSource={dataGetApi[index]} loading={loadingGetApi} pagination={false} />  );
};

//Order Detail Columns
const OrderDetailcolumns = [
  // {
  //   title: "Sipariş No",
  //   dataIndex: "orderNo",
  //   key: "orderNo"
  // },
  // {
  //   title: "Sipariş Tarihi",
  //   dataIndex: "orderDate",
  //   key: "orderDate",
  //   render:(text)=>moment(text).format(siteConfig.dateFormat)
  // },
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
    align:"center"
  },
  {
    title: "Miktar",
    dataIndex: "amount",
    key: "amount",
    align: "center",
    render:(amount)=>amount.toFixed(2)
  },
  {
    title: "Kalan miktar",
    dataIndex: "remainingAmount",
    key: "remainingAmount",
    align: "center",
    render:(remainingAmount)=>remainingAmount.toFixed(2)
  },
  {
    title: "Birim fiyat",
    dataIndex: "unitPrice",
    key: "unitPrice",
    align: "right",
    render:(unitPrice)=>unitPrice.toFixed(2)
  },
  {
    title: "KDV",
    dataIndex: "vat",
    key: "vat",
    align: "center",
    render:(vat)=>vat.toFixed(2)
  },
  {
    title: "Dağıtım Önerilen Miktar",
    dataIndex: "distributionSuggestedAmount",
    key: "distributionSuggestedAmount",
    align: "right",
    render:(distributionSuggestedAmount)=>distributionSuggestedAmount.toFixed(2)
  },
  {
    title: "Dağıtım Gerçek Tutar",
    dataIndex: "distributionActualAmount",
    key: "distributionActualAmount",
    align: "right",
    render:(distributionActualAmount)=>distributionActualAmount.toFixed(2)
  },
  {
    title: "Teslimat Tutarı",
    dataIndex: "deliveryAmount",
    key: "deliveryAmount",
    align: "right",
    render:(deliveryAmount)=>deliveryAmount.toFixed(2)
  },

];

  //Order Columns
  let columns = [
    
      {
        title: "Bayi",
        dataIndex: "dealerCode",
        key: "dealerCode",        
      },
      {
        title: "Bayi Adı",
        dataIndex: "dealerName",
        key: "dealerName",
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
        title: "Bölge Adı",
        dataIndex: "regionName",
        key: "regionName",
      },
      {
        title: "Bölge Yöneticisi",
        dataIndex: "regionManager",
        key: "regionManager",
      },
      {
        title: "Alan Kodu",
        dataIndex: "fieldCode",
        key: "fieldCode",
      },
      {
        title: "Alan Adı",
        dataIndex: "fieldName",
        key: "fieldName",
      },
      {
        title: "Alan Yöneticisi",
        dataIndex: "fieldManager",
        key: "fieldManager",
      },
      {
        title: "Sipariş No",
        dataIndex: "orderNo",
        key: "orderNo",
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.orderNo - b.orderNo,
        sortOrder:tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: "Sipariş Tarihi",
        dataIndex: "orderDate",
        key: "orderDate",
        sorter: (a, b) => a.orderDate - b.orderDate,
        sortOrder:
        tableOptions.sortedInfo.columnKey === "orderDate" &&
        tableOptions.sortedInfo.order,
        render:(orderDate)=>moment(orderDate).format(siteConfig.dateFormat)
      },
      {
        title: "Belge Numarası",
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
        title: "Toplam",
        dataIndex: "total",
        key: "total",
        align: "right",
        sorter: (a, b) => a.total - b.total,
        sortOrder:
        tableOptions.sortedInfo.columnKey === "total" &&
        tableOptions.sortedInfo.order,
        render:(total)=>total.toFixed(2)
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
  ];

  //Hide order table columns
  // const getHideColumns = ColumnOptionsConfig.ShippingTableHideColumns.Dealer
  // if (getHideColumns.length > 0) {
  //     for (let index = 0; index < getHideColumns.length; index++) {
  //     columns = _.without(columns, _.findWhere(columns, {
  //     dataIndex: getHideColumns[index].dataIndex
  //     }
  //     ))}
  // }
    
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
                  value={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onOk={onOk}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
              <Col span={6}>
                <Input size="small" placeholder="Anahtar kelime" onChange={event => setSearchKey(event.target.value)} />
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
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}
          expandable={{'expandedRowRender': expandedRow}}
          // expandedRowRender={expandedRow}
          pagination={false}
          scroll={{ x: 'calc(700px + 100%)'}}
          bordered={true}
          // pagination={{ position: 'bottom', pageSize: pageSize ,total: totalDataCount}}
        />  
        <br></br>     
        <Pagination 
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          position = 'bottom'
          pageSize= {pageSize}
          total= {totalDataCount}
        />
      </Box>
    </LayoutWrapper>
  );
}

export default OrderFollowUp;