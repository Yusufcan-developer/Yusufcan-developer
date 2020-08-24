import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout,Alert } from 'antd';
import appActions from '@iso/redux/app/actions';
import TopbarNotification from './TopbarNotification';
import TopbarSearch from './TopbarSearch';
import TopbarUser from './TopbarUser';
import TopbarAddtoCart from './TopbarAddToCart';
import TopbarWrapper from './Topbar.styles';
import TopbarAlert from './TopbarAlert';
var jwtDecode = require('jwt-decode');


const { Header } = Layout;
const { toggleCollapsed } = appActions;

export default function Topbar() {
  const [selectedItem, setSelectedItem] = React.useState('');
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const { collapsed, openDrawer } = useSelector(state => state.App);
  const dispatch = useDispatch();
  const handleToggle = React.useCallback(() => dispatch(toggleCollapsed()), [
    dispatch,
  ]);
  const isCollapsed = collapsed && !openDrawer;
  const token = jwtDecode(localStorage.getItem("id_token"));
  const activeUser=localStorage.getItem("activeUser");
  const username = token.uname;
  
  const styling = {
    background: customizedTheme.backgroundColor,
    position: 'fixed',
    width: '100%',
    height: 70,
  };
  return (
    <TopbarWrapper>
      <Header
        style={styling}
        className={
          isCollapsed ? 'isomorphicTopbar collapsed' : 'isomorphicTopbar'
        }
      >      
        <div className="isoLeft">
          <button
            className={
              isCollapsed ? 'triggerBtn menuCollapsed' : 'triggerBtn menuOpen'
            }
            style={{ color: customizedTheme.textColor }}
            onClick={handleToggle}
          />      
        </div>
        <div className="isoLeft">
          {activeUser != undefined & activeUser!=username ? (
            <TopbarAlert showAlert={true} username={activeUser} />

          ) : (<TopbarAlert showAlert={false}/>)}

          </div>
        <ul className="isoRight">       
          <li
            onClick={() => setSelectedItem('notification')}
            className={selectedItem ? 'isoNotify active' : 'isoNotify'}>
            <TopbarNotification />
          </li>
          <li onClick={() => setSelectedItem('addToCart')} className="isoCart">
            <TopbarAddtoCart />
          </li>
          <li onClick={() => setSelectedItem('user')} className="isoContact">
            <TopbarUser displayName={username} />
          </li>
        </ul>
      </Header>
    </TopbarWrapper>
  );
}
