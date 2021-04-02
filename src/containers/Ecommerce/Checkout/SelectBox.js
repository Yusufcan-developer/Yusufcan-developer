import React from 'react';
import {Select } from "antd";
import { InputBoxWrapper } from './Checkout.styles';

export default function({ label, placeholder, important, defaultValue, value, onChange, disabled, readOnly, optionData }) {
    const { Option } = Select;
  return (
    <InputBoxWrapper className="isoInputBox">
      <label>
        {label}
        {important ? <span className="asterisk">*</span> : null}
      </label>
      <Select size='middle' value={value} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} onChange={onChange} readOnly={readOnly}  >
        {optionData.map((item) => (
          <Option key={item}>{item}</Option>
        ))}
      </Select>
    </InputBoxWrapper>
  );
}
