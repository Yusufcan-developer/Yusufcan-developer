import React from 'react';
import TopbarCartWrapper from './SingleCartModal.style';

//Configs
import numberFormat from "@iso/config/numberFormat";

export default function({
  price,
  quantity,
  image,
  objectID,
  cancelQuantity,
  name,
  isPartial,
  productItem,
  _highlightResult,
}) {
  return (
    <TopbarCartWrapper className="isoCartItems">
      <div className="isoItemImage">
        <img alt="#" src={productItem.imageThumbBaseUrl + productItem.imageMainFileName} />
      </div>
      <div className="isoCartDetails">
        <h3>
          <a href="#!">{productItem.description}</a>
        </h3>
        <p className="isoItemPriceQuantity">          
          <span>{numberFormat(productItem.listPrice)} TL</span>
          <span className="itemMultiplier">/</span>
          <span className="isoItemQuantity">{productItem.unit}</span>
          <span className="itemMultiplier">(</span>
          <span className="isoItemQuantity">{quantity}</span>
          <span className="itemMultiplier"> </span>
          <span className="isoItemQuantity">{isPartial===true?' Kutu':' Palet'}</span>
          <span className="itemMultiplier">)</span>
        </p>
      </div>
      <a
        className="isoItemRemove"
        onClick={() => cancelQuantity(objectID)}
        href="#!"
      >
        <i className="ion-android-close" />
      </a>
    </TopbarCartWrapper>
  );
}
