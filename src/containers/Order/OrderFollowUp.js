import React, {  useState, useEffect } from "react";
import Tree from "@iso/components/uielements/tree";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { InputGroup } from "@iso/components/uielements/input";
//import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useFetch } from "@iso/lib/hooks/fetchData/useFakePostApi";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const treeData = [
  {
    title: "SAHA - 0",
    key: "0",
    children: [
      {
        title: "BÖLGE 0",
        key:"0-0",
        children: [
          {
            title: "0-0-0-0",
            key: "0-0-0-0"
          },
          {
            title: "0-0-0-1",
            key: "0-0-0-1"
          },
          {
            title: "0-0-0-2",
            key: "0-0-0-2"
          }
        ]
      },
      {
        title: "BÖLGE 1",
        key:"0-1",
        children: [
          {
            title: "0-0-1-0",
            key: "0-0-1-0"
          },
          {
            title: "0-0-1-1",
            key: "0-0-1-1"
          },
          {
            title: "0-0-1-2",
            key: "0-0-1-2"
          }
        ]
      }
    ]
  },
  {
    title: "SAHA - 1",
    key:"1",
    children: [
      {
        title: "0-1-0-0",
        key: "0-1-0-0"
      },
      {
        title: "0-1-0-1",
        key: "0-1-0-1"
      },
      {
        title: "0-1-0-2",
        key: "0-1-0-2"
      }
    ]
  }
];
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


const OrderFlowUp = () =>  {
//******************************************************************************************************************* */
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
 const [fromDate, setFromDate] = useState(moment(moment().subtract(30, 'days').toDate()).format(siteConfig.dateFormat))
 const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))

  useEffect(() => {        

    console.log("currentPage!", localCurrentPage);

    setCurrentPage(localCurrentPage);  
  },[localCurrentPage]);
  
  useEffect(() => { 
    console.log("pageSize!", pageSize);
    setChangePageSize(pageSize);
  },[pageSize]);

  // useEffect(() => {
  //   setFromDate(fromDate);
  // }, [fromDate]);

  // useEffect(() => {
  //   setToDate(toDate);
  // }, [toDate]);

//  const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount] = 
//  useFetch(`${siteConfig.api.orders}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });
const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount] = useFetch(`http://localhost:3000/orders`);
/*********************************************** CUSTOM HOOKS ************************************************************ */


// const pagingChange = e => {
//   setCurrentPage(e); 
//   useFetch(`${siteConfig.api.products}`, { "pageIndex": e , "pageCount": 10 });
// }

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
    // setIconLoading(true);
  };

  function onChange(value, dateString) {

    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }

  function onOk(value) {
    console.log("xxxx onOk: ", value);
  }
  
  function handleChange( filters, sorter) {
    console.log("Various parameters :", filters, sorter);

    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  }
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

  const columns = [
    
      {
        title: "Bayi",
        dataIndex: "dealerCode",
        key: "dealerCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dealerCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bayi Adı",
        dataIndex: "dealerName",
        key: "dealerName",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dealerName" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bayi Alt Kodu",
        dataIndex: "dealerSubCode",
        key: "dealerSubCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dealerSubCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Kodu",
        dataIndex: "regionCode",
        key: "regionCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "regionCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Adı",
        dataIndex: "regionName",
        key: "regionName",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "regionName" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Yöneticisi",
        dataIndex: "regionManager",
        key: "regionManager",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "series" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Alan Kodu",
        dataIndex: "fieldCode",
        key: "fieldCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "fieldCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Alan Adı",
        dataIndex: "fieldName",
        key: "fieldName",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "fieldName" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Alan Yöneticisi",
        dataIndex: "fieldManager",
        key: "fieldManager",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "fieldManager" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Sipariş No",
        dataIndex: "orderNo",
        key: "orderNo",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "orderNo" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Sipariş Tarihi",
        dataIndex: "orderDate",
        key: "orderDate",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "orderDate" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Doküman Id",
        dataIndex: "documentId",
        key: "documentId",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "documentId" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Ödeme",
        dataIndex: "payment",
        key: "payment",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "payment" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Adres Kodu",
        dataIndex: "addressCode",
        key: "addressCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "addressCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Teslimat Adresi",
        dataIndex: "deliveryAddress",
        key: "deliveryAddress",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "addressCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Açıklama 1",
        dataIndex: "description1",
        key: "description1",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "addressCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Açıklama 2",
        dataIndex: "description2",
        key: "description2",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "description2" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Açıklama 3",
        dataIndex: "description3",
        key: "description3",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "description3" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Açıklama 4",
        dataIndex: "description4",
        key: "description4",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "description4" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "total" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Durum",
        dataIndex: "status",
        key: "status",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "status" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
  ];


  
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.orderFollowUp.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <InputGroup>
              <Row justify="start" align="middle" gutter={24}>
                <Col xs={{span:24}} sm={{span:8}} md={{span:6}}>
                  <Form>
                    <FormItem
                      //{...formItemLayout}
                      label={<IntlMessages id="page.dealerCodeTitle" />}
                    >
                      <Tree
                        checkable
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onCheck={onCheck}
                        checkedKeys={checkedKeys}
                        onSelect={onSelect}
                        selectedKeys={selectedKeys}
                        treeData={treeData}
                      />
                    </FormItem>
                  </Form>
                </Col>

                <Col xs={{span:24}} sm={{span:14}} md={{span:18}}>
                  <Col xs={{ span: 24}} sm={{span:10}} md={{span:10}}>
                    <RangePicker
                      format={siteConfig.dateFormat}
                      onChange={onChange}
                      defaultValue={[moment(moment().toDate().getMonth()-1 , siteConfig.dateFormat), moment(moment().toDate(), siteConfig.dateFormat)]}
                      onOk={onOk}
                    />
                  </Col>

                  <Col xs={{ span: 24}} sm={{span:4}} md={{span:8 }}>
                    <Button
                      type="primary"
                      icon="poweroff"
                      loading={iconLoading}
                      onClick={searchButton}
                    >
                      {<IntlMessages id="forms.button.label_Search" />}
                    </Button>
                  </Col>
                </Col>
              </Row>
            </InputGroup>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box title={<IntlMessages id="page.orderFollowUpDataList" />}>
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}
           
          pagination={{position: 'none', pageSize: pageSize}}
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

export default OrderFlowUp;