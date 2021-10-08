import React, { useState } from 'react';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import numberFormat from "@iso/config/numberFormat";
import { Col, Button, Popover } from "antd";
import Form from "@iso/components/uielements/form";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';

export default function ({ productItem, popupShow, quantityLess, onCompleteGoBox }) {
  const [form] = Form.useForm();
  const [popoverShow, setPopoverShow] = useState(false);
  const trimName = productItem.item.description ? productItem.item.description.substring(0, 30) : '';
  const siteMode = getSiteMode();
  const history = useHistory();
  function showPopupAndPopoverHide() {
    setPopoverShow(false);
    return popupShow();
  }
  return (
    <div className="isoSingleOrderInfo">
      <p>
        <a ><span onClick={() =>{typeof productItem.OverCapacity!=='undefined' ? setPopoverShow(true):popupShow();}} style={{ color: '#000000', cursor: 'pointer', textDecorationLine: typeof quantityLess !== 'undefined' ? 'underline' : null }}>{productItem.itemCode} </span></a>
        <span>

          <Popover               
            content={
              <React.Fragment>
                <Form
                  form={form}
                  layout="vertical"
                  name="form_in_modal"
                  initialValues={{
                    modifier: 'public',
                  }}
                >
                  <Form.Item>
                    <Button style={{ marginRight: '5px' }} onClick={() => history.push(`${'/cart'}/?smode=${siteMode}`)}>Sepete Git</Button>
                    <Button onClick={() => showPopupAndPopoverHide()}>Talep Oluştur</Button>
                  </Form.Item>
                </Form> <a style={{ marginLeft: '180px' }} onClick={() => setPopoverShow(false)}>Kapat</a></React.Fragment>

            }
            placement="left"
            title="Talep Durumu"
            visible={popoverShow}
            trigger="click"
          // onVisibleChange={handleVisibleChange}
          >
          </Popover>
        </span>
        <span style={{ color: '#000000' }}>-</span>
        <span style={{ color: '#000000' }}>{trimName}</span>
        <span style={{ color: '#000000' }}>x</span>
        <span style={{ color: '#000000' }} className="isoQuantity">{productItem.orderAmount}</span>
        <ul style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
          {productItem.validationMessages.map((item) => (
            <li style={{ color: 'red', fontSize: 'smaller' }}> {item.Value}</li>))}
        </ul>
      </p>
      <span style={{ textAlign: 'right', minWidth: '100px' }} className="totalPrice">{numberFormat(productItem.orderCost)} TL</span>

    </div>
  );
}
