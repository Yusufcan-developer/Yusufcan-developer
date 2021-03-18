//React
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import options from './options';
import Scrollbars from '@iso/components/utility/customScrollBar';
import Menu from '@iso/components/uielements/menu';
import appActions from '@iso/redux/app/actions';
import Logo from '@iso/components/utility/logo';
import SidebarWrapper from './Sidebar.styles';
import SidebarMenu from './SidebarMenu';
import _ from 'underscore';

var jwtDecode = require('jwt-decode');
const { Sider } = Layout;

const {
  toggleOpenDrawer,
  changeOpenKeys,
  changeCurrent,
  toggleCollapsed,
} = appActions;

export default function Sidebar() {
  let newColumn;
  const token = jwtDecode(localStorage.getItem("id_token"));
  const dispatch = useDispatch();
  var url = window.location.href.toString().slice(0, 16);
  const {
    view,
    openKeys,
    collapsed,
    openDrawer,
    current,
    height,
  } = useSelector(state => state.App);
  const customizedTheme = useSelector(
    state => state.ThemeSwitcher.sidebarTheme
  );

  useEffect(() => {
    menuOpenOrCloseCollapse(['reportTable'], true);
  }, []);

  function handleClick(e) {
    dispatch(changeCurrent([e.key]));
    if (view === 'MobileView') {
      setTimeout(() => {
        dispatch(toggleCollapsed());
        // dispatch(toggleOpenDrawer());
      }, 100);

      // clearTimeout(timer);
    }
  }

  function menuOpenOrCloseCollapse(newOpenKeys, firstOpen = false) {

    const latestOpenKey = newOpenKeys.find(
      key => !(openKeys.indexOf(key) > -1)
    );
    const latestCloseKey = openKeys.find(
      key => !(newOpenKeys.indexOf(key) > -1)
    );
    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (firstOpen != true) {
      if (latestCloseKey) {
        nextOpenKeys = getAncestorKeys(latestCloseKey);
      }
    }
    dispatch(changeOpenKeys(nextOpenKeys));
  }
  const getAncestorKeys = key => {
    const map = {
      sub3: ['sub2'],
    };
    return map[key] || [];
  }
  function onOpenChange(newOpenKeys) {
    menuOpenOrCloseCollapse(newOpenKeys);
  };

  const isCollapsed = collapsed && !openDrawer;
  const mode = isCollapsed === true ? 'vertical' : 'inline';
  const onMouseEnter = event => {
    if (collapsed && openDrawer === false) {
      dispatch(toggleOpenDrawer());
    }
    return;
  };
  const onMouseLeave = () => {
    if (collapsed && openDrawer === true) {
      dispatch(toggleOpenDrawer());
    }
    return;
  };
  const isPointAddressDelivery = localStorage.getItem('isPointAddressDelivery');
  let backgroundColor=customizedTheme.backgroundColor;
  if(isPointAddressDelivery==='true'){
    backgroundColor='#4482FF'
  }
  const styling = {    
    backgroundColor: backgroundColor,
  };
  const submenuStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: customizedTheme.textColor,
  };
  let submenuColor = {
    color: customizedTheme.textColor,
  };

  //SidebarMenu Desing
  if (token.urole === 'admin') {
    newColumn = options.sideBarMenu.Admin;
  }
  else if (token.urole === 'fieldmanager') {
    newColumn = options.sideBarMenu.FieldManager;
  }
  else if (token.urole === 'regionmanager') {
    newColumn = options.sideBarMenu.RegionManager;
  }
  else if (token.urole === 'support') {
    newColumn = options.sideBarMenu.Support;
  }
  else if (token.urole === 'director') {
    newColumn = options.sideBarMenu.Director;
  }
  else if (token.urole === 'dealersv') {
    newColumn = options.sideBarMenu.Dealersv;
  }
  else if (token.urole === 'dealerwhouse') {
    newColumn = options.sideBarMenu.Dealerwhouse;
  }
  else if (token.urole === 'dealerlimited') {
    newColumn = options.sideBarMenu.Dealerlimited;
  }
  {
    return (
      <SidebarWrapper>
        <Sider
          trigger={null}
          collapsible={true}
          collapsed={isCollapsed}
          width={240}
          className="isomorphicSidebar"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={styling}
        >
          <Logo collapsed={isCollapsed} />
          <Scrollbars style={{ height: height - 70 }}>
            <Menu
              onClick={handleClick}
              theme="dark"
              className="isoDashboardMenu"
              mode={mode}
              openKeys={isCollapsed ? [] : openKeys}
              selectedKeys={current}
              onOpenChange={onOpenChange}
            >
              {newColumn.map(singleOption => (
                <SidebarMenu
                  key={singleOption.key}
                  submenuStyle={submenuStyle}
                  submenuColor={submenuColor}
                  singleOption={singleOption}
                />
              ))}
            </Menu>
          </Scrollbars>
        </Sider>
      </SidebarWrapper>
    );
  }
}
