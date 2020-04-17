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
  const [fromDate, setFromDate] = useState(moment(moment().subtract(30, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCode, setDealerCode] = useState()

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
   useFetch(`${siteConfig.api.cheques}`, { "pageIndex": localCurrentPage - 1 , "pageCount": pageSize });

   const [treeData, loadingTree , setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);
  /*********************************************** CUSTOM HOOKS ************************************************************ */

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
  console.log('onOk: ', value);
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
    title: "Tip",
      dataIndex: "type",
      key: "type",

      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "type" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "dealerName" &&
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
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "amount" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Veriliş Tarihi",
      dataIndex: "issueDate",
      key: "issueDate",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "issueDate" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "İşletme İmzası",
      dataIndex: "signatureDrawer",
      key: "signatureDrawer",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "signatureDrawer" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Ödeme Yeri",
      dataIndex: "placeOfPayment",
      key: "placeOfPayment",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "placeOfPayment" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Banka",
      dataIndex: "bank",
      key: "bank",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "bank" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",

      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "bank" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
];
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.checkingReportsTitle.header" />}
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
      <Box title={<IntlMessages id="page.checkingReportsDataList" />}>
      <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}

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