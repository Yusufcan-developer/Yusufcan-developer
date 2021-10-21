import React, { useState } from 'react';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import numberFormat from "@iso/config/numberFormat";
import { Col, Button, Popover } from "antd";
import Form from "@iso/components/uielements/form";
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { PlusOutlined } from '@ant-design/icons';

export default function ({ productItem, popupShow, quantityLess, onCompleteGoBo, OverCapacity }) {
  const [form] = Form.useForm();
  const [popoverShow, setPopoverShow] = useState(false);
  const trimName = productItem.item.description ? productItem.item.description.substring(0, 30) : '';
  const siteMode = getSiteMode();
  const history = useHistory();
  let buttonTitle;
  if ((typeof OverCapacity !== 'undefined')) {
    buttonTitle = 'Talep Oluştur';
  }
  else {
    buttonTitle = 'Bağlı Ürün Ekle';
  }
  function showPopupAndPopoverHide() {
    setPopoverShow(false);
    return popupShow();
  }

  return (
    <div className="isoSingleOrderInfo">
      <p>
        <span>{productItem.itemCode} </span>
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
        <React.Fragment>
 {productItem.validationMessages.map((item) => (
            <li style={{ color: 'red', fontSize: 'smaller' }}> {item.Value}</li>
            ))
            }
            <p > {
        typeof OverCapacity !== 'undefined'  ||  typeof quantityLess !=='undefined' ?
        <span style={{color:'#1890ff'}} ><Button onClick={() =>{typeof productItem.OverCapacity!=='undefined' 	||  typeof productItem.OverDealerOrderLimit!=='undefined' ? setPopoverShow(true):popupShow();}} size={'small'} style={{ height: '24px' ,color:'green', marginTop:'5px' }} ghost type="primary" icon={ <PlusOutlined />}>
        <span style={{color:'#1890ff' ,fontSize:'12px' }}>{buttonTitle} </span>
    </Button></span>:null }</p>
            </React.Fragment>
        </ul>
      </p>
      <span>
      <div>        
    </div></span>
    <span style={{ textAlign: 'right', minWidth: '100px' }} className="totalPrice">{numberFormat(productItem.orderCost)} TL</span>

    </div>
  );
}
