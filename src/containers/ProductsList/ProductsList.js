import React, { useState, useEffect } from "react";
import IntlMessages from "@iso/components/utility/intlMessages";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import { Skeleton, Switch, Card, Avatar, Form, Row, Col, Space } from "antd";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Meta } = Card;
//const FormItem = Form.Item;

const ProductsList = () => {
  const [loading, setloading] = useState(false);

  return (
    <LayoutWrapper>
      <Box>
        {/**Model 1 */}
        <Row gutter={[24, 16]}>
          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              bordered={false}
              hoverable
              style={{ width: 300, marginTop: 16 }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Skeleton loading={loading} avatar active>
                <Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title="Vitrifiye"
                  description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
                />
              </Skeleton>
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              bordered={false}
              hoverable
              style={{ width: 300, marginTop: 16 }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Skeleton loading={loading} avatar active>
                <Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title="Karo"
                  description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
                />
              </Skeleton>
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              bordered={false}
              hoverable
              style={{ width: 300, marginTop: 16 }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Skeleton loading={loading} avatar active>
                <Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title="Yapı Kimyasalları"
                  description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
                />
              </Skeleton>
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              bordered={false}
              hoverable
              style={{ width: 300, marginTop: 16 }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Skeleton loading={loading} avatar active>
                <Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title="Banyo mobilyası"
                  description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
                />
              </Skeleton>
            </Card>
          </Col>
        </Row>
      </Box>

      <Box>
        {/**Model 2 */}
        <Row gutter={[24, 16]}>
          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title="Vitrifiye"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title="Vitrifiye"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title="Vitrifiye"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              hoverable
            >
              <Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title="Vitrifiye"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>
        </Row>
      </Box>

      <Box>
        {/**Model 3 */}
        <Row gutter={[24, 16]}>
          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              hoverable
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              cover={
                <img
                  alt="example"
                  src="https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg"
                />
              }
            >
              <Meta
                title="Vitrifiye"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              hoverable
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              cover={
                <img
                  alt="example"
                  src="https://img.letgo.com/images/9a/ca/2c/6b/9aca2c6b2a5d892107bc5ab69ac026ad.jpeg?impolicy=img_600"
                />
              }
            >
              <Meta
                title="Karo"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              hoverable
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              cover={
                <img
                  alt="example"
                  src="https://lh3.googleusercontent.com/proxy/VqKeBWqVOzsEhOzaShrFQR0F1sz_YfEkQZXCWpEU0tnYQIChg60n8xhIqNxp0U9oit8KXtLjEpqME8EqO8CGvmM2ypfiubtDUcgweJinui-h0GgmCplug1pFnxqW97sRpsNDkxvK5MPJ"
                />
              }
            >
              <Meta
                title="Yapı Kimyasalları"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <Card
              hoverable
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              cover={
                <img
                  alt="example"
                  src="https://mcdn01.gittigidiyor.net/50846/tn50/508463470_tn50_0.jpg?1588147"
                />
              }
            >
              <Meta
                title="Banyo mobilyası"
                description="(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)"
              />
            </Card>
          </Col>
        </Row>
      </Box>
    </LayoutWrapper>
  );
};

export default ProductsList;
