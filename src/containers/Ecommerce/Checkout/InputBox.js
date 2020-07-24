import React from 'react';
import Input from '@iso/components/uielements/input';
import { InputBoxWrapper } from './Checkout.styles';

export default function({ label, placeholder, important, defaultValue, value,onChange }) {
  return (
    <InputBoxWrapper className="isoInputBox">
      <label>
        {label}
        {important ? <span className="asterisk">*</span> : null}
      </label>
      <Input size="large" value={value} placeholder={placeholder} defaultValue={defaultValue} onChange={onChange} />
    </InputBoxWrapper>
  );
}
