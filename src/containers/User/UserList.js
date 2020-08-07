import React, { useState, useEffect } from "react";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';
import { Table, Row, Col, Pagination, TreeSelect, Modal, Select, Switch, Menu, Dropdown, Tag, notification,message } from "antd";
import { DownOutlined, PoweroffOutlined,UserAddOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input, {
  InputGroup,
} from '@iso/components/uielements/input';
import { useFetch } from "@iso/lib/hooks/fetchData/usePostUserApi";
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";
// import { usePostUser } from "@iso/lib/hooks/fetchData/usePostApiUser";
import siteConfig from "@iso/config/site.config";
import moment from 'moment';
import ReportPagination from "../Reports/ReportPagination";
import UserModel from './UserModel';
import _, { object, values, each } from 'underscore';
import ColumnOptionsConfig from "../../config/ColumnOptions.config";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { Option } = Select;

const UserList = () => {
  //******************************************************************************************************************* */
  const [searchKey, setSearchKey] = useState('');
  const [userId, setUserId] = useState(-1);
  const [username, setUsername] = useState();
  const [oldPassword, setOldPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [iconLoading, setIconLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [deleteUserVisible, setDeleteUserVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);
  const [fieldVisible, setFieldVisible] = useState(false);
  const [dealerCodeSelectModSingle, setDealerCodeSelectModSingle] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });


  //******************************************************************************************************************* */
  /*********************************************** CUSTOM HOOKS ************************************************************ */
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat));
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat));
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [role, setRole] = useState();
  const [roleNames, setRoleNames] = useState();
  
  const [objectRole, setObjectRole] = useState();
  const [isLocked, setIsLocked] = useState();
  const [isActive,setIsActive]=useState(null);
  const [userInfoFieldCodes, setUserInfoFieldCodes] = useState();
  const [title, setTitle] = useState();
  const [componentSize, setComponentSize] = useState('default');
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const [filterIsLocked,setFilterIsLocked]=useState();
  const [form] = Form.useForm();
  const match = useRouteMatch();
  const queryString = require('query-string');
  const history = useHistory();

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };
  function getQueryVariable(query) {
    let role = []
    const parsed = queryString.parse(location.search);
    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if ((parsed.pgindex !== undefined) && (selectedCurrentPage === 0)) { setlocalCurrentPage(parseInt(parsed.pgindex)); }
   
    if (parsed.rol !== undefined) {
      if (Array.isArray(parsed.rol)) {
        _.each(parsed.rol, (item, i) => {
          role.push(item);
        });
      } else { role.push(parsed.rol) }
      setRole(role);
      setRoleNames(role);
    }
    
    if (parsed.act !== undefined) { 
      switch (parsed.act) {
        case 'true':
          setIsActive(true);
          break;
        case 'false':
          setIsActive(false);
          break;
        default:
          setIsActive(null)
          break;
      }
    }
    };
    function dataSearch(selectedPageIndex, selectedPageSize) {
      const params = new URLSearchParams(location.search)

      params.delete('keyword');
      params.delete('pgsize');
      params.delete('pgindex');
      params.delete('act');

      _.filter(roleNames, function (item) {
        params.append('rol', item); params.toString();
      });
      params.append('act',isActive); 
      if (selectedPageSize) { params.append('pgsize', selectedPageSize) } else { params.append('pgsize', pageSize) }
      if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setlocalCurrentPage(1);params.append('pgindex', 1) }
      if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
      let createUrl = null;
      if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
      history.push(`${location.pathname}?${createUrl}`);
  
      return setOnChange(true);
    }
    
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1" >Düzenle</Menu.Item>
      <Menu.Item key="2">Parola değiştir</Menu.Item>
      <Menu.Item key="3">Sil</Menu.Item>
    </Menu>
  );
  
  function handleMenuClick(value) {
    switch (value.key) {
      case '1':
        setVisible(true);
        fieldRegionAndDealearVisible(objectRole.roleName);
        break;
      case '2':
        setForgotPasswordVisible(true);
        break;
        case '3':
          setDeleteUserVisible(true);
          break;
      default:
        break;
    }
  }

  useEffect(() => {
    console.log("currentPage!", localCurrentPage);
    setCurrentPage(localCurrentPage);
    getQueryVariable();
  }, [localCurrentPage]);

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
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });
  //Rol listesi ve Lookup döndürme işlemi
  const [lookupRolesTreeData, lookupRolesLoadingTree, lookupRolesSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.roles}`);
  const lookupRoleChildren = [];
  const lookupRoleNameChildren = [];
  _.each(lookupRolesTreeData, (item, i) => {
    lookupRoleChildren.push(<Option key={item.id} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
    lookupRoleNameChildren.push(<Option key={item.roleName} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
  });
  
  //Kullanıcı listesi
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange,] =
    useFetch(`${siteConfig.api.users}`, {"keyword": searchKey,"isActive": isActive,"roleNames": roleNames,  "pageIndex": localCurrentPage - 1, "pageCount": pageSize });
  /*********************************************** CUSTOM HOOKS ************************************************************ */

  const searchButton = () => {
    dataSearch();
  };
  function onOk(value) {
    console.log("onOk: ", value);
  }
  
  const handleChangeIsActive = (value) => { 
    setIsActive(value);
  };
  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };

  async function getByUserId(userId) {
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
        productInfo = data;
      })
      .catch();
    return productInfo;
  }

  async function setModalUserInfo(record) {
    const userInfo = await getByUserId(record.id);
    setUserId(record.id);
    setUsername(userInfo.username);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setEmail(userInfo.email);
    setRole(String(userInfo.role.id));
    setObjectRole(userInfo.role);
    setIsLocked(userInfo.isLocked);
    setUserInfoFieldCodes(userInfo.fieldCodes)
    setDealerCodes(userInfo.dealerCodes);
    setRegionCodes(userInfo.regionCodes);
    setTitle(userInfo.title);
    // setVisible(true);
  };

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current) {
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    dataSearch(current);
  }

  function addNewUser() {
    setVisible(true);
  }
  //User modal events
  function showModal() {
    setVisible(true);
  };

  async function handleDeleteUserOk() {
    const user = await deleteUser(userId);

    if (user) { message.success('Kullanıcı başarıyla silinmiştir.');cancelAndClearValues(); setDeleteUserVisible(false); }
    else { message.error('Kullanıcı silme işlemi başarısızdır.'); }
    return setOnChange(true);
  };
  async function handlePasswordOk() {
    const password = await changePassword();

    if (password) { message.success('Parola başarıyla değiştirilmiştir.');cancelAndClearValues(); setForgotPasswordVisible(false); }
    else { message.error('Parola değiştirme işlemi başarısızdır.'); }
    return setOnChange(true);
  };
  async function handleOk() {   
    //Kullanıcı düzenleme işlemi
    const userInfo = await saveUser();
    if (userInfo) { message.success('Kullanıcı başarıyla kaydedilmiştir.');cancelAndClearValues(); setVisible(false); }
    else {message.error('Kullanıcı kaydetme işlemi başarısızdır.'); }
    modalSelectedValueClear();
    return setOnChange(true);
  };

  function cancelAndClearValues() {
    setVisible(false);
    setForgotPasswordVisible(false);
    setDeleteUserVisible(false);
    setDealerCodes();
    setRegionCodes();
    setUserInfoFieldCodes();
    setTitle();
    setUsername();
    setFirstName();
    setLastName();
    setEmail();
    setTitle();
    setIsLocked(false);
    setRole();
    setFieldVisible(false);
    setRegionVisible(false);
    setDealerCodeSelectModSingle(false);
  }
  function handleCancel() {
    cancelAndClearValues();
  };
  
  function roleHandleChange(value, roleInfo) {
    setRole(value);
    setObjectRole(roleInfo);
    fieldRegionAndDealearVisible(roleInfo.roleName);
    modalSelectedValueClear(roleInfo.roleName);

    let selectedRoleName = []
    let selectedroleDescription = []
    if (roleInfo !== undefined) {
      if (Array.isArray(roleInfo)) {
        _.each(roleInfo, (item, i) => {
          selectedroleDescription.push(item.key)
          selectedRoleName.push(item.key);
        });
      } else { selectedRoleName.push(roleInfo.key);}

    }
    setRoleNames(selectedRoleName);
  }

  function dealerCodeHandleChange(value) {
    if (dealerCodeSelectModSingle) { setDealerCodes([value]); } else {
      setDealerCodes(value);
    }
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
  function fieldRegionAndDealearVisible(roleName) {

    if ((roleName === 'dealerwhouse') || (roleName === 'dealerlimited') || (roleName === 'dealersv')) {
      setRegionVisible(true);
      setFieldVisible(true);
      setDealerCodeSelectModSingle(true);
    }
    else if (roleName === 'regionmanager') {
      setFieldVisible(true);
      setRegionVisible(false);
      setDealerCodeSelectModSingle(false);
    }
    else {
      setRegionVisible(false);
      setFieldVisible(false);
      setDealerCodeSelectModSingle(false);
    }
  }
  //User Modal secilen öğelerin temizlenmesi
  function modalSelectedValueClear(roleName) {
    if ((roleName === 'dealerwhouse') || (roleName === 'dealerlimited') || (roleName === 'dealersv')) {

    } else { setDealerCodes(); }
    setRegionCodes();
    setUserInfoFieldCodes();
  }

  //Kullanıcı silme fetch işlemi
  async function deleteUser(userId) {
     //Get User Info
     let productInfo;
     const requestOptions = {
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
 
         Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
       }
     };
     await fetch(`${siteConfig.api.deleteUser}${userId}`, requestOptions)
       .then(response => {
         if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
         return response.json();
       })
       .then(data => {
         productInfo = data;
       })
       .catch();
     return productInfo;
  }
  //Parola düzenleme fetch işlemi
  async function changePassword() {
    let userData;
    const reqBody = {
      "username": username, "oldPassword": oldPassword, "newPassword": newPassword
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.changePassword, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
  }
  //Kullanıcı düzenleme fetch işlemi
  async function saveUser() {
    let userData;
    const reqBody = {
      "Id": userId, "firstName": firstName, "lastName": lastName,
      "username": username, "isLocked": isLocked, "email": email, "role": objectRole, "dealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": userInfoFieldCodes
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.user, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
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
      render: dealerCodes => (      
        <>
          { _.map(dealerCodes, (item, i) => {          
            return (
              <Tag color={'purple'} key={item}>
                {item}
              </Tag>
            );
          })}
        </>
      ),  
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCodes",
      key: "fieldCodes",
      render: fieldCodes => (
        <>
          { _.map(fieldCodes, (item, i) => {           
            return (
              <Tag color={'volcano'} key={item}>
                {item}
              </Tag>
            );
          })}
        </>
      ),     
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCodes",
      key: "regionCodes",
      render: regionCodes => (
        <>
          { _.map(regionCodes, (item, i) => {           
            return (
              <Tag color={'cyan'} key={item}>
                {item}
              </Tag>
            );
          })}
        </>
      ),     
    },
    {
      title: "Ünvan",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "İşlemler",
      dataIndex: "title",
      key: "title",
      fixed: "right",
      render: (text, record) => (
        <Dropdown overlay={menu} trigger={['click']} >
          <Button onClick={event => { setModalUserInfo(record) }}>
            İşlemler  <DownOutlined />
          </Button>
        </Dropdown>

      ),
    }
  ];
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
                <FormItem label={<IntlMessages id="page.roleTitle" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.isLocked" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
              </Col>
              <Col span={5} offset={1}>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
              <Select
              mode={"multiple"}
              style={{ marginBottom: '8px', width: '250px' }}
              placeholder="Rol seçiniz"
              value={role}
              onChange={roleHandleChange}
            >
              {lookupRoleNameChildren}
            </Select>
              </Col>
              <Col span={6}>
              <Select value={isActive} defaultValue={null} style={{ width: 120 }}  style={{ marginBottom: '8px', width: '250px' }} onChange={handleChangeIsActive}>
      <Option value={null}>Hepsi</Option>
      <Option value={true}>Açık</Option>
      <Option value={false}>Kapalı</Option>
    </Select>
              </Col>
              <Col span={6}>
                <Input size="small" placeholder="Anahtar kelime" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
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
      <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" style={{ marginBottom: '5px' }} loading={iconLoading}
            icon={<UserAddOutlined />} onClick={addNewUser} >
            {<IntlMessages id="forms.button.addUser" />}
          </Button>
        </Col>
        <Table
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
        />
        <br></br>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={localCurrentPage}
          position="bottom"
        />
      </Box>

      <Modal
        visible={visible}
        title={username === undefined ? 'Yeni Kullanıcı' : username}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
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
          <Form.Item label="Hesap" >
          <Switch checkedChildren="Kapalı" unCheckedChildren="Açık" onChange={isLockedChange} value={isLocked} />
        </Form.Item>
          <Form.Item label="Ad" onChange={event => setFirstName(event.target.value)} >
            <Input value={firstName} />
          </Form.Item>
          <Form.Item label="Soyad" onChange={event => setLastName(event.target.value)}>
            <Input value={lastName} />
          </Form.Item>
          <Form.Item label="E-Posta" onChange={event => setEmail(event.target.value)}>
            <Input value={email} />
          </Form.Item>
          <Form.Item label="Unvan" onChange={event => setTitle(event.target.value)}>
            <Input value={title} />
          </Form.Item>
        </Form>
        <Form.Item label="Bayi Kodu">
          <Select
            mode={(dealerCodeSelectModSingle === true) ? ("single") : ("multiple")}
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
            disabled={regionVisible}
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
            disabled={fieldVisible}
            style={{ width: '100%' }}
            placeholder="Saha Kodu seçiniz"
            value={userInfoFieldCodes}
            onChange={fieldCodeHandleChange}
          >
            {lookupFieldChildren}
          </Select>
        </Form.Item>
        
      </Modal>

      <Modal
        visible={forgotPasswordVisible}
        title="Parola Değiştirme"
        okText="Kaydet"
        cancelText="İptal"
        maskClosable={false}
        onCancel={handleCancel}
        onOk={() => {
          form
            .validateFields()
            .then(values => {
              form.resetFields();
              handlePasswordOk(values);
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: 'public',
          }}
        >
          <Form.Item
            label="Kullanıcı Adı"
          >
            <Input value={username} disabled={true} />
          </Form.Item>
          <Form.Item name="description" label="Eski Parola"
          >
            <Input value={oldPassword} onChange={event => setOldPassword(event.target.value)} />
          </Form.Item>
          <Form.Item
            label="Yeni Parola"
            title='title'
            name='newPassword'
            rules={[
              {
                required: true,
                message: 'Yeni parola giriniz (boş bırakılamaz)!',
              },
              () => ({
                validator(rule, value) {
                  if (value.length > 5) {
                    return Promise.resolve();
                  }
                  return Promise.reject('En az 6 karakter girmelisiniz!');
                },
              }),
            ]}
          >
            <Input value={newPassword} onChange={event => setNewPassword(event.target.value)} />
          </Form.Item>
          <Form.Item
            label="Yeni Parola (Tekrar)"
            title='title'
            name='confirmPassword'
            rules={[
              {
                required: true,
                message: 'Yeni Parola tekrar boş bırakılamaz!',
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Yeni Parola ve Yeni Parola (Tekrar) aynı değildir!');
                },
              }),
            ]}
          >
            <Input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    
      <Modal
        visible={deleteUserVisible}
        title={username + " kullanıcısı silinecektir"} 
        okText="Sil"
        cancelText="İptal"
        maskClosable={false}
        onCancel={handleCancel}
        onOk={handleDeleteUserOk}
      >
      <p>{firstName +' '+ lastName + ' '+'kullanıcısını silme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz?'}</p>
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
          modifier: 'public',
          }}
        >
        </Form>
      </Modal>
    </LayoutWrapper>
  );
}

export default UserList;