import React,{ useState }  from 'react';
import Tree from '@iso/components/uielements/tree';
import Form from '@iso/components/uielements/form';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper.js';
import IntlMessages from '@iso/components/utility/intlMessages';
import DatePicker from '@iso/components/uielements/datePicker';
import Button from '@iso/components/uielements/button';
import TableDemoStyle from '../Tables/AntTables/Demo.styles';
import { Table } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';

import { NoteListWrapper } from '../Note/Note.styles';
const dataList =  [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: {
    xs: { span: 4 },
    sm: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 5 },
  },
};
const treeData = [
  {
    title: "SAHA - 0",
    key: "0-0",
    children: [
      {
        title: "BÖLGE 0",
        key: "0-0-0",
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
        key: "0-0-1",
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
    key: "0-1",
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

export default function() {
  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [checkedKeys, setCheckedKeys] = React.useState();
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const [iconLoading, setIconLoading] = React.useState(false);

  const [tableOptions, setState] = useState({
    sortedInfo: '',
    filteredInfo: ''
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
    setIconLoading(true);
   
    
  };
  
function onChange(value, dateString) {
  console.log('Selected Time: ', value);
  console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
  console.log('onOk: ', value);
}
function handleChange  (pagination, filters, sorter) {
  console.log('Various parameters', pagination, filters, sorter);
  console.log('filters', filters);
  setState({
    ...tableOptions,
    ['sortedInfo']: sorter,
    ['filteredInfo']:filters
  });
};

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    filters: [{ text: "Joe", value: "Joe" }, { text: "Jim", value: "Jim" }],
    filteredValue: tableOptions.filteredInfo.name || null,
    onFilter: (value, record) => record.name.includes(value),
    sorter: (a, b) => a.name.length - b.name.length,
    sortOrder:tableOptions.sortedInfo.columnKey === "name" && tableOptions.sortedInfo.order,
    ellipsis: true
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
    sorter: (a, b) => a.age - b.age,
    sortOrder: tableOptions.sortedInfo.columnKey === "age" && tableOptions.sortedInfo.order,
    ellipsis: true
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",

    sorter: (a, b) => a.address.length - b.address.length,
    sortOrder: tableOptions.sortedInfo.columnKey === "address" && tableOptions.sortedInfo.order,
    ellipsis: true
  }
];
  return (
    
      <LayoutWrapper>    
      <PageHeader>
        {<IntlMessages id="page.customerRecordTitle.header" />}
      </PageHeader> 
     
          <Box  title={<IntlMessages id="page.filtered" />}>
          <Form>

            <FormItem
              {...formItemLayout}
              label={<IntlMessages id="page.customerRecordTitle" />}
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
          <RangePicker
            format="DD-MM-YYYY"
            onChange={onChange}
            onOk={onOk}
          />
          <Button
            type="primary"
            icon="poweroff"
            loading={iconLoading}
            onClick={enterIconLoading}
          >
            Ara
              </Button>
          </Box>
        {/* Data list volume */}   
        <Box title={<IntlMessages id="page.customerRecordDataList" />}> 
          <TableDemoStyle className="isoLayoutContent">
          <Table
          columns={columns}
          dataSource={dataList}  onChange={handleChange}       
        />
          </TableDemoStyle>
        </Box>
      </LayoutWrapper>
    
  );
}
