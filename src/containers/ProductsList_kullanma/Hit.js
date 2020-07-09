import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Highlight, Snippet } from 'react-instantsearch/dom';
import Rate from '@iso/components/uielements/rate';
import Button from '@iso/components/uielements/button';
import { GridListViewWrapper } from '@iso/components/Algolia/AlgoliaComponent.style';
import ecommerceActions from '@iso/redux/ecommerce/actions';

const { addToCart, changeViewTopbarCart } = ecommerceActions;

export default function Hit({ hit }) { 
console.log('xxxx hite geldi') 

// console.log('xxxx h',hit)
// const [addCartLoading, setAddCartLoading] = React.useState(false);
// const { view } = useSelector(state => state.Ecommerce);
  const reqJson = [
    {
      "title": "Vitrifiye",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
    {
      "title": "Karo",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
    {
      "title": "Yapı Kimyasalları",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
    {
      "title": "Banyo mobilyası",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
    {
      "title": "emre-crg",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
    {
      "title": "demem 01651",
      "description": "(Vitrifiye, Karo, Yapı Kimyasalları, Banyo mobilyası)",
      "imageUrl": "https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg",
    },
  ];
  // const [addCartLoading, setAddCartLoading] = React.useState(false);
  // const { view } = useSelector(state => state.Ecommerce);
  //console.log('xxxx hit',productQuantity);
  // const dispatch = useDispatch();
    // const className =
    // view === 'gridView' ? 'isoAlgoliaGrid GridView' : 'isoAlgoliaGrid ListView';
   let addedTocart = false;
  //  productQuantity.forEach(product => {
  //   if (product.objectID === hit.objectID) {
  //    addedTocart = true;
  //   }
  //  });
  const d='ugur camoglu tarafından onaylandı'
  console.log('xxxx h',hit)

  return (
    
      reqJson.map((item) => (
    <GridListViewWrapper className='isoAlgoliaGrid GridView'>
      <div className="isoAlGridImage">
        <img alt="#" src={"https://www.seramiksan.com.tr/images/kategoriler/ocean_4668b.jpg"} />
        { !addedTocart ? (
          <Button
            onClick={() => {
              // setAddCartLoading(true);
              // const update = () => {
              //   dispatch(addToCart(hit));
              //   setAddCartLoading(false);
              // };
              // setTimeout(update, 1500);
            }}
            type="primary"
            className="isoAlAddToCart"
            // loading={addCartLoading}
          >
            <i className="ion-android-cart" />
            Sepete Ekle
          </Button>
        ) : (
          <Button
            // onClick={() => dispatch(changeViewTopbarCart(true))}
            type="primary"
            className="isoAlAddToCart"
          >
            View Cart
          </Button>
        )} }
      </div>
      <div className="isoAlGridContents">
        <div className="isoAlGridName">
          <Highlight attributeName="name" hit={hit} />
        </div>

        <div className="isoAlGridPriceRating">
          <span className="isoAlGridPrice">${d}</span>

          <div className="isoAlGridRating">
            <Rate disabled count={6} defaultValue={hit.rating} />
          </div>
        </div>

        <div className="isoAlGridDescription">
          <Snippet attributeName="description" hit={hit} />
        </div>
      </div>
    </GridListViewWrapper>
    ))
  );
}
