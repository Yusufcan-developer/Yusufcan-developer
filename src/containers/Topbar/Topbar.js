import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Switch } from 'antd';
import appActions from '@iso/redux/app/actions';
import TopbarAdressDelivery from './TopbarAdressDelivery';
import TopbarNotification from './TopbarNotification';
import TopbarSearch from './TopbarSearch';
import TopbarUser from './TopbarUser';
import TopbarAddtoCart from './TopbarAddToCart';
import TopbarDemands from './TopbarDemands';
import TopbarWrapper from './Topbar.styles';
import TopbarAlert from './TopbarAlert';
import history from '@iso/lib/helpers/history';
import bulutLogo from '@iso/assets/images/BULUT.png';
import { Link } from 'react-router-dom';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import enumerations from '../../config/enumerations';

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
  if (typeof token === 'undefined') { return history.replace('/'); }
  const activeUser = localStorage.getItem("activeUser");
  const username = token.uname;

  const siteMode = getSiteMode();
  let backgroundColor = customizedTheme.backgroundColor;
  if (siteMode === enumerations.SiteMode.DeliverysPoint) {
    backgroundColor = customizedTheme.backgroundColor;
  }

  const styling = {
    background: backgroundColor,
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
          {activeUser != undefined & activeUser != username ? (
            <TopbarAlert showAlert={true} username={activeUser} />
          ) : (<TopbarAlert showAlert={false} />)}
        </div>
        <ul className="isoRight">
          <li className="isoSearch">
            <TopbarSearch />
          </li>
          {(token.urole !== 'dealersub')?
          <li>
            <img src={bulutLogo} style={{ width: '100px' }} onClick={() => window.open('https://seramiksan.buluttahsilat.com/')}
            />
          </li>:null}
          {token.urole === 'admin' 	|| token.dcode==='B555888' ?
            <li>
              <TopbarAdressDelivery />
            </li> : null}
            {(token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited') ?
            <li
            onClick={() => setSelectedItem('message')}
            className={'isoMsg'}>
            <TopbarDemands />
          </li>:null}
          {(token.urole !== 'dealersub')?
          <li
            onClick={() => setSelectedItem('notification')}
            className={selectedItem ? 'isoNotify active' : 'isoNotify'}>
            <TopbarNotification />
          </li>:null}
          {(token.urole !== 'dealersub')?
          <li onClick={() => setSelectedItem('addToCart')} className="isoCart">
            <TopbarAddtoCart />
          </li>:null}
          <li onClick={() => setSelectedItem('user')} className="isoContact">
            <TopbarUser displayName={username} />
          </li>
        </ul>
      </Header>
    </TopbarWrapper>
  );
}
