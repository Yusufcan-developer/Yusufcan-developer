import React from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '@iso/config/site.config';
import horizontalLogo from '@iso/assets/images/seramiksan-logo-horizontal.png';
import iconLogo from '@iso/assets/images/seramiksan-logo-icon.png';
import { getIsPointAddressDelivery } from '@iso/lib/helpers/isPointAddressDelivery';

export default ({ collapsed }) => {
  let className='isoLogoWrapper'
  const isPointAddressDelivery = getIsPointAddressDelivery();
  if(isPointAddressDelivery===true){
    className='isoAddressDeliveryLogoWrapper'
  }
  return (
    <div className={className}>
      {collapsed ? (
        <div>
          <h3>
            {/* <Link to="/">
              <i className={siteConfig.siteIcon} />
            </Link> */}
            <img src={iconLogo} style={{ maxHeight: '60px', paddingTop: '10px' }} />
          </h3>
        </div>
      ) : (
          <>
            {/* <h3>
              <Link to="/">{siteConfig.siteName}</Link>
            </h3> */}
            <div style={{ paddingTop: '10px' }}>
              <img src={horizontalLogo} style={{ width: '100%' }} />
            </div>
          </>
        )}
    </div>
  );
};
