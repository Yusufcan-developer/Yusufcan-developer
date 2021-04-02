import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Col, Tag } from 'antd';
import useWindowSize from '@iso/lib/hooks/useWindowSize';
import appActions from '@iso/redux/app/actions';
import siteConfig from '@iso/config/site.config';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import DashboardRoutes from './DashboardRoutes';
import ErrorBoundary from '../../ErrorBoundary';
import { DashboardContainer, DashboardGlobalStyles } from './Dashboard.styles';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import enumerations from "../../config/enumerations";
import { CarOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;
const { toggleAll } = appActions;


export default function Dashboard() {
  const dispatch = useDispatch();
  const appHeight = useSelector(state => state.App.height);
  const { width, height } = useWindowSize();
  const siteMode = getSiteMode();
  const styles = {
    layout: { flexDirection: 'row', overflowX: 'hidden' },
    content: {
      padding: '70px 0 0',
      flexShrink: '0',
      background: siteMode !== enumerations.SiteMode.DeliverysPoint ? '#f1f3f6' : '#fffcf2',//fe9d9d 
      position: 'relative',
    },
    footer: {
      background: siteMode !== enumerations.SiteMode.DeliverysPoint ? '#f1f3f6' : '#fffcf2',
      textAlign: 'center',
      borderTop: '1px solid #ededed',
    },
  };
  React.useEffect(() => {
    dispatch(toggleAll(width, height));
  }, [width, height, dispatch]);

  return (
    <ErrorBoundary>
      <DashboardContainer>
        <DashboardGlobalStyles />
        <Layout style={{ height: height }}>
          <Topbar />
          <Layout style={styles.layout}>
            <Sidebar />

            <Layout
              className="isoContentMainLayout"
              style={{
                height: appHeight,
              }}
            >
              <Content className="isomorphicContent" style={styles.content}>
                {siteMode === enumerations.SiteMode.DeliverysPoint ?
                  <Col style={{ width: '100%' }} align="right">
                    <Tag icon={<CarOutlined />} style={{ margin: '5px' }} color="magenta">Adrese teslim modundasız</Tag>
                  </Col> : null}
                <DashboardRoutes />
              </Content>
              <Footer style={styles.footer}>{siteConfig.footerText}</Footer>
            </Layout>
          </Layout>

        </Layout>
      </DashboardContainer>
    </ErrorBoundary>
  );
}
