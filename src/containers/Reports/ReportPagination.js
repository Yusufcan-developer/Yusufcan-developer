import React from "react";
import { Pagination } from "antd";

export default (props) => {
    const { onShowSizeChange, onChange, pageSize, total, position,current } = props;
    let style = null;
    if (position === 'top') {
        style = { marginBottom: '10px' };
    } else if (position === 'bottom') {
        style = { marginTop: '10px' }
    }
    return (
        <Pagination
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            pageSize={pageSize}
            total={total}
            current={current}
            showTotal={total => `Toplam ${total} kayıt`}
            hideOnSinglePage
            style={style}
        />);
}