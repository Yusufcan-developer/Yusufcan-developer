import React from 'react';
import { Link } from 'react-router-dom';
import Input from '@iso/components/uielements/input';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import ResetPasswordStyleWrapper from './ResetPassword.styles';

export default function() {
  return (
    <ResetPasswordStyleWrapper className="isoResetPassPage">
      <div className="isoFormContentWrapper">
        <div className="isoFormContent">
          <div className="isoLogoWrapper">
            <Link to="/">
              <IntlMessages id="page.resetPassTitle" />
            </Link>
          </div>

          <div className="isoFormHeadText">
            <h3>
              <IntlMessages id="page.resetPassSubTitle" />
            </h3>
            <p>
              <IntlMessages id="page.resetPassDescription" />
            </p>
          </div>

          <div className="isoResetPassForm">
            <div className="isoInputWrapper">
              <Input size="large" type="password" placeholder="Yeni Şifre" />
            </div>

            <div className="isoInputWrapper">
              <Input
                size="large"
                type="password"
                placeholder="Şifreyi Onayla"
              />
            </div>

            <div className="isoInputWrapper">
              <Button type="primary">
                <IntlMessages id="page.resetPassSave" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResetPasswordStyleWrapper>
  );
}
