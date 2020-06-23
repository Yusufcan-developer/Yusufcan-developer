import { all, takeEvery, put } from 'redux-saga/effects';
import actions from './actions';
import fake from './fake';
import fakeinitdata from './config';

export function* changedCard() {
  yield takeEvery(actions.CHANGE_CARDS, function*() {});
}
export function* initData() {
  let fakeData = fakeinitdata;
  if (fakeinitdata.productQuantity.length === 0) {
    fakeData = fake;
  }
  yield put({
    type: actions.INIT_DATA,
    payload: fakeData,
  });
}
export function* updateData({ products, productQuantity }) {
  console.log('xxxx up',products)
  console.log('xxxx productQuantity ',productQuantity)
  console.log('xxxx son update kISMI')
  localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
  localStorage.setItem('cartProducts', JSON.stringify(products));
  yield put({
    type: actions.UPDATE_DATA,
    products,
    productQuantity,
  });
}
export default function*() {
  console.log('xxxx son update kISMI1')
  yield all([
    //takeEvery(actions.INIT_DATA_SAGA, initData),
    takeEvery(actions.UPDATE_DATA_SAGA, updateData),
  ]);
}
