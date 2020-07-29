import React, { useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect, Modal, Select, Switch,Menu, Dropdown,Tag } from "antd";
import { DownOutlined, PoweroffOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input, {
  InputGroup,
} from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import UserModel from './UserModel';
import _ from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UserList = () => {
  //******************************************************************************************************************* */
  const [searchKey, setSearchKey] = useState('');
  const [username, setUsername] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState(); 
  const [expandedKeys, setExpandedKeys] = useState();
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [iconLoading, setIconLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });


  //******************************************************************************************************************* */
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat));
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat));
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [role,setRole]=useState();
  const [isLocked,setIsLocked]=useState();
  const [userInfoFieldCodes,setUserInfoFieldCodes]=useState();
  const [title,setTitle]=useState();
  let selectedUserId=1;
  const [componentSize, setComponentSize] = useState('default');
  
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };
  const menu = (
    <Menu >
      <Menu.Item key="1">Düzenle</Menu.Item>
      <Menu.Item key="2">Parola değiştir</Menu.Item>
      <Menu.Item key="3">Sil</Menu.Item>
    </Menu>
  );
  useEffect(() => {
    console.log("currentPage!", localCurrentPage);
    setCurrentPage(localCurrentPage);
  }, [localCurrentPage]);

  //Kullanıcı listesi
  const [treeData, loadingTree, setOnChangeTree] = useGetTreeData(`${siteConfig.api.accountsTree}`);

  //Saha kodları listesi ve Lookup döndürme işlemi
  const [lookupFieldTreeData, customerInfoLoadingTree, customerInfoSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookUpFieldCode}`);
  const lookupFieldChildren = [];
  _.each(lookupFieldTreeData, (item, i) => {
    lookupFieldChildren.push(<Option key={item}>{item}</Option>);
  });

  //Bölge kodları listesi ve Lookup döndürme işlemi
  const [lookupRegionTreeData, lookupFieldLoadingTree, lookupFieldSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookUpRegionCode}`);
  const lookupRegionChildren = [];
  _.each(lookupRegionTreeData, (item, i) => {
    lookupRegionChildren.push(<Option key={item}>{item}</Option>);
  });
  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData, lookupDealerLoadingTree, lookupDealerSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookUpDealerCode}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key+'-'+item.Value}</Option>);
  });
 //Rol listesi ve Lookup döndürme işlemi
 const [lookupRolesTreeData, lookupRolesLoadingTree, lookupRolesSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.roles}`);
 const lookupRoleChildren = [];
 _.each(lookupRolesTreeData, (item, i) => {
  lookupRoleChildren.push(<Option key={item.id}>{item.roleDescription}</Option>);
 });
  //Filter Bayi,Bölge,Saha kodları listesi
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

  const selectedRow = () => {
    console.log('xxxx tıkladın')
    UserModel();

  };
  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };
 
  async function getDatabaseProductInfo(userId) {
    //Get User Info
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.getUser}${userId}`, requestOptions)
      .then(response => {
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        console.log("Get : ", `${siteConfig.api.productInfoDatabase}`);
        productInfo = data;
      })
      .catch();
    return productInfo;
  }

  async function setModalUserInfo (record) {
    const userInfo = await getDatabaseProductInfo(record.id);
    
    setUsername(userInfo.username);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setEmail(userInfo.email);
    setRole(String(userInfo.role.id));
    setIsLocked(userInfo.isLocked);
    setUserInfoFieldCodes(userInfo.fieldCodes)
    setDealerCodes(userInfo.dealerCodes);
    setRegionCodes(userInfo.regionCodes);
    setTitle(userInfo.title);
    setVisible(true);
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
    },
    {
      title: "Soyadı",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      dataIndex: ['role', 'roleDescription'],
      key: "role.roleDescription",
    },
    {
      title: "Bayi Kodu",
      dataIndex: "dealerCodes",
      key: "dealerCodes",
      render:(dealerCodes) =>  <Tag color="purple">
      {dealerCodes}
    </Tag>
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCodes",
      key: "fieldCodes",
      render:(fieldCodes) =>  <Tag color="volcano">
      {fieldCodes}
    </Tag>
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCodes",
      key: "regionCodes",
      render:(regionCodes) =>  <Tag color="cyan">
      {regionCodes}
    </Tag>
     
    },
    {
      title: "Ünvan",
      dataIndex: "title",
      key: "title",
      ellipsis:true,
    },
    {
      title: "İşlemler",
      dataIndex: "title",
      key: "title",
      fixed:"right",
      render: () => (
        <Dropdown overlay={menu}>
        <Button>
          İşlemler <DownOutlined />
        </Button>
      </Dropdown>
      ),
    }
  ];  

  //User modal events
  function showModal() {
    setVisible(true);
  };
  function handleOk() {
    // setLoading(true);
    setTimeout(() => {
      // setLoading(false);
      setVisible(false);
    }, 3000);
  };
  function handleCancel() {
    setVisible(false);
    setDealerCodes();
    setRegionCodes();
    setFieldCodes();
  };
  function roleHandleChange(value) {
    setRole(value);
  }
  function dealerCodeHandleChange(value) {
    setDealerCodes(value);
  }
  function regionCodeHandleChange(value) {
    setRegionCodes(value);
  }
  function fieldCodeHandleChange(value) {
    setUserInfoFieldCodes(value);
  }
  function isLockedChange(value) {
    setIsLocked(value);
  }
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
          onRow={(record, rowIndex) => {
            return {
              onClick: event => { setModalUserInfo(record, rowIndex) }
            };
          }}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
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
      <Modal
        visible={visible}
        title={username}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            İptal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleOk}
          >
            Kaydet
          </Button>
        ]}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          initialValues={{
            size: componentSize,
          }}
          onValuesChange={onFormLayoutChange}
          size={componentSize}
        >
          <Form.Item label="Kullanıcı adı">          
            <Input value={username} onChange={event => setUsername(event.target.value)} />
          </Form.Item>
          <Form.Item label="Ad" onChange={event => setFirstName(event.target.value)} >
            <Input value={firstName} />
          </Form.Item>
          <Form.Item label="Soyad" onChange={event => setLastName(event.target.value)}>
            <Input value={lastName} />
          </Form.Item>
          <Form.Item label="Email" onChange={event => setEmail(event.target.value)}>
            <Input value={email} />
          </Form.Item>
          <Form.Item label="Ünvan" onChange={event => setTitle(event.target.value)}>
            <Input value={title} />
          </Form.Item>
          <Form.Item label="Rol" onChange={event => setRole(event.target.value)}>
          <Select
            style={{ width: '100%' }}
            placeholder="Rol seçiniz"
            value={role}
            onChange={roleHandleChange}
          >
            {lookupRoleChildren}
          </Select>
          </Form.Item>
        </Form>
        <Form.Item label="Bayi Kodu">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Bayi Kodu seçiniz"
            value={dealerCodes}
            onChange={dealerCodeHandleChange}
          >
            {lookupDealerChildren}
          </Select>
        </Form.Item>
        <Form.Item label="Bölge Kodu">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Bölge Kodu seçiniz"
            value={regionCodes}
            onChange={regionCodeHandleChange}
          >
            {lookupRegionChildren}
          </Select>
        </Form.Item>
        <Form.Item label="Saha Kodu">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Saha Kodu seçiniz"
            value={userInfoFieldCodes}
           onChange={fieldCodeHandleChange}
          >
            {lookupFieldChildren}
          </Select> 
        </Form.Item>
        <Form.Item >
        <Switch checkedChildren="Pasif" unCheckedChildren="Aktif" onChange={isLockedChange} value={isLocked} />
        </Form.Item>
      </Modal>
    </LayoutWrapper>
  );
}

export default UserList;