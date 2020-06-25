import React from 'react';
import TopbarCartWrapper from './SingleCartModal.style';

export default function({
  price,
  quantity,
  image,
  objectID,
  cancelQuantity,
  name,
  productItem,
  _highlightResult,
}) {
  return (
    <TopbarCartWrapper className="isoCartItems">
      <div className="isoItemImage">
        <img alt="#" src={productItem.imageUrl} />
      </div>
      <div className="isoCartDetails">
        <h3>
          <a href="#!">{productItem.description}</a>
        </h3>
        <p className="isoItemPriceQuantity">          
          <span>{productItem.listPrice} TL</span>
          <span className="itemMultiplier">X</span>
          <span className="isoItemQuantity">{quantity}</span>
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
