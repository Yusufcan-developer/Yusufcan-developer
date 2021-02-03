import React from 'react';
import numberFormat from "@iso/config/numberFormat";
import {WarningTwoTone,InfoCircleTwoTone
} from '@ant-design/icons';
export default function ({ productItem }) {
  function renderUpdateNotes(productItem){
    let message=null;
    if(productItem.updaterType==='Self'){
      message=  null;
    }
    else if(productItem.updaterType==='NonDealerUser')
    {
      message=  <span  style={{ color: 'red',fontSize:'smaller' }}>{productItem.updateNotes} </span>
    }
    else if(productItem.updaterType==='DealerUser'){
      message=  <span  style={{ color: 'red',fontSize:'smaller' }}>{productItem.updateNotes} </span>
    }
    return message;
  }
  
  const trimName = productItem.item.description ? productItem.item.description.substring(0, 30) : '';
  return (
    <div className="isoSingleOrderInfo">
      <p>
        <span>{productItem.itemCode}</span>
        <span>-</span>
        <span>{trimName}</span>
        <span>x</span>
        <span className="isoQuantity">{productItem.orderAmount}</span>       
        {productItem.validationMessage != undefined ? ( <React.Fragment>
        <br/>
        <span style={{ color: 'red' }}>{productItem.validationMessage} </span> </React.Fragment>) : null}
        <br/> {renderUpdateNotes(productItem)}     
      </p>
      <span className="totalPrice">{numberFormat(productItem.orderCost)} TL</span>
    </div>
  );
}
