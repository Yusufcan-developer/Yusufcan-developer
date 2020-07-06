import React, { useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect } from "antd";
import { DownOutlined, PoweroffOutlined } from '@ant-design/icons';
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


const UserList = () => {
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
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState()

  useEffect(() => {

    console.log("currentPage!", localCurrentPage);

    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  useEffect(() => {
    console.log("pageSize!", pageSize);
    setChangePageSize(pageSize);
  }, [pageSize]);

  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);


  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange] =
    useFetch(`${siteConfig.api.users}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": moment(fromDate, 'DD-MM-YYYY'), "to": moment(toDate, 'DD-MM-YYYY'), "keyword": searchKey, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });
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
    let fieldArrObj = [];
    let regionArrObj = [];
    let dealerArrObj = [];

    if (value.length === 0) { return setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj) }
    _.filter(value, function (item) {
      if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj) }
      else if (item.split("|").length === 2) {
        regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj)
      }
      else {
        dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj)
      }
    });
  };
  function changeTimePicker(value, dateString) {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  }

  function onOk(value) {
    console.log("onOk: ", value);
  }

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };

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
      title: "Adı",
      dataIndex: "firstName",
      key: "firstName",
      width: 200,
    },
    {
      title: "Soyadı",
      dataIndex: "lastName",
      key: "lastName",
      width: 200,
    },
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
      width: 170,
      ellipsis: true
    },
    {
      title: "Rol",
      dataIndex: ['role', 'roleDescription'],
      key: "role.roleDescription",
      width: 150,
      ellipsis: true
    },
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCodes",
      key: "dealerCodes",
      width: 130,
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCodes",
      key: "fieldCodes",
      width: 130,
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCodes",
      key: "regionCodes",
    }
  ];
  //Hide shipping table columns
  // const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Dealer
  // if (getHideColumns.length > 0) {
  //   for (let index = 0; index < getHideColumns.length; index++) {
  //     columns = _.without(columns, _.findWhere(columns, {
  //       dataIndex: getHideColumns[index].dataIndex
  //     }
  //     ))
  //   }
  // }


  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.usersTitle.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <Row>
              <Col span={6}>
                <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
              </Col>
              <Col span={5} offset={1}>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <TreeSelect
                  treeData={treeData}
                  onChange={onChangeDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Bayi Kodu Seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: '250px' }}
                  dropdownMatchSelectWidth={500}
                />
              </Col>
              <Col span={6}>
                <RangePicker
                  format={siteConfig.dateFormat}
                  onChange={changeTimePicker}
                  defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                  onOk={onOk}
                  style={{ marginBottom: '8px', width: '250px' }}
                />
              </Col>
              <Col span={6}>
                <Input size="small" placeholder="Anahtar kelime" onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={5} offset={1}>
                <Button type="primary" loading={iconLoading} onClick={searchButton}>
                  {<IntlMessages id="forms.button.label_Search" />}
                </Button>
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
          //expandable={{expandedRowRender}}
          pagination={false}
          // scroll={{ x: 'calc(700px + 100%)' }}
          scroll={{x: 'max-content'}}
          size="medium"
          bordered={false}
          pagination={{ position: 'none', pageSize: pageSize }}
        />
        <br></br>
        <Pagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          position='bottom'
          pageSize={pageSize}
          total={totalDataCount}
        />
      </Box>
    </LayoutWrapper>
  );
}

export default UserList;