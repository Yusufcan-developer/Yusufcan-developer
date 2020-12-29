import React from "react";
import { Pagination } from "antd";
import ResultNumberFormat from "@iso/config/resultNumberFormat";
export default (props) => {
    const { onShowSizeChange, onChange, pageSize, total, position, current } = props;
    let style = null;
    if (position === 'top') {
        style = { marginBottom: '10px' };
    } else if (position === 'bottom') {
        style = { marginTop: '10px' }
    }
    let newView = 'MobileView';
    if (window.innerWidth > 1220) {
        newView = 'DesktopView';
    } else if (window.innerWidth > 767) {
        newView = 'TabView';
    }
   
    return (
        <React.Fragment>
        {newView !== 'MobileView' ?  <Pagination
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            pageSize={pageSize}
            total={total}
            current={current}
            pageSizeOptions={['10', '20', '30', '50', '100', '500']}
            showTotal={total => `Toplam ${ResultNumberFormat(total)} kayıt`}
            hideOnSinglePage
            style={style}
        /> : <React.Fragment>{position==='bottom'?<span>{`Toplam ${total} kayıt`} </span> :null } <Pagination
            simple
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            pageSize={pageSize}
            total={total}
            current={current}
            pageSizeOptions={['10', '20', '30', '50', '100', '500']}
            hideOnSinglePage
            style={style}
        /> </React.Fragment>}
       </React.Fragment>);
}