import React, { useState }  from 'react';
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Input from '@iso/components/uielements/input';
import Checkbox from '@iso/components/uielements/checkbox';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import authAction from '@iso/redux/auth/actions';
import appAction from '@iso/redux/app/actions';
import SignInStyleWrapper from './SignIn.styles';

const { login } = authAction;
const { clearMenu } = appAction;

export default function SignIn() {
  let history = useHistory();
  let location = useLocation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.Auth.idToken);

  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);

  //States
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('')

  React.useEffect(() => {
    if (isLoggedIn) {
      setRedirectToReferrer(true);
    }
  }, [isLoggedIn]);

  //Events
  function handleLogin(e, token = false) {
    e.preventDefault();
    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        userName: userName,
        password: password
      })
    })
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        if (token) {
          dispatch(login(token));
        } else {
          dispatch(login());
        }
        dispatch(clearMenu());
        window.sessionStorage.setItem("nameAndSurname",userName);
        history.push('/dashboard');
      })
      .catch(error => console.log(error));
  }

  let { from } = location.state || { from: { pathname: '/dashboard' } };

  if (redirectToReferrer) {
    return <Redirect to={from} />;
  }
  return (
    <SignInStyleWrapper className="isoSignInPage">
      <div className="isoLoginContentWrapper">
        <div className="isoLoginContent">
          <div className="isoLogoWrapper">
            <Link to="/dashboard">
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
