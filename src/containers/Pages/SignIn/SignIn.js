import React, { useState } from 'react';
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Input, Space } from 'antd';
// import Input from '@iso/components/uielements/input';
import Checkbox from '@iso/components/uielements/checkbox';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import authAction from '@iso/redux/auth/actions';
import appAction from '@iso/redux/app/actions';
import Modals from '@iso/components/Feedback/Modal';
import Form from '@iso/components/uielements/form';
import siteConfig from '@iso/config/site.config';
import verticalLogo from '@iso/assets/images/seramiksan-logo-vertical.png';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import SignInStyleWrapper from './SignIn.styles';

const { login } = authAction;
const { clearMenu } = appAction;
const FormItem = Form.Item;

export default function SignIn() {

  let history = useHistory();
  let location = useLocation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.Auth.idToken);
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);

  //Hook state tanımlamaları
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    e.preventDefault();

    if (!username || !password) { return loginError() }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password
      })
    };

    fetch(siteConfig.api.security.postAuthenticate, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        //Kullanıcı girişi başarılı oldugu durumda token değeri alınıyor ve redux'a gönderiliyor.
        //dispatch(login()) fonksiyonu redux actionlarında tanımlı değerdir.
        dispatch(login(data.token));
        dispatch(clearMenu());

        //Kullanıcı girişinden sonra ürün kategorileri sayfasına yönlendiriyoruz.
        history.push('/products/categories');        
      })
      .catch(error => loginError());
  }

  //Kullanıcı ve parola girildikten sonrasında 'enter ' tuş özelliği ayarlanması.
  const keyPress = e => {
    if (e.keyCode == 13) {
      handleLogin(e);
    }
  }

  return (
    <SignInStyleWrapper className="isoSignInPage">
      <div className="isoLoginContentWrapper">
        <div className="isoLoginContent">
          <div className="isoLogoWrapper">
            <div style={{ textAlign: 'center' }}>
              <img src={verticalLogo} style={{ height: '150px' }} title="logo" />
            </div>
          </div>
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
                  autoComplete="false"
                  onKeyDown={keyPress}
                  onChange={event => setPassword(event.target.value)}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </div>

              <div className="isoInputWrapper isoLeftRightComponent">
                <Checkbox>
                  <IntlMessages id="page.signInRememberMe" />
                </Checkbox>
                <Button type="primary" onClick={handleLogin}>
                  <IntlMessages id="page.signInButton" />
                </Button>
              </div>

            </form>
            <div className="isoCenterComponent isoHelperWrapper">
              <Link to="/forgotpassword" className="isoForgotPass">
                <IntlMessages id="page.signInForgotPass" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SignInStyleWrapper>
  );
}
