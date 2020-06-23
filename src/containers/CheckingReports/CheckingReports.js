import React, {  useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect } from "antd";
import { PoweroffOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import Input, {
  InputGroup,
} from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
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

const CheckingReports = () =>  {

  const [iconLoading, setIconLoading] = React.useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: '',
    filteredInfo: ''
  }); 
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const [searchKey, setSearchKey] = useState('');
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20)
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes,setDealerCodes]=useState()
  const [regionCodes,setRegionCodes]=useState()
  const [fieldCodes,setFieldCodes]=useState()

  useEffect(() => {
    setCurrentPage(localCurrentPage);  
  },[localCurrentPage]);
  
  useEffect(() => {
    setChangePageSize(pageSize);
  },[pageSize]);

  useEffect(() => {
    setFromDate(fromDate);
    setToDate(toDate);
  }, [fromDate, toDate]);

   const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount,setOnChange] = 
   useFetch(`${siteConfig.api.cheques}`, {"DealerCodes":dealerCodes,"regionCodes":regionCodes,"fieldCodes":fieldCodes,"from":moment(fromDate, 'DD-MM-YYYY'), "to" :moment(toDate, 'DD-MM-YYYY'),"keyword":searchKey, "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });

   const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
  /*********************************************** CUSTOM HOOKS ************************************************************ */

  const searchButton = () => {
    setOnChange(true);
  };
  
  function onChangeDealerCode(value) {
    let fieldArrObj = [];
    let regionArrObj= [];
    let dealerArrObj= [];
    if(value.length===0){return setFieldCodes(fieldArrObj);setRegionCodes(regionArrObj);setDealerCodes(dealerArrObj)}
    _.filter(value, function (item) {
      if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj) }
      else if (item.split("|").length === 2) {
        regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj)
      }
      else {
        dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj)
      }
    });
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
function currentPageChange(current){
  
  console.log("current :", current);
  setlocalCurrentPage(current);
}

let columns = [
  {
    title: "Tip",
      dataIndex: "type",
      key: "type"
    },
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
      title: "Bölge Adı",
      dataIndex: "regionName",
      key: "regionName"
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
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      render:(amount)=>amount.toFixed(2),
      align:"right",
      sorter: (a, b) => a.amount - b.amount,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "amount" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "Veriliş Tarihi",
      dataIndex: "issueDate",
      key: "issueDate",
      render:(issueDate)=>moment(issueDate).format(siteConfig.dateFormat),
      sorter: (a, b) => a.issueDate - b.issueDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "issueDate" &&
        tableOptions.sortedInfo.order
    },
    {
      title: "İşletme İmzası",
      dataIndex: "signatureDrawer",
      key: "signatureDrawer"
    },
    {
      title: "Ödeme Yeri",
      dataIndex: "placeOfPayment",
      key: "placeOfPayment"
    },
    {
      title: "Banka",
      dataIndex: "bank",
      key: "bank"
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

//Hide checking report table columns
const getHideColumns = ColumnOptionsConfig.CheckingReportTableHideColumns.Dealer
if (getHideColumns.length > 0) {
    for (let index = 0; index < getHideColumns.length; index++) {
    columns = _.without(columns, _.findWhere(columns, {
    dataIndex: getHideColumns[index].dataIndex
    }
    ))}
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
          bordered={true}
          pagination={false}
          scroll={{ x: 'calc(700px + 100%)'}}
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
export default CheckingReports;