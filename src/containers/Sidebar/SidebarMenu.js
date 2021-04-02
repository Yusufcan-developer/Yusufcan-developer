import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

import Menu from '@iso/components/uielements/menu';
import IntlMessages from '@iso/components/utility/intlMessages';
import { stripTrailingSlash } from '@iso/lib/helpers/utility';


const SubMenu = Menu.SubMenu;

export default React.memo(function SidebarMenu({
  singleOption,
  submenuStyle,
  submenuColor,
  ...rest
}) {
  let match = useRouteMatch();
  const siteMode = getSiteMode();

  const { key, label, leftIcon, children } = singleOption;
  const url = stripTrailingSlash(match.url);

  if (children) {
    return (
      <SubMenu
        key={key}
        title={
          <span className="isoMenuHolder" style={submenuColor} >
            <i className={leftIcon} style={submenuColor} />
            <span style={submenuColor}>
              <IntlMessages id={label} />
            </span>
          </span>
        }
        {...rest}
      >
        {children.map(child => {
          const linkTo = child.withoutDashboard
            ? `/${child.key}`
            : `${url}/${child.key}?smode=${siteMode}`;
          return (
            <Menu.Item style={submenuStyle} key={child.key}>
              <Link style={submenuColor} to={linkTo} >
                <span style={submenuColor}>
                  <IntlMessages id={child.label} />
                </span>
              </Link>
            </Menu.Item>
          );
        })}
      </SubMenu>
    );
  }

  return (
    <Menu.Item key={key} {...rest}>
      <Link to={`${url}/${key}?smode=${siteMode}`}>
        <span className="isoMenuHolder" style={submenuColor}>
          <i className={leftIcon} style={submenuColor} />
          <span style={submenuColor}>
            <IntlMessages id={label} />
          </span>
        </span>
      </Link>
    </Menu.Item>
  );
});
