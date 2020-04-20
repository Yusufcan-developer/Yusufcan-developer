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
import Input, { InputGroup } from '@iso/components/uielements/input';
import { useOrderFollowData } from "@iso/lib/hooks/fetchData/usePostApiOrderFollowUpData";
import { useGetOrderItems } from "@iso/lib/hooks/fetchData/useGetOrderItems";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';

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


const OrderFlowUp = () =>  {
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
 const [fromDate, setFromDate] = useState(moment(moment().subtract(30, 'days').toDate()).format(siteConfig.dateFormat))
 const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
 const [dealerCode,setDealerCode]=useState()


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


const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderIdArray] = 
useOrderFollowData(`${siteConfig.api.orders}`, {"dealerCode":dealerCode, "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });//, "from": fromDate , "to": toDate eklenecek...

const [dataGetApi, loadingGetApi , setOnChangeGetApi, setOrderId] = useGetOrderItems(`${siteConfig.api.orderDetail}`);

const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
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


const expandedRow = (row, index) => {

  setOrderId(orderIdArray);

console.log("orderIdArray :", orderIdArray);
console.log("dataGetApi", dataGetApi);

return (  <Table columns={OrderDetailcolumns} dataSource={dataGetApi[index]} loading={loadingGetApi} pagination={false} />  );
};

//Order Detail Columns
const OrderDetailcolumns = [
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

  //Order Columns
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
              <Row justify="start" align="middle" gutter={24}>
                <Col xs={{span:24}} sm={{span:8}}>
                  <Form>
                    <FormItem
                      label={<IntlMessages id="page.dealerCodeTitle" />}
                    >
                      <TreeSelect                      
                        treeData={treeData}
                        onChange={onChangeDealerCode}
                        treeCheckable={true}
                        showCheckedStrategy= {TreeSelect.SHOW_PARENT}   
                        placeholder={"Bayi Kodu Seçiniz"}
                        showSearch={true}
                        style={{ marginBottom: '8px' }}
                      />             

                    <RangePicker
                      format={siteConfig.dateFormat}
                      onChange={changeTimePicker}
                      defaultValue={[moment(fromDate,siteConfig.dateFormat), moment(toDate,siteConfig.dateFormat)]}
                      onOk={onOk}
                      style={{ marginBottom: '8px' }}
                    />
                     <Input size="small"
                      placeholder="Ara"
                      style={{ marginBottom: '8px' }}
                      onChange={event => setSearchKey(event.target.value)}
                    />
                     <Button
                      type="primary"
                      icon={<PoweroffOutlined />}
                      loading={iconLoading}
                      onClick={searchButton}
                    >
                      {<IntlMessages id="forms.button.label_Search" />}
                    </Button>
                    </FormItem>
                  </Form> 
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
          //expandable={{expandedRowRender}}
          expandedRowRender={expandedRow}
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