import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Input } from 'antd';
import Checkbox from '@iso/components/uielements/checkbox';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import authAction from '@iso/redux/auth/actions';
import appAction from '@iso/redux/app/actions';
import Modals from '@iso/components/Feedback/Modal';
import siteConfig from '@iso/config/site.config';
import verticalLogo from '@iso/assets/images/seramiksan-logo-vertical.png';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import SignInStyleWrapper from './SignIn.styles';
import { Modal, Alert, message } from "antd";
import Form from "@iso/components/uielements/form";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

const { login } = authAction;
const { clearMenu } = appAction;
const FormItem = Form.Item;
export default function SignIn() {
  const [form] = Form.useForm();
  let history = useHistory();
  const dispatch = useDispatch();

  //Hook state tanımlamaları
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordChangeVisible, setPasswordChangeVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  //Kullanıcı girişinde hata uyarısı
  function loginError() {
    Modals.error({
      title: 'Kullanıcı Girişi',
      content:
        'Kullanıcı adı veya parolanızı kontrol ediniz!',
      okText: 'Tamam',
      cancelText: 'İptal',
    });
  }

  //Kullanıcı girişi
  function handleLogin(e) {
    // e.preventDefault();
    let requestOptions;
    if (!username || !password) { return loginError() }
    if (newPassword !== undefined) {
      requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: newPassword
        })
      };
    }
    else {
      requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password
        })
      };
    }

    fetch(siteConfig.api.security.postAuthenticate, requestOptions)
      .then(response => {
        if (!response.ok) Error(response.statusText);
        return response.json();
      })
      .then(data => {
        //Kullanıcı girişi başarılı oldugu durumda token değeri alınıyor ve redux'a gönderiliyor.
        //dispatch(login()) fonksiyonu redux actionlarında tanımlı değerdir.
        if (data !== undefined) {
          if (data.isPasswordExpired) { setPasswordChangeVisible(true); }
          else if (data.isSuccess === false) {
            return loginError()
          }
          else {
            localStorage.removeItem('activeUser');
            dispatch(login(data.token));
            dispatch(clearMenu()); history.push('/products/categories')
          }
          //Kullanıcı girişinden sonra ürün kategorileri sayfasına yönlendiriyoruz.
          // history.push('/products/categories');

        }
      })
      .catch(error => loginError());
  }

  //Kullanıcı ve parola girildikten sonrasında 'enter ' tuş özelliği ayarlanması.
  const keyPress = e => {
    if (e.keyCode === 13) {
      handleLogin(e);
    }
  }

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setPasswordChangeVisible(false);
    setForgotPasswordVisible(false);
  };
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
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        userData = data;
      }).catch(error => console.log('hata', error));
    return userData;
  }
  async function handleForgotPasswordOk() {
    setForgotPasswordVisible(false);
    // const password = await changePassword();

    // if (password) { message.success('Parola başarıyla değiştirilmiştir.'); setPasswordChangeVisible(false); handleLogin(); }
    // else { message.error('Parola değiştirme işlemi başarısızdır.'); }

  };
  //Kullanıcı parola değiştirme
  async function handlePasswordOk() {
    const password = await changePassword();

    if (password) { message.success('Parola başarıyla değiştirilmiştir.'); setPasswordChangeVisible(false); handleLogin(); }
    else { message.error('Parola değiştirme işlemi başarısızdır.'); }

  };
  return (
    <SignInStyleWrapper className="isoSignInPage">
      <div className="isoLoginContentWrapper">
        <div className="isoLoginContent">
          <div className="isoLogoWrapper">
            <div style={{ textAlign: 'center' }}>
              <img src={verticalLogo} style={{ height: '150px' }} title="logo" />
            </div>
          </div>
          <Modal
            visible={passwordChangeVisible}
            width={600}
            title="Parola Güncelleme"
            okText="Güncelle"
            cancelText={null}
            maskClosable={true}
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
            <Alert message="Son parola değişikliğinizin üzerinden 90 gün geçmiş. Lütfen parolanızı güncelleyiniz." type="error" style={{ marginBottom: '10px' }} />
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
                <Input autoComplete={"off"} value={username} disabled={true} />
              </Form.Item>
              <Form.Item name="description" label="Eski Parola"
                rules={[
                  {
                    required: true,
                    message: 'Eski Parola Boş Geçilemez!',
                  },
                ]}
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
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('description') === value) {
                        return Promise.reject('Eski Parola ve Yeni Parola aynı olmamalıdır!');
                      }
                      return Promise.resolve();
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
                <Input.Password autoComplete={"off"} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
          <div className="isoSignInForm">
            <form>

              <div className="isoInputWrapper">
                <Input
                  size="large"
                  placeholder="Kullanıcı Adı"
                  autoComplete="true"
                  onChange={event => setUsername(event.target.value)}
                />
              </div>

              <div className="isoInputWrapper">
                <Input.Password
                  name='password'
                  size="large"
                  placeholder="Parola"
                  autoComplete="true"
                  onKeyDown={keyPress}
                  onChange={event => setPassword(event.target.value)}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </div>

              <div className="isoInputWrapper isoLeftRightComponent">
              <Link to="" className="isoForgotPass" onClick={()=>setForgotPasswordVisible(true)}>
                <IntlMessages id="page.signInForgotPass" />
              </Link>
                <Button type="primary" onClick={handleLogin}>
                  <IntlMessages id="page.signInButton" />
                </Button>
              </div>
            </form>          
          </div>
        </div>
        <Modal
            visible={forgotPasswordVisible}
            width={600}
            title="Parolanızı mı unuttunuz?"
            okText="İstek Gönder"
            cancelText={null}
            maskClosable={true}
            onCancel={handleCancel}
            onOk={() => {
              form
                .validateFields()
                .then(values => {
                  form.resetFields();
                  handleForgotPasswordOk(values);
                })
                .catch(info => {
                  console.log('Validate Failed:', info);
                });
            }}
          >
            <Alert message="E-postanızı girin, size bir sıfırlama bağlantısı gönderelim." type="error" style={{ marginBottom: '10px' }} />
            <Form
              form={form}
              layout="vertical"
              name="form_in_modal"
              initialValues={{
                modifier: 'public',
              }}
            >
              <Form.Item
                label="Kullanıcı Adı veya E-posta"
              >
                <Input autoComplete={"off"} value={username}/>
              </Form.Item>             
            </Form>
          </Modal>
      </div>
    </SignInStyleWrapper>
  );
}
