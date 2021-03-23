import React from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '@iso/config/site.config';
import horizontalLogo from '@iso/assets/images/seramiksan-logo-horizontal.png';
import iconLogo from '@iso/assets/images/seramiksan-logo-icon.png';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import enumerations from '../../config/enumerations';

export default ({ collapsed }) => {
  let className='isoLogoWrapper'
  const siteMode = getSiteMode();
  if(siteMode===enumerations.SiteMode.DeliverysPoint){
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
