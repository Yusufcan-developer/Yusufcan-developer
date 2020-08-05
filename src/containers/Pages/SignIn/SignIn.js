import React, { useState }  from 'react';
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// import jwtDecode from 'jwt-decode';
import Input from '@iso/components/uielements/input';
import Checkbox from '@iso/components/uielements/checkbox';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import authAction from '@iso/redux/auth/actions';
import appAction from '@iso/redux/app/actions';
import SignInStyleWrapper from './SignIn.styles';
import Modals from '@iso/components/Feedback/Modal';
import Form from '@iso/components/uielements/form';
import siteConfig from '@iso/config/site.config';

const { login } = authAction;
const { clearMenu } = appAction;
const FormItem = Form.Item;

export default function SignIn() {
  let history = useHistory();
  let location = useLocation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.Auth.idToken);

  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);

  //States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isLoggedIn) {
      setRedirectToReferrer(true);
    }
  }, [isLoggedIn]);

  //Events
function loginError() {
  Modals.error({
    title: 'Kullanıcı Girişi',
    content:
      'Kullanıcı adı veya şifrenizi kontrol ediniz',
    okText: 'OK',
    cancelText: 'Cancel',
  });
}
const keyPress = e => {
  if (e.keyCode == 13) {
    handleLogin(e);
  }
}
  function handleLogin(e) {
    e.preventDefault();

    if (!username || !password) { return loginError() }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password })
  };

    fetch(siteConfig.api.authenticate, requestOptions)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        dispatch(login(data.token));

        dispatch(clearMenu());
        localStorage.setItem("nameAndSurname", username);
        localStorage.setItem("role", data.role.roleName);
        history.push('/products/categories');
      })
      .catch(error => loginError());
  }

  let { from } = location.state || { from: { pathname: '/products/categories' } };

  if (redirectToReferrer) {
    return <Redirect to={from} />;
  }
  return (
    <SignInStyleWrapper className="isoSignInPage">
      <div className="isoLoginContentWrapper">
        <div className="isoLoginContent">
          <div className="isoLogoWrapper">
            <Link to="/">
              <IntlMessages id="page.signInTitle" />
            </Link>
          </div>
          <div className="isoSignInForm">
            <form>
              <div className="isoInputWrapper">
              
                <Input
                  controlId="userName"
                  size="large"
                  placeholder="Kullanıcı Adı"
                  autoComplete="true"
                  onChange={event => setUsername(event.target.value)}
                />
              </div>

              <div className="isoInputWrapper">
                <Input
                  name='password'
                  size="large"
                  type="password"
                  placeholder="Şifre"
                  autoComplete="false"
                  onKeyDown={keyPress}
                  onChange={event => setPassword(event.target.value)}
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
