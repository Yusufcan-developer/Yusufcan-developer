import React from 'react';
import { Cascader } from "antd";
import { InputBoxWrapper } from './Checkout.styles';

export default function ({ label, placeholder, important, defaultValue, value, options, displayRender }) {
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
        displayRender={displayRender}
      />
    </InputBoxWrapper>
  );
}
