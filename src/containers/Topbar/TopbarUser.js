import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Popover from '@iso/components/uielements/popover';
import IntlMessages from '@iso/components/utility/intlMessages';
import userpic from '@iso/assets/images/UserLogin.png';
import authAction from '@iso/redux/auth/actions';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

const { logout } = authAction;

export default function TopbarUser(props) {
  const [visible, setVisibility] = React.useState(false);
  const { displayName } = props;
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
      <a className="isoDropdownLink" href="# ">
        <IntlMessages id="themeSwitcher.settings" />
      </a>
      <div className="isoDropdownLink" onClick={() => dispatch(logout())}>
        <IntlMessages id="topbar.logout" />
      </div>
    </TopbarDropdownWrapper>
  );

  return (
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
  );
}
