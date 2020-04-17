import React, {  useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination,  TreeSelect } from "antd";
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

  const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
//******************************************************************************************************************* */
/*********************************************** CUSTOM HOOKS ************************************************************ */
const [localCurrentPage, setlocalCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20)
const [fromDate, setFromDate] = useState(moment(moment().subtract(30, 'days').toDate()).format(siteConfig.dateFormat))
const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat));
const [dealerCode,setDealerCode]=useState()

 useEffect(() => {        

   console.log("currentPage!", localCurrentPage);

   setCurrentPage(localCurrentPage);  
 },[localCurrentPage]);
 
 useEffect(() => { 
   console.log("pageSize!", pageSize);
   setChangePageSize(pageSize);
 },[pageSize]);


const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] = 
useFetch(`${siteConfig.api.deliveries}`, { });
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
    setDealerCode(value);
  };
  function changeTimePicker(value, dateString) {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
  }

  function handleChange( filters, sorter) {
   // console.log("Various parameters :", filters, sorter);
   console.log("sorter :", sorter);
    
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
        title: "Satıcı Kodu",
        dataIndex: "dealerCode",
        key: "dealerCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dealerCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Satıcı Adı",
        dataIndex: "dealerName",
        key: "dealerName",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dealerName" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Satıcı Alt Kodu",
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
          tableOptions.sortedInfo.columnKey === "regionManager" &&
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
        title: "İrsaliye Kimliği",
        dataIndex: "waybillId",
        key: "waybillId",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "waybillId" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Teslimat Tarihi",
        dataIndex: "deliveryDate",
        key: "deliveryDate",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "deliveryDate" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Teslimat Adresi",
        dataIndex: "deliveryAddress",
        key: "deliveryAddress",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "deliveryAddress" &&
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
        title: "Ürün Kodu",
        dataIndex: "itemCode",
        key: "itemCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "itemCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Ürün Açıklaması ",
        dataIndex: "itemDescription",
        key: "itemDescription",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "itemDescription" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Miktar",
        dataIndex: "amount",
        key: "amount",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "amount" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Birim",
        dataIndex: "unit",
        key: "unit",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "unit" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Palet No",
        dataIndex: "plateNo",
        key: "plateNo",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "plateNo" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Tonaj",
        dataIndex: "tonnage",
        key: "tonnage",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "tonnage" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      }
  ];


  
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.shippingReportsTitle.header" />}
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
      <Box>
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}
           
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

export default Shipping;