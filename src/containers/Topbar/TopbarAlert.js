import React from 'react';
import { Alert } from 'antd';
import { useSelector } from 'react-redux';
var jwtDecode = require('jwt-decode');

export default function TopbarAlert(props) {
  const [visible, setVisiblity] = React.useState(false);
  const { showAlert,username } = props;
  const message=username+' hesabıyla ilişkili sepet üzerinde işlem yapmaktasınız';
  const token = jwtDecode(localStorage.getItem("id_token"));
  function handleVisibleChange() {
    setVisiblity(visible => !visible);
  }
  const onClose = e => {
    localStorage.setItem('activeUser',token.uname);
    window.location.reload(false);
  };
  
    return (
        <React.Fragment>          
            {(showAlert ) ? (
                <Alert message={message} type="info" showIcon closable banner
      onClose={onClose} />
            ) : ('')}

    </React.Fragment>
  );
};

