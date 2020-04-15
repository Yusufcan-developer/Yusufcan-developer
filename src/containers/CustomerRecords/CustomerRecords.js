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
  useFetch(`${siteConfig.api.transactions}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });

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

  const columns = [
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
      title: "Tarih",
      dataIndex: "date",
      key: "date",

      sorter: (a, b) => a.date.length - b.date.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "date" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Belge numarası",
      dataIndex: "documentId",
      key: "documentId",
 
      sorter: (a, b) => a.documentId.length - b.documentId.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "documentId" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "TR Kod",
      dataIndex: "trCode",
      key: "trCode",
 
      sorter: (a, b) => a.trCode.length - b.trCode.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "trCode" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "İşlem Tipi",
      dataIndex: "transactionType",
      key: "transactionType",
 
      sorter: (a, b) => a.transactionType.length - b.transactionType.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "transactionType" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
 
      sorter: (a, b) => a.description.length - b.description.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "description" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Borç",
      dataIndex: "debt",
      key: "debt",
 
      sorter: (a, b) => a.debt.length - b.debt.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "debt" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Kredi",
      dataIndex: "credit",
      key: "credit",
 
      sorter: (a, b) => a.credit.length - b.credit.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "credit" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Para Birimi",
      dataIndex: "currency",
      key: "currency",
 
      sorter: (a, b) => a.currency.length - b.currency.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "credit" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    }
  ];
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.customerRecordTitle.header" />}
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
                      <TreeSelect                      
                        treeData={treeData}
                        onChange={onChangeDealerCode}
                        treeCheckable={true}
                        showCheckedStrategy= {TreeSelect.SHOW_PARENT}   
                        placeholder={"Bayi Kodu Seçiniz"}
                        showSearch={true}
                      />
                    </FormItem>
                  </Form>
                </Col>

                <Col xs={{span:24}} sm={{span:14}} md={{span:18}}>
                  <Col xs={{ span: 24}} sm={{span:10}} md={{span:10}}>
                  <RangePicker
                      format={siteConfig.dateFormat}
                      onChange={changeTimePicker}
                      defaultValue={[moment(fromDate,siteConfig.dateFormat), moment(toDate,siteConfig.dateFormat)]}
                      onOk={onOk}
                    />
                  </Col>

                  <Col xs={{ span: 24 }} sm={{ span: 4 }} md={{ span: 8 }}>
                    <Button
                      type="primary"
                      icon={<PoweroffOutlined />}
                      loading={iconLoading}
                      onClick={searchButton}
                    >
                      {<IntlMessages id="forms.button.label_Search" />}
                    </Button>
                  </Col>
                  <Col span={4}>
                    <Input size="small"
                      placeholder="Ara"
                      style={{ marginBottom: '15px' }}
                      onChange={event => setSearchKey(event.target.value)}
                    />
                </Col>
                </Col>
              </Row>
            </InputGroup>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box title={<IntlMessages id="page.customerRecordDataList" />}>
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
