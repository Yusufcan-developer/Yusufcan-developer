import React, {  useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination,  TreeSelect } from "antd";
import { Link, useHistory, useRouteMatch,useParams,useLocation } from 'react-router-dom';
import { DownOutlined , PoweroffOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input, {
  InputGroup,
} from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";

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


const Shipping = () =>  {
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
const [dealerCodes,setDealerCodes]=useState()
const [regionCodes,setRegionCodes]=useState()
const [fieldCodes,setFieldCodes]=useState()
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

   console.log("currentPage!", localCurrentPage);
   getQueryVariable(searchQuery)
   setCurrentPage(localCurrentPage);  
 },[localCurrentPage]);
 
 useEffect(() => { 
   console.log("pageSize!", pageSize);
   getQueryVariable(searchQuery)
   setChangePageSize(pageSize);
 },[pageSize]);

const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);


const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] = 
useFetch(`${siteConfig.api.deliveries}`, {"DealerCodes":dealerCodes,"regionCodes":regionCodes,"fieldCodes":fieldCodes,"from":moment(fromDate, 'DD-MM-YYYY'), "to" :moment(toDate, 'DD-MM-YYYY'),"keyword":searchKey, "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });
/*********************************************** CUSTOM HOOKS ************************************************************ */


  const onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

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
    if(searchKey.length> 0){params.append('keyword',searchKey);}   
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


  let columns = [
    
      {
        title: "Satıcı Kodu",
        dataIndex: "dealerCode",
        key: "dealerCode"
      },
      {
        title: "Satıcı Adı",
        dataIndex: "dealerName",
        key: "dealerName"
      },
      {
        title: "Satıcı Alt Kodu",
        dataIndex: "dealerSubCode",
        key: "dealerSubCode"
      },
      {
        title: "Bölge Kodu",
        dataIndex: "regionCode",
        key: "regionCode"
      },
      {
        title: "Bölge Adı",
        dataIndex: "regionName",
        key: "regionName"
      },
      {
        title: "Bölge Yöneticisi",
        dataIndex: "regionManager",
        key: "regionManager"
      },
      {
        title: "Alan Kodu",
        dataIndex: "fieldCode",
        key: "fieldCode"
      },
      {
        title: "Alan Adı",
        dataIndex: "fieldName",
        key: "fieldName"
      },
      {
        title: "Alan Yöneticisi",
        dataIndex: "fieldManager",
        key: "fieldManager"
      },
      {
        title: "İrsaliye Kimliği",
        dataIndex: "waybillId",
        key: "waybillId",
        sorter: (a, b) => a.waybillId - b.waybillId,
        sortOrder: tableOptions.sortedInfo.columnKey === 'waybillId' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        
      },
      {
        title: "Teslimat Tarihi",
        dataIndex: "deliveryDate",
        key: "deliveryDate",
        render:(deliveryDate)=>moment(deliveryDate).format(siteConfig.dateFormat),
        sorter: (a, b) => a.deliveryDate.length - b.deliveryDate.length,
        sortOrder: tableOptions.sortedInfo.columnKey === 'deliveryDate' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: "Teslimat Adresi",
        dataIndex: "deliveryAddress",
        key: "deliveryAddress"
      },
      {
        title: "Sipariş No",
        dataIndex: "orderNo",
        key: "orderNo",
        sorter: (a, b) => a.orderNo.length - b.orderNo.length,
        sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: "Ürün Kodu",
        dataIndex: "itemCode",
        key: "itemCode",
        sorter: (a, b) => a.itemCode.length - b.itemCode.length,
        sortOrder: tableOptions.sortedInfo.columnKey === 'itemCode' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: "Ürün Açıklaması ",
        dataIndex: "itemDescription",
        key: "itemDescription"
      },
      {
        title: "Miktar",
        dataIndex: "amount",
        key: "amount",
        align:"center",
        sorter: (a, b) => a.amount - b.amount,
        sortOrder: tableOptions.sortedInfo.columnKey === 'amount' && tableOptions.sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: "Birim",
        dataIndex: "unit",
        key: "unit",
        align:"center"
      },
      {
        title: "Palet No",
        dataIndex: "plateNo",
        key: "plateNo",
        align:"center"
      },
      {
        title: "Tonaj",
        dataIndex: "tonnage",
        key: "tonnage",
        align:"center"
      }
  ];
  //Hide shipping table columns
  // const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Dealer
  // if (getHideColumns.length > 0) {
  //   for (let index = 0; index < getHideColumns.length; index++) {
  //     columns = _.without(columns, _.findWhere(columns, {
  //       dataIndex: getHideColumns[index].dataIndex
  //     }
  //     ))
  //   }
  // }

  
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.shippingReportsTitle.header" />}
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
      <Box>
      <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}
          //expandable={{expandedRowRender}}
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

export default Shipping;