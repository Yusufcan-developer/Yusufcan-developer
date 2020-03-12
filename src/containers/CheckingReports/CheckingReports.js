import React,{ useState }  from 'react';
import Tree from '@iso/components/uielements/tree';
import Form from '@iso/components/uielements/form';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper.js';
import IntlMessages from '@iso/components/utility/intlMessages';
import DatePicker from '@iso/components/uielements/datePicker';
import Button from '@iso/components/uielements/button';
import TableDemoStyle from '../Tables/AntTables/Demo.styles';
import PageHeader from '@iso/components/utility/pageHeader';
import { Col, Table, Row} from 'antd';
import Collapse from '@iso/components/uielements/collapse';
import { InputGroup } from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/postFetchApi";
import siteConfig from "@iso/config/site.config";

const { Panel } = Collapse;
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

export default function() {

  const [expandedKeys, setExpandedKeys] = React.useState();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const [checkedKeys, setCheckedKeys] = React.useState();
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const [iconLoading, setIconLoading] = React.useState(false);
  const [data, loading] = useFetch(`${siteConfig.api.cheques}`,{ });
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
  console.log('Başlanıç Tarihi: ', dateString[0]);
  console.log('Bitiş Tarihi: ', dateString[1]);
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
    title: "Tip",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" }
      ],
      filteredValue: tableOptions.filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
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
            <InputGroup>
              <Row justify="start" align="middle" gutter={24}>
                <Col xs={{ span: 24 }} sm={{ span: 8 }} md={{ span: 10 }}>
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={onChange}
                    onOk={onOk}
                  />

                  
                </Col>

                <Col xs={{ span: 24 }} sm={{ span: 16 }} md={{ span: 14 }}>
                <Button
                    type="primary"
                    icon="poweroff"
                    loading={iconLoading}
                    onClick={enterIconLoading}
                  >
                    {<IntlMessages id="forms.button.label_Search" />}
                  </Button>
                </Col>
              </Row>
            </InputGroup>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box title={<IntlMessages id="page.checkingReportsDataList" />}>
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
        />
      </Box>
    </LayoutWrapper>
  );
}
