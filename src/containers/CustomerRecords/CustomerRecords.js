import React, { useState, useEffect } from "react";
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
import { useFetch } from "./fechingData";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const treeData = [
  {
    title: "SAHA - 0",
    key: "SAHA - 0",
    children: [
      {
        title: "BÖLGE 0",
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
    key: "SAHA - 1",
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

const configTreeCheckedKeys = (checkedKeys, treeData) => {

  var newTreeData = treeData.find(item => item.key = "checkedKeys.key");
  console.log("configTreeCheckedKeys",newTreeData);
};

export default function() {
  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [checkedKeys, setCheckedKeys] = React.useState();
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  //const [getData, setGetData] = React.useState(null);
  const [data, loading] = useFetch("http://192.168.0.140/b2b/api/customers/transactions");
  const [iconLoading, setIconLoading] = React.useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });

  const onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = checkedKeys => {
    console.log("onCheck", checkedKeys);
  //  configTreeCheckedKeys(checkedKeys, treeData);
    setCheckedKeys(checkedKeys);
  };

  const onSelect = (selectedKeys, info) => {
    console.log("onSelect info", info);
    console.log("onSelect selectedKeys", selectedKeys);
    setSelectedKeys(selectedKeys);
  };

  const enterIconLoading = () => {
    setIconLoading(true);
  };

// const dataLoading = getData => {
//   console.log("getData :", getData)
//   setGetData(getData);
// };

  function onChange(value, dateString) {
    console.log("Selected Time: ", value);
    console.log("Başlanıç Tarihi: ", dateString[0]);
    console.log("Bitiş Tarihi: ", dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
  }
  function handleChange(pagination, filters, sorter) {
    console.log("Various parameters", pagination, filters, sorter);
    console.log("filters", filters);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  }



  const columns = [
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCode",
      key: "dealerCode",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" }
      ],
      filteredValue: tableOptions.filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.dealerSubCode || null,
      onFilter: (value, record) => record.dealerSubCode.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.regionCode || null,
      onFilter: (value, record) => record.regionCode.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.regionName || null,
      onFilter: (value, record) => record.regionName.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.fieldCode || null,
      onFilter: (value, record) => record.fieldCode.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.fieldName || null,
      onFilter: (value, record) => record.fieldName.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.regionManager || null,
      onFilter: (value, record) => record.regionManager.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.date || null,
      onFilter: (value, record) => record.date.includes(value),

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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.documentId || null,
      onFilter: (value, record) => record.documentId.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.trCode || null,
      onFilter: (value, record) => record.trCode.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.transactionType || null,
      onFilter: (value, record) => record.transactionType.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.description || null,
      onFilter: (value, record) => record.description.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.debt || null,
      onFilter: (value, record) => record.debt.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.credit || null,
      onFilter: (value, record) => record.credit.includes(value),
 
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
      filters: [
        { text: "New York", value: "New York" },
        { text: "London", value: "London" }
      ],
      filteredValue: tableOptions.filteredInfo.currency || null,
      onFilter: (value, record) => record.currency.includes(value),
 
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
          scroll={{ x: true}}
          columns={columns}
          dataSource={data}
          onChange={handleChange}
        />
      </Box>
    </LayoutWrapper>
  );
}
