import React, {  useState, useEffect } from "react";
import Tree from "@iso/components/uielements/tree";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { InputGroup } from "@iso/components/uielements/input";
import { useFetch } from "@iso/lib/hooks/postFetchApi";
import siteConfig from "@iso/config/site.config";

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
 //const [posts, setPost] = useState();
 //const [loading, setLoading] = useState(true);
 //const [totalDataCount, setTotalDataCount] = useState();
 const [localCurrentPage, setlocalCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(10)

  useEffect(() => {        
    console.log("rendered!");
    console.log("currentPage!", currentPage);
    
    setCurrentPage(localCurrentPage);

  },[localCurrentPage]);

 const [data, loading ,currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount] = useFetch(`${siteConfig.api.products}`, { "pageIndex": localCurrentPage - 1 , "pageCount": 10 });



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
  const enterIconLoading = () => {
    setIconLoading(true);
  };

  function onChange(value, dateString) {
    console.log("Selected Time: ", value);
    console.log("Başlanıç Tarihi: ", dateString[0]);
    console.log("Bitiş Tarihi: ", dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
  }
  function handleChange(pagination, filters, sorter) {
    console.log("Various parameters :",pagination, filters, sorter);
    console.log("handleChange", pagination.current);
    
    setlocalCurrentPage(pagination.current);

    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  }



//   function changePageSize(){
    
//     setchangePageSize(20); //PageCount belirler
//   }

  const columns = [
    
      {
        title: "Bayi",
        dataIndex: "itemCode",
        key: "itemCode",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "itemCode" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bayi Adı",
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "description" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bayi Alt Kodu",
        dataIndex: "listPrice",
        key: "listPrice",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "listPrice" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Kodu",
        dataIndex: "category",
        key: "category",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "category" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Adı",
        dataIndex: "type",
        key: "type",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "type" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bölge Yöneticisi",
        dataIndex: "series",
        key: "series",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "series" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Başlangıç Tarihi",
        dataIndex: "dimension",
        key: "dimension",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "dimension" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Bitiş Tarihi",
        dataIndex: "color",
        key: "color",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "color" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Döküman ID",
        dataIndex: "surface",
        key: "surface",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "surface" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "TR Kodu",
        dataIndex: "productionStatus",
        key: "productionStatus",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "productionStatus" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Tutar",
        dataIndex: "rectifying",
        key: "rectifying",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "rectifying" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      },
      {
        title: "Banka",
        dataIndex: "brand",
        key: "brand",
        sorter: (a, b) => a.age - b.age,
        sortOrder:
          tableOptions.sortedInfo.columnKey === "brand" &&
          tableOptions.sortedInfo.order,
        ellipsis: true
      }
  ];


  
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.GuaranteeLetterTitle.header" />}
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
                      format="DD-MM-YYYY"
                      onChange={onChange}
                      onOk={onOk}
                    />
                  </Col>

                  <Col xs={{ span: 24}} sm={{span:4}} md={{span:8 }}>
                    <Button
                      type="primary"
                      icon="poweroff"
                      loading={iconLoading}
                      onClick={enterIconLoading}
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
      <Box title={<IntlMessages id="page.customerRecordDataList" />}>
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          pagination={{ position: 'bottom', pageSize: 10 ,total: totalDataCount}}
        />        
      </Box>
    </LayoutWrapper>
  );
}

export default OrderFlowUp;