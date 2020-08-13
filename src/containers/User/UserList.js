//React
import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Pagination, TreeSelect, Modal, Select, Switch, Menu, Dropdown, Tag, notification, message } from "antd";
import Input, {
  InputGroup,
} from '@iso/components/uielements/input';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostUserApi";
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "../Reports/ReportPagination";

//Style
import { DownOutlined, PoweroffOutlined, UserAddOutlined } from '@ant-design/icons';
import UserModel from './UserModel';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";

//Other Library
import moment from 'moment';
import _, { object, values, each } from 'underscore';

const { Panel } = Collapse;
const FormItem = Form.Item;
const { Option } = Select;

const UserList = () => {

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

  //Modal ve Yetkilere göre Bölge,Saha kodu gizleme
  const [visible, setVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [deleteUserVisible, setDeleteUserVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);
  const [fieldVisible, setFieldVisible] = useState(false);

  //Bayi Kodu Tekli veya çoklu seçim kontrolü
  const [dealerCodeSelectModSingle, setDealerCodeSelectModSingle] = useState(false);

  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [localCurrentPage, setlocalCurrentPage] = useState(1);
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat));
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat));
  const [dealerCodes, setDealerCodes] = useState();
  const [regionCodes, setRegionCodes] = useState();
  const [fieldCodes, setFieldCodes] = useState();
  const [role, setRole] = useState();
  const [filterRole, setFilterRole] = useState();
  const [roleNames, setRoleNames] = useState();

  const [objectRole, setObjectRole] = useState();
  const [isLocked, setIsLocked] = useState();
  const [isActive, setIsActive] = useState(null);
  const [userInfoFieldCodes, setUserInfoFieldCodes] = useState();
  const [title, setTitle] = useState();
  const [componentSize, setComponentSize] = useState('default');
  const [newUrlParams, setNewUrlParams] = useState('')

  const location = useLocation();
  const [form] = Form.useForm();
  const queryString = require('query-string');
  const history = useHistory();

  //Component Size
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  //Page index'e göre verilerin yenilenmesi işlemi.
  useEffect(() => {
    console.log("currentPage!", localCurrentPage);
    setCurrentPage(localCurrentPage);
    getVariablesFromUrl();
  }, [localCurrentPage]);

  //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Düzenle</Menu.Item>
      <Menu.Item key="2">Parola Değiştir</Menu.Item>
      <Menu.Item key="3">Sil</Menu.Item>
    </Menu>
  );

  //Menü Secimlerine Göre Modal açma işlemleri
  //3 Adet Modal bulunmaktadır.Bunlar işlemler menüsü secimlerine göre Kullanıcı Düzenleme,Parola yenileme ve Kullanıcı silme modalları
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

  //Saha kodları listesi ve Lookup döndürme işlemi
  const [lookupFieldTreeData, customerInfoLoadingTree, customerInfoSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookup.getFieldCodes}`);
  const lookupFieldChildren = [];
  _.each(lookupFieldTreeData, (item, i) => {
    lookupFieldChildren.push(<Option key={item}>{item}</Option>);
  });

  //Bölge kodları listesi ve Lookup döndürme işlemi
  const [lookupRegionTreeData, lookupFieldLoadingTree, lookupFieldSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookup.getRegionCodes}`);
  const lookupRegionChildren = [];
  _.each(lookupRegionTreeData, (item, i) => {
    lookupRegionChildren.push(<Option key={item}>{item}</Option>);
  });

  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData, lookupDealerLoadingTree, lookupDealerSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookup.getDealerCodes}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });

  //Rol listesi ve Lookup döndürme işlemi
  const [lookupRolesTreeData, lookupRolesLoadingTree, lookupRolesSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.security.getRoles}`);
  const lookupRoleChildren = [];
  const lookupRoleNameChildren = [];
  _.each(lookupRolesTreeData, (item, i) => {
    lookupRoleChildren.push(<Option key={item.id} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
    lookupRoleNameChildren.push(<Option key={item.roleName} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
  });

  //Kullanıcı listesi
  const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange,] =
    useFetch(`${siteConfig.api.users.postUsers}`, { "keyword": searchKey, "isActive": isActive, "roleNames": roleNames, "pageIndex": localCurrentPage - 1, "pageCount": pageSize });

  //Url'i çözümleme işlemi
  function getVariablesFromUrl(query) {
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
      // setRole(role);
      setFilterRole(role);
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

  //Get Search Data
  function dataSearch(selectedPageIndex, selectedPageSize) {
    const params = new URLSearchParams(location.search)

    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');
    params.delete('act');
    params.delete('rol');

    _.filter(roleNames, function (item) {
      params.append('rol', item); params.toString();
    });
    params.append('act', isActive);
    if (selectedPageSize) { params.append('pgsize', selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setlocalCurrentPage(1); params.append('pgindex', 1) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

    return setOnChange(true);
  }
  //Search Button Event
  const searchButton = () => {
    dataSearch();
  };

  //Filtrede Bulunan hesap durumu Combobox 
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

  //Get User By Id
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
    await fetch(`${siteConfig.api.security.getUser}${userId}`, requestOptions)
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

  //Kullanıcı düznleme modalına verileri gönderme işlemi Burada veriler state atılıyor ve modal aktif hale getirliyor.
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

  //User modal events
  function showModal() {
    setVisible(true);
  };

  //Kullanıcı Silme işlemi
  async function handleDeleteUserOk() {
    const user = await deleteUser(userId);

    if (user) { message.success('Kullanıcı başarıyla silinmiştir.'); cancelAndClearValues(); setDeleteUserVisible(false); }
    else { message.error('Kullanıcı silme işlemi başarısızdır.'); }
    return setOnChange(true);
  };

  //Kullanıcı parola değiştirme
  async function handlePasswordOk() {
    const password = await changePassword();

    if (password) { message.success('Parola başarıyla değiştirilmiştir.'); cancelAndClearValues(); setForgotPasswordVisible(false); }
    else { message.error('Parola değiştirme işlemi başarısızdır.'); }
    return setOnChange(true);
  };

  //Kullanıcı Düzenleme kayıt işlemi
  async function handleOk() {
    //Kullanıcı düzenleme işlemi
    const userInfo = await saveUser();
    if (userInfo) { message.success('Kullanıcı başarıyla kaydedilmiştir.'); cancelAndClearValues(); setVisible(false); }
    else { message.error('Kullanıcı kaydetme işlemi başarısızdır.'); }
    modalSelectedValueClear();
    return setOnChange(true);
  };

  //Stateleri temizleme işlemi
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

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    cancelAndClearValues();
  };

  //Select Component Rol değiştirme 
  function roleHandleChange(value, roleInfo) {
    setRole(value);
    setObjectRole(roleInfo);
    fieldRegionAndDealearVisible(roleInfo.roleName);
    modalSelectedValueClear(roleInfo.roleName);
  }

  //Filter Select Role
  function filterRoleChange(value, roleInfo) {
    let selectedRoleName = []
    let selectedroleDescription = []
    setFilterRole(value);
    if (roleInfo !== undefined) {
      if (Array.isArray(roleInfo)) {
        _.each(roleInfo, (item, i) => {
          selectedroleDescription.push(item.key)
          selectedRoleName.push(item.key);
        });
      } else { selectedRoleName.push(roleInfo.key); }

    }
    setRoleNames(selectedRoleName);
  }

  //Select Component Bayi Kodu değiştirme 
  function dealerCodeHandleChange(value) {
    if (dealerCodeSelectModSingle) { setDealerCodes([value]); } else {
      setDealerCodes(value);
    }
  }

  //Select Component Bölte Kodu değiştirme 
  function regionCodeHandleChange(value) {
    setRegionCodes(value);
  }

  //Select Component Saha Kodu değiştirme 
  function fieldCodeHandleChange(value) {
    setUserInfoFieldCodes(value);
  }

  //Select Component Aktiflik durumu değiştirme 
  function isLockedChange(value) {
    setIsLocked(!value);
  }

  //Role göre Saha veya bayi kodunun gizlenmesi
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
    await fetch(`${siteConfig.api.users.deleteUser}${userId}`, requestOptions)
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
    await fetch(siteConfig.api.security.postChangePassword, requestOptions)
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
    await fetch(siteConfig.api.users.postUser, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
  }

  //Yeni Kullanıcı Ekleme işlemi için Modal açma
  function addNewUser() {
    setVisible(true);
  }
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

  let columns = [
    {
      title: "Hesap",
      dataIndex: "isLocked",
      key: "isLocked",
      render: isLocked => (
        <>
          {!isLocked ? (
            <Tag color={'green'} key={isLocked}>
              {'Açık'}
            </Tag>
          ) : (
              <Tag color={'red'} key={isLocked}>
                {'Kapalı'}
              </Tag>
            )}
        </>
      ),
    },
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
          {dealerCodes != undefined ? (
            _.map(dealerCodes, (item, i) => {
              return (<Tag color={'purple'} key={item}>
                {item}
              </Tag>)
            })
          ) : (<Tag color={'purple'}>
          </Tag>)}
        </>
      ),
    },
    {
      title: "Saha Kodu",
      dataIndex: "fieldCodes",
      key: "fieldCodes",
      render: fieldCodes => (
        <>
          {fieldCodes != undefined ? (
            _.map(fieldCodes, (item, i) => {
              return (<Tag color={'volcano'} key={item}>
                {item}
              </Tag>)
            })
          ) : (<Tag color={'volcano'}>
          </Tag>)}
        </>
      ),
    },
    {
      title: "Bölge Kodu",
      dataIndex: "regionCodes",
      key: "regionCodes",
      render: regionCodes => (
        <>
          {regionCodes != undefined ? (
            _.map(regionCodes, (item, i) => {
              return (<Tag color={'cyan'} key={item}>
                {item}
              </Tag>)
            })
          ) : (<Tag color={'cyan'}>
          </Tag>)}
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
                  value={filterRole}
                  onChange={filterRoleChange}
                >
                  {lookupRoleNameChildren}
                </Select>
              </Col>
              <Col span={6}>
                <Select value={isActive} defaultValue={null} style={{ width: 120 }} style={{ marginBottom: '8px', width: '250px' }} onChange={handleChangeIsActive}>
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
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={localCurrentPage}
          position="top"
        />
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
        width={800}
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
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" onChange={isLockedChange} defaultChecked={!isLocked} />
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
        </Form>

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
        <p>{firstName + ' ' + lastName + ' ' + 'kullanıcısını silme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz?'}</p>
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