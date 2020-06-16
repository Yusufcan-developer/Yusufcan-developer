import React, { useState, useEffect } from "react";
import Tree from "@iso/components/uielements/tree";
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

export default function() {
  const [searchKey, setSearchKey] = useState('');
  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [checkedKeys, setCheckedKeys] = React.useState();
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const [iconLoading, setIconLoading] = React.useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
/*********************************************** CUSTOM HOOKS ************************************************************ */
const [localCurrentPage, setlocalCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20)
const [fromDate, setFromDate] = useState(moment(moment().subtract(30, 'days').toDate()).format(siteConfig.dateFormat))
const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
const [dealerCode,setDealerCode]=useState()

 useEffect(() => {
   console.log("currentPage!", localCurrentPage);
   setCurrentPage(localCurrentPage);  
 },[localCurrentPage]);
 
 useEffect(() => { 
   console.log("pageSize!", pageSize);
   setChangePageSize(pageSize);
 },[pageSize]);

 useEffect(() => {
  setFromDate(fromDate);
  setToDate(toDate);
}, [fromDate, toDate]);

 const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount,setOnChange] = 
 useFetch(`${siteConfig.api.letters}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });
 
 const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
/*********************************************** CUSTOM HOOKS ************************************************************ */

  const onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };


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
  const searchButton = () => {
    setOnChange(true);
  };
  
  function onChangeDealerCode(value) {
    console.log('xxxx',value);
    setDealerCode(value);
  };
  function changeTimePicker(value, dateString) {

    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }
 /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
function currentPageChange(current){
  
  console.log("current :", current);
  setlocalCurrentPage(current);
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
        title: "Başlangıç Tarihi",
        dataIndex: "fromDate",
        key: "fromDate",
        render:(fromDate)=>moment(fromDate).format(siteConfig.dateFormat),
        sorter: (a, b) => a.fromDate - b.fromDate,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "fromDate" &&
          tableOptions.sortedInfo.order
      },
      {
        title: "Bitiş Tarihi",
        dataIndex: "toDate",
        key: "toDate",
        render:(toDate)=>moment(toDate).format(siteConfig.dateFormat),
        sorter: (a, b) => a.toDate - b.toDate,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "toDate" &&
          tableOptions.sortedInfo.order
      },
      {
        title: "Döküman ID",
        dataIndex: "documentId",
        key: "documentId",
        sorter: (a, b) => a.documentId - b.documentId,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "documentId" &&
          tableOptions.sortedInfo.order
      },
      {
        title: "TR Kodu",
        dataIndex: "trCode",
        key: "trCode",
        align:"center"
      },
      {
        title: "Tutar",
        dataIndex: "amount",
        key: "amount",
        align:"right",
        render:(amount)=>amount.toFixed(2),
        sorter: (a, b) => a.amount - b.amount,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "amount" &&
          tableOptions.sortedInfo.order
      },
      {
        title: "Banka",
        dataIndex: "bank",
        key: "bank"
      },
      {
        title: "Şube",
        dataIndex: "branch",
        key: "branch"
      },
  ];
  //Hide guaranteeLetter table columns
  const getHideColumns = ColumnOptionsConfig.GuaranteeLetterTableHideColumns.Dealer
  if (getHideColumns.length > 0) {
    for (let index = 0; index < getHideColumns.length; index++) {
      columns = _.without(columns, _.findWhere(columns, {
        dataIndex: getHideColumns[index].dataIndex
      }
      ))
    }
  }

  
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.GuaranteeLetterTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
        <Panel header={<IntlMessages id="page.filtered" />} key="0">
          <Row>
              <Col xs={{ span: 48 }} sm={{ span: 4 }} >
            <FormItem
              label={<IntlMessages id="page.dealerCodeTitle" />}
            >            
            </FormItem>
            </Col> 
            <Col xs={{ span: 48 }} sm={{ span: 4 }} >
            <FormItem
              label={<IntlMessages id="page.dateRangeTitle" />}
            >
            </FormItem>
            </Col>
            <Col xs={{ span: 48 }} sm={{ span: 4 }} >
            <FormItem
              label={<IntlMessages id="page.keywordTitle" />}
            >
            </FormItem>
            </Col>
            </Row>
            <Row>
              <Col xs={{ span: 48 }} sm={{ span: 4 }} >
                <TreeSelect
                  treeData={treeData}
                  onChange={onChangeDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Bayi Kodu Seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: '250px' }}

                />
              </Col>             
              <Col xs={{ span: 48 }} sm={{ span: 4 }} >
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onOk={onOk}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
              <Col xs={{ span: 48 }} sm={{ span: 4 }}>
                <Input size="small"
                  placeholder="Anahtar kelime"
                  onChange={event => setSearchKey(event.target.value)}
                />
              </Col>
              <Col xs={{ span: 48 }} sm={{ span: 4 }}>
              <Button
                  type="primary"
                  loading={iconLoading}
                  onClick={searchButton}
                  >
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
          pagination={{position: 'none', pageSize: pageSize}}
          scroll={{ x: 'calc(700px + 50%)'}}
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
