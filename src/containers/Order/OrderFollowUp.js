import React, {  useState, useEffect } from "react";
import Tree from "@iso/components/uielements/tree";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, Dropdown, Menu, Badge } from "antd";
import { DownOutlined , PoweroffOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { InputGroup } from "@iso/components/uielements/input";
//import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useFetch } from "@iso/lib/hooks/fetchData/useFakePostApi";
import { useGetApi } from "@iso/lib/hooks/fetchData/useFakeGetApi";
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

  useEffect(() => {
    setFromDate(fromDate);
    setToDate(toDate);
  }, [fromDate, toDate]);


//  const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount] = 
//  useFetch(`${siteConfig.api.orders}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });
const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] = 
useFetch(`http://localhost:3000/orders`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize , "from": fromDate , "to": toDate });

const [dataGetApi, loadingGetApi , setOnChangeGetApi, setOrderId] = useGetApi();
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
    setOnChange(true);
  };

  function changeTimePicker(value, dateString) {

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

const expandedRowRender = (row) => {
  
  console.log("order No :", row.orderNo);
  setOrderId(row.orderNo);

  const columns = [
    {
      title: "Sipariş No",
      dataIndex: "orderNo",
      key: "orderNo",
      ellipsis: true
    },
    {
      title: "Sipariş Tarihi",
      dataIndex: "orderDate",
      key: "orderDate",
      ellipsis: true
    },
    {
      title: "Tip",
      dataIndex: "type",
      key: "type",
      ellipsis: true
    },
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
      ellipsis: true
    },
    {
      title: "Ürün Açıklaması",
      dataIndex: "itemDescription",
      key: "itemDescription",
      ellipsis: true
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      ellipsis: true
    },
    {
      title: "Birim",
      dataIndex: "unit",
      key: "unit",
      ellipsis: true
    },
    {
      title: "Miktar",
      dataIndex: "amount",
      key: "amount",
      ellipsis: true
    },
    {
      title: "Kalan miktar",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      ellipsis: true
    },
    {
      title: "Birim fiyat",
      dataIndex: "unitPrice",
      key: "unitPrice",
      ellipsis: true
    },
    {
      title: "KDV",
      dataIndex: "vat",
      key: "vat",
      ellipsis: true
    },
    {
      title: "Dağıtım Önerilen Miktar",
      dataIndex: "distributionSuggestedAmount",
      key: "distributionSuggestedAmount",
      ellipsis: true
    },
    {
      title: "Dağıtım Gerçek Tutar",
      dataIndex: "distributionActualAmount",
      key: "distributionActualAmount",
      ellipsis: true
    },
    {
      title: "Teslimat Tutarı",
      dataIndex: "deliveryAmount",
      key: "deliveryAmount",
      ellipsis: true
    },

  ];

  // fetch("http://localhost:3000/orderNo_003100001")
  // .then(response => {
  //    return response.json();  
  // }).then(data => {
  //   console.log("expandedData :",data)
  //   return <Table columns={columns} dataSource={data}  loading={false} pagination={false} />;
  // })


  return <Table columns={columns} dataSource={dataGetApi}  loading={loadingGetApi} pagination={false} />;
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
                      onChange={changeTimePicker}
                      defaultValue={[moment(moment().toDate().getMonth()-1 , siteConfig.dateFormat), moment(moment().toDate(), siteConfig.dateFormat)]}
                      onOk={onOk}
                    />
                  </Col>

                  <Col xs={{ span: 24}} sm={{span:4}} md={{span:8 }}>
                    <Button
                      type="primary"
                      icon={<PoweroffOutlined />}
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
          expandable={{expandedRowRender}}

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

export default OrderFlowUp;