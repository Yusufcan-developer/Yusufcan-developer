import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory, useRouteMatch, useParams } from 'react-router-dom';
import TopbarSearchModal from './TopbarSearchModal.styles';
import { Col, Row, Modal, Table, Input, Space, message } from "antd";
import Button from "@iso/components/uielements/button";
export default function TopbarSearch() {

  const [visible, setVisible] = useState(false);
  const [keyword, setKeyword] = useState();
  const customizedTheme = useSelector(state => state.ThemeSwitcher.topbarTheme);
  const history = useHistory();


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
    if (keyword!==undefined) {
      if (e.keyCode == 13) {
        setVisible(false);
        history.push(`${'/products/search'}/?keyword=${keyword}`)
      }
      setKeyword();
    }
  }
  function showModal() {
    setVisible(true);
  };

  //Input
  const onchange = e => {
    setKeyword(e.target.value);
  }
  return (
    <div onClick={showModal}>
      <i
        className="ion-ios-search-strong"
        style={{ color: customizedTheme.textColor }}
      />
      <TopbarSearchModal
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        wrapClassName="isoSearchModal"
        width="60%"
        footer={null}
      >
        <div className="isoSearchContainer">
          {<Input
            id="InputTopbarSearch"
            size="large"
            placeholder="Ara"
            value={keyword}
            onChange={onchange}
            onKeyDown={keyPress}
          />}
        </div>
      </TopbarSearchModal>
    </div>
  );
}
