import React from 'react';
import { Cascader } from "antd";
import { InputBoxWrapper } from './Checkout.styles';

export default function ({ label, placeholder, important, defaultValue, value, options, onChange, loadData, changeOnSelect }) {
  return (
    <InputBoxWrapper className="isoInputBox">
      <label>
        {label}
        {important ? <span className="asterisk">*</span> : null}
      </label>
      <Cascader
        placeholder={placeholder}
        size="large"
        options={options}
        defaultValue={defaultValue}
        onChange={onChange}
        loadData={loadData}
        changeOnSelect
        value={value}
      />
    </InputBoxWrapper>
  );
}
