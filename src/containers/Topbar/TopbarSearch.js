import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import TopbarSearchModal from './TopbarSearchModal.styles';
import { Input } from "antd";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

export default function TopbarSearch() {

  const location = useLocation();
  const [visible, setVisiblity] = React.useState(false);
  const [keyword, setKeyword] = useState();
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const history = useHistory();
  const siteMode = getSiteMode();
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        document.getElementById('InputTopbarSearch').focus();
      } catch (e) { }
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  });

  //Keywor 'Enter' search
  const keyPress = e => {
    if (e.keyCode == 13) {
      if (typeof keyword !== 'undefined') {
        setVisiblity(false);
        history.push(`${'/products/search'}/?keyword=${keyword}&siteMode=${siteMode}`)
        if (location.pathname === '/products/search/') { window.location.reload(false); }
      }
      setKeyword();
    }
  }

  function onClickSearch() {
    if (typeof keyword !== 'undefined') {
      setVisiblity(false);
      history.push(`${'/products/search'}/?keyword=${keyword}&siteMode=${siteMode}`)
      if (location.pathname === '/products/search/') { window.location.reload(false); }
    }
    setKeyword();
  }

  const handleBlur = () => {
    setTimeout(() => {
      setVisiblity(false);
    }, 200);
  };

  //Input
  const onchange = e => {
    setKeyword(e.target.value);
  }
  return (
    <div onClick={() => setVisiblity(true)}>
      <i
        className="ion-ios-search-strong"
        style={{ color: customizedTheme.textColor }}
      />
      <TopbarSearchModal
        visible={visible}
        onOk={() => setVisiblity(false)}
        onCancel={() => setVisiblity(false)}
        maskClosable={true}
        width="60%"
        footer={null}
      >
        {/* <div className="isoSearchContainer"> */}
          {visible ?<Input.Search
            id="InputTopbarSearch"
            size="large"
            placeholder="Ürünlerde ara"
            value={keyword}
            onChange={onchange}
            onSearch={onClickSearch}
            onKeyDown={keyPress}
            onBlur={handleBlur}
          />:null}

        {/* </div> */}
      </TopbarSearchModal>
    </div>
  );
}
