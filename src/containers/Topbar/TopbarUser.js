import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Form from "@iso/components/uielements/form";
import Popover from '@iso/components/uielements/popover';
import IntlMessages from '@iso/components/utility/intlMessages';
import authAction from '@iso/redux/auth/actions';
import TopbarDropdownWrapper from './TopbarDropdown.styles';
import { Modal, message, Input } from "antd";

//Fetch
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";
var jwtDecode = require('jwt-decode');
const { logout } = authAction;

export default function TopbarUser(props) {
  const [visible, setVisibility] = React.useState(false);
  const [username, setUsername] = useState();
  const [oldPassword, setOldPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [form] = Form.useForm();
  const { displayName } = props;
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  function handleVisibleChange() {
    setVisibility(visible => !visible);
  }

  const content = (
    <TopbarDropdownWrapper className="isoUserDropdown">
      {/* <Link className="isoDropdownLink" to={'/my-profile'}>
        <IntlMessages id="topbar.myprofile" />
      </Link> */}
      <a className="isoDropdownLink" onClick={() => showPasswordModal()}>
        <IntlMessages id="themeSwitcher.settings" />
      </a>
      <div className="isoDropdownLink" onClick={() => dispatch(logout())}>
        <IntlMessages id="topbar.logout" />
      </div>
    </TopbarDropdownWrapper>
  );
  function showPasswordModal() {
    const token = jwtDecode(localStorage.getItem("id_token"));
    setUsername(token.uname);
    setForgotPasswordVisible(true);
  }
  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setForgotPasswordVisible(false);
  };

  //Parola düzenleme fetch işlemi
  async function changePassword() {
    let userData;
    const reqBody = {
      "username": username, "oldPassword": oldPassword || '', "newPassword": newPassword
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
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
  }

  //Kullanıcı parola değiştirme
  async function handlePasswordOk() {
    const password = await changePassword();

    if (password) {
      message.success('Parola başarıyla değiştirilmiştir.'); handleCancel(); setForgotPasswordVisible(false);
      postSaveLog(enumerations.LogSource.Users, enumerations.LogTypes.Update, username + ' kullanıcı parolası değiştirilmiştir.');
    }
    else { message.error('Parola değiştirme işlemi başarısızdır.'); postSaveLog(enumerations.LogSource.Users, enumerations.LogTypes.Update, username + ' kullanıcı parolası değiştirlemedi.'); }

  };
  return (
    <React.Fragment>
      <Popover
        content={content}
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
        arrowPointAtCenter={true}
        placement="bottomLeft"
      >
        {/* <div className="isoImgWrapper">
        <img alt="user" src={userpic} />   
      </div> */}
        <i
          className="ion-android-contact"
          style={{ color: customizedTheme.textColor }}
        />
        <h5 style={{ display: 'inline', marginLeft: '10px' }}>{displayName}</h5>
      </Popover>
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
            <Input.Password autoComplete={"off"} value={oldPassword} onChange={event => setOldPassword(event.target.value)} />
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
            <Input.Password autoComplete={"off"} value={newPassword} onChange={event => setNewPassword(event.target.value)} />
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
    </React.Fragment>
  );
}
