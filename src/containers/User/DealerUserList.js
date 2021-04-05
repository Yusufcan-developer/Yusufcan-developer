//React
import React, { useState } from "react";
import { useHistory,  useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, Modal, Select, Switch,  Tag,  message, Input } from "antd";


//Fetch
import { useGetRestrictedUser } from "@iso/lib/hooks/fetchData/useGetRestrictedUser";
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import ReportPagination from "../Reports/ReportPagination";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";
import viewType from '@iso/config/viewType';

//Style
import { SettingOutlined, UserAddOutlined } from '@ant-design/icons';
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";

//Other Library
import moment from 'moment';
import _, { object, values, each } from 'underscore';
import logMessage from '@iso/config/logMessage';
import { func } from "prop-types";

const { Panel } = Collapse;
const FormItem = Form.Item;
const { Option } = Select;
let selectedRoleName;

const UserList = () => {
  document.title = "Kullanıcılar - Seramiksan B2B";

  const [userId, setUserId] = useState(-1);
  const [username, setUsername] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [emailText, setEmail] = useState();
  const [iconLoading, setIconLoading] = useState(false);

  //Modal ve Yetkilere göre Bölge,Saha kodu gizleme
  const [visible, setVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [deleteUserVisible, setDeleteUserVisible] = useState(false);

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
  const [role, setRole] = useState();

  const [objectRole, setObjectRole] = useState();
  const [isLocked, setIsLocked] = useState();
  const [title, setTitle] = useState();
  const [componentSize, setComponentSize] = useState('default');

  const location = useLocation();
  const [form] = Form.useForm();
  const queryString = require('query-string');
  const history = useHistory();
  var jwtDecode = require('jwt-decode');

  const token = jwtDecode(localStorage.getItem("id_token"));

  //Component Size
  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  function handleShowEditUserClick(selectedUser) {
    setModalUserInfo(selectedUser);
        setVisible(true);
  }

  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData, lookupDealerLoadingTree, lookupDealerSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.lookup.getDealerCodes}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });

  //Rol listesi ve Lookup döndürme işlemi
  const [lookupRolesTreeData, lookupRolesLoadingTree, lookupRolesSetOnChangeTree] = useGetLookupTreeData(`${siteConfig.api.security.getRestrictedRole}`);
  const lookupRoleChildren = [];
  const lookupRoleNameChildren = [];
  _.each(lookupRolesTreeData, (item, i) => {
    lookupRoleChildren.push(<Option key={item.id} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
    lookupRoleNameChildren.push(<Option key={item.roleName} roleName={item.roleName} roleDescription={item.roleDescription} id={item.id}>{item.roleDescription}</Option>);
  });

  const [data, loading, setOnChange, totalDataCount] = useGetRestrictedUser(`${siteConfig.api.users.getRestrictedUsers}?dealerCode=${token.dcode}&pageIndex=${localCurrentPage - 1}&pageCount=${pageSize}`, {});

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
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        productInfo = data;
      })
      .catch();
    return productInfo;
  }

  //Get User By Id
  async function generateUsername() {
    //Get User Info
    let userName;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.security.getGenerateUsername}?dealerCode=${token.dcode}`, requestOptions)
      .then(response => {
        return response.text();
      })
      .then(data => {
        userName = data;
      })
      .catch();
    return userName;
  }

  //Generate Password
  async function getGeneratePassword() {
    let password;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.security.getGeneratePassword}?length=${6}`, requestOptions)
      .then(response => {
        return response.text();
      })
      .then(data => {
        password = data;
      })
      .catch();
    return password;

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
    setDealerCodes(userInfo.dealerCodes || []);
    setTitle(userInfo.title);

    selectedRoleName = userInfo.role.roleName;
    // setVisible(true);
  };

  //Kullanıcı Düzenleme kayıt işlemi
  async function handleOk() {

    if (!role) { return message.error('Rol seçiniz'); }
    else {
      if ((selectedRoleName === 'dealerwhouse') || (selectedRoleName === 'dealerlimited') || (selectedRoleName === 'dealersv')) {
        if (!dealerCodes) { return message.error('Bayi kodu seçimi yapınız'); }
        else if (dealerCodes.length === 0) { return message.error('Bayi kodu seçimi yapınız'); }
      }
    }
    if ((!newPassword) || (newPassword.length < 1)) { return message.error('Lütfen parola giriniz veya parola üretiniz'); }
    if (confirmPassword !== newPassword) { return message.error('Parola ve Parol (Tekrar) uyuşmamaktadır'); } 

    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    if (!pattern.test(emailText)) {
      return message.error('Mail adresinizi kontrol ediniz');
    }

    //Kullanıcı düzenleme işlemi
    const userInfo = await saveUser();
    if (userInfo.isSuccessful === false) {
      message.error(userInfo.message); postSaveLog(enumerations.LogSource.Users, enumerations.LogTypes.Add, logMessage.User.saveUserError);
    } else {
      message.success('Kullanıcı başarıyla kaydedilmiştir.'); cancelAndClearValues(); setVisible(false);
      postSaveLog(enumerations.LogSource.Users, enumerations.LogTypes.Add, userInfo.username + logMessage.User.saveUserSuccess);
      // modalSelectedValueClear();
      cancelAndClearValues();
    }

    return setOnChange(true);
  };

  //Stateleri temizleme işlemi
  function cancelAndClearValues() {
    setUserId(-1);
    setUsername();
    setFirstName();
    setLastName();
    setEmail();
    setTitle();
    setIsLocked(false);
    setRole();
    setNewPassword();
    setConfirmPassword();
    setDealerCodeSelectModSingle(false);
    setVisible(false);
    setForgotPasswordVisible(false);
    setDeleteUserVisible(false);
  }

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setUserId(-1);
    cancelAndClearValues();
  };

  //Select Component Rol değiştirme 
  function roleHandleChange(value, roleInfo) {
    setRole(value);
    setObjectRole(roleInfo);
    modalSelectedValueClear(roleInfo.roleName);
  }

  //Select Component Aktiflik durumu değiştirme 
  function isLockedChange(value) {
    setIsLocked(!value);
  }

  //User Modal secilen öğelerin temizlenmesi
  function modalSelectedValueClear(roleName) {
    if ((roleName === 'dealerwhouse') || (roleName === 'dealerlimited') || (roleName === 'dealersv')) {

    } else { setDealerCodes(); }
  }
  //Kullanıcı düzenleme fetch işlemi
  async function saveUser() {
    let userData;
    const reqBody = {
      "id": userId, "firstName": firstName, "lastName": lastName,
      "username": username, "isLocked": isLocked, "email": emailText, "role": objectRole, "title": title, "dealerCode": token.dcode, "password": newPassword
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(siteConfig.api.users.postRestrictedUser, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
  }

  //Yeni Kullanıcı Ekleme işlemi için Modal açma
  async function addNewUser() {
    setVisible(true);
    setDealerCodes(token.dcode);
    const username = await generateUsername();
    const userInfo = await getByUserId(token.uid);
    setTitle(userInfo.title);
    setUsername(username);
  }
  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    // dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageSize(pageSize);
    setSelectedCurrentPage(current);
    setlocalCurrentPage(current);
    // dataSearch(current, pageSize);
  }

  async function generatePasswordOnClick() {
    const password = await getGeneratePassword();
    setNewPassword(password);
    setConfirmPassword(password);
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
      title: "Ad",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Soyad",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Kullanıcı Adı",
      dataIndex: "username",
      key: "username",
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
          {dealerCodes && dealerCodes.length > 0 ? (
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
          {fieldCodes && fieldCodes.length > 0 ? (
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
          {regionCodes && regionCodes.length > 0 ? (
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
      title: "Unvan",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
    },
    {
      title: '',
      dataIndex: "title",
      key: "title",
      fixed: "right",
      render: (text, record) => (       
        <Button onClick={event => { handleShowEditUserClick(record) }}>
          Düzenle <SettingOutlined /> 
        </Button>
      ),
    }
  ];

  const view = viewType('Users');
  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.usersTitle.header" />}
      </PageHeader>
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
            span: 5,
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
            <Input value={username} onChange={event => setUsername(event.target.value)} disabled={true} />
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
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" checked={!isLocked} onChange={isLockedChange} />
          </Form.Item>
          <Form.Item label="Ad" onChange={event => setFirstName(event.target.value)} >
            <Input value={firstName} />
          </Form.Item>
          <Form.Item label="Soyad" onChange={event => setLastName(event.target.value)}>
            <Input value={lastName} />
          </Form.Item>
          <Form.Item label="E-Posta" onChange={event => setEmail(event.target.value)} >
            <Input value={emailText} />
          </Form.Item>
          <Form.Item
            label="Yeni Parola"
            title='title'
            name='newPassword'
          >
            <Row>
              <Col style={{ marginBottom: '8px', width: view !== 'MobileView' ? '65%' : '65%' }} >
                <Input.Password autoComplete={"off"} value={newPassword} onChange={event => setNewPassword(event.target.value)} />
              </Col>
              <Col span={8} align="right" >
                <Button type="link" variant="link" onClick={generatePasswordOnClick} >
                  Parola Üret
                </Button>
              </Col>
            </Row>

          </Form.Item>
          <Form.Item
            label="Yeni Parola (Tekrar)"
            title='title'

          >
            <Input.Password autoComplete={"off"} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
          </Form.Item>
          <Form.Item label="Unvan" onChange={event => setTitle(event.target.value)}>
            <Input value={title} disabled={true} />
          </Form.Item>
          <Form.Item label="Bayi Kodu">
            <Select disabled={true}
              showSearch
              mode={(dealerCodeSelectModSingle === true) ? ("single") : ("multiple")}
              style={{ width: '100%' }}
              placeholder="Bayi Kodu seçiniz"
              value={dealerCodes}
              filterOption={(input, option) =>
                option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
              }
            >
              {lookupDealerChildren}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </LayoutWrapper >
  );
}

export default UserList;