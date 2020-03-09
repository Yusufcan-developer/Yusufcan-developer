import React, { useState } from "react";
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

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const treeData = [
  {
    title: "SAHA - 0",
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

export default function() {
  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [checkedKeys, setCheckedKeys] = React.useState();
  const [selectedKeys, setSelectedKeys] = React.useState(getData(0));
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
    setCheckedKeys(checkedKeys);
  };

  const onSelect = (selectedKeys, info) => {
    console.log("onSelect", info);
    setSelectedKeys(selectedKeys);
  };
  const enterIconLoading = () => {
    setSelectedKeys(getData(1));
    setIconLoading(true);
  };

  function getData(value) {
    let dataList = [];
    if (value === 0) {
      dataList = [
        {
          key: "1",
          name: "John Brown",
          age: 32,
          address: "New York No. 1 Lake Park"
        },
        {
          key: "2",
          name: "Jim Green",
          age: 42,
          address: "London No. 1 Lake Park"
        },
        {
          key: "3",
          name: "Joe Black",
          age: 32,
          address: "Sidney No. 1 Lake Park"
        },
        {
          key: "4",
          name: "Jim Red",
          age: 32,
          address: "London No. 2 Lake Park"
        }
      ];
    } else {
      dataList = [
        {
          key: "1",
          name: "ugur",
          age: 32,
          address: "New York No. 1 Lake Park"
        },
        {
          key: "2",
          name: "Jim Green",
          age: 42,
          address: "London No. 1 Lake Park"
        },
        {
          key: "3",
          name: "Joe Black",
          age: 32,
          address: "Sidney No. 1 Lake Park"
        },
        {
          key: "4",
          name: "Jim Red",
          age: 32,
          address: "London No. 2 Lake Park"
        }
      ];
    }
    return dataList;
  }
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" }
      ],
      filteredValue: tableOptions.filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "name" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      sorter: (a, b) => a.age - b.age,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "age" &&
        tableOptions.sortedInfo.order,
      ellipsis: true
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",

      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "address" &&
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
          dataSource={selectedKeys}
          onChange={handleChange}
        />
      </Box>
    </LayoutWrapper>
  );
}
