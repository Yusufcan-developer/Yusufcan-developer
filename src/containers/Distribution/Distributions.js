import React, { useState, useEffect } from "react";
import Tree from "@iso/components/uielements/tree";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { PoweroffOutlined } from '@ant-design/icons';
import { Table, Row, Col, Pagination, TreeSelect } from "antd";
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

const configTreeCheckedKeys = (checkedKeys, treeData) => {

  var newTreeData = treeData.find(item => item.key = "checkedKeys.key");
  console.log("configTreeCheckedKeys",newTreeData);
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

  const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount,setOnChange] = 
  useFetch(`${siteConfig.api.distributions}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });

  const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
/*********************************************** CUSTOM HOOKS ************************************************************ */

  const searchButton = () => {
    setOnChange(true);
  };

  function changeTimePicker(value, dateString) {

    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }
  function onChangeDealerCode(value) {
    setDealerCode(value);
  };
  function onChange(value, dateString) {
    console.log("Selected Time: ", value);
    console.log("Başlanıç Tarihi: ", dateString[0]);
    console.log("Bitiş Tarihi: ", dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
  }

  function handleChange(filters, sorter) {
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
  function currentPageChange(current) {
    console.log("current :", current);
    setlocalCurrentPage(current);
  }

  let columns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
      sorter: (a, b) => a.name.length - b.name.length,
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

      sorter: (a, b) => a.dealerSubCode.length - b.dealerSubCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "dealerSubCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCode",
      key: "regionCode",

      sorter: (a, b) => a.regionCode.length - b.regionCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "regionCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Bölge Adı",
      dataIndex: "regionName",
      key: "regionName",

      sorter: (a, b) => a.regionName.length - b.regionName.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "regionName" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Alan Kodu",
      dataIndex: "fieldCode",
      key: "fieldCode",

      sorter: (a, b) => a.fieldCode.length - b.fieldCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "fieldCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Alan Adı",
      dataIndex: "fieldName",
      key: "fieldName",

      sorter: (a, b) => a.fieldName.length - b.fieldName.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "fieldName" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Bölge Müdürü",
      dataIndex: "regionManager",
      key: "regionManager",

      sorter: (a, b) => a.regionManager.length - b.regionManager.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "regionManager" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",

      sorter: (a, b) => a.status.length - b.status.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "status" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Dağıtım Id",
      dataIndex: "distributionId",
      key: "distributionId",
 
      sorter: (a, b) => a.distributionId.length - b.distributionId.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "distributionId" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Dağıtım Sipariş Tarihi",
      dataIndex: "distributionOrderDate",
      key: "distributionOrderDate",
 
      sorter: (a, b) => a.distributionOrderDate.length - b.distributionOrderDate.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "distributionOrderDate" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Adres Kodu",
      dataIndex: "addressCode",
      key: "addressCode",
 
      sorter: (a, b) => a.addressCode.length - b.addressCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "addressCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Adres Açıklama",
      dataIndex: "addressDescription",
      key: "addressDescription",
 
      sorter: (a, b) => a.addressDescription.length - b.addressDescription.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "addressDescription" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Sipariş Numarası",
      dataIndex: "orderNo",
      key: "orderNo",
 
      sorter: (a, b) => a.orderNo.length - b.orderNo.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "orderNo" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
 
      sorter: (a, b) => a.itemCode.length - b.itemCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "itemCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Ürün Açıklaması",
      dataIndex: "itemDescription",
      key: "itemDescription",
 
      sorter: (a, b) => a.itemDescription.length - b.itemDescription.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "itemDescription" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
        title: "Birim",
        dataIndex: "unit",
        key: "unit",
   
        sorter: (a, b) => a.unit.length - b.unit.length,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "unit" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Ağırlık Birimi",
        dataIndex: "unitWeight",
        key: "unitWeight",
   
        sorter: (a, b) => a.unitWeight.length - b.unitWeight.length,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "unitWeight" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Planlanan Miktar",
        dataIndex: "plannedAmount",
        key: "plannedAmount",
   
        sorter: (a, b) => a.plannedAmount.length - b.plannedAmount.length,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "plannedAmount" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Dağıtılan  Miktar",
        dataIndex: "distributedAmount",
        key: "distributedAmount",
   
        sorter: (a, b) => a.distributedAmount.length - b.distributedAmount.length,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "distributedAmount" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Kalan  Miktar",
        dataIndex: "remainingAmount",
        key: "remainingAmount",
   
        sorter: (a, b) => a.remainingAmount.length - b.remainingAmount.length,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "remainingAmount" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      }
  ];
  
  //Hide customer record table columns
  const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Dealer
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
        {<IntlMessages id="page.distributionTitle.header" />}
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
      <Box title={<IntlMessages id="page.distributionListData" />}>
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
