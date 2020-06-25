import React from 'react';
// import {
//   RefinementList,
//   StarRating,
//   Toggle,
//   HierarchicalMenu,
//   SearchBox,
//   MultiRange,
//   ClearAll,
// } from 'react-instantsearch/dom';
import Searchbar from '@iso/components/Topbar/SearchBox';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import Checkbox, { CheckboxGroup } from '@iso/components/uielements/checkbox';
import Input, {
  InputSearch,
  InputGroup,
  Textarea,
} from '@iso/components/uielements/input';
import ContentHolder from '@iso/components/utility/contentHolder';
import RangeSlider from './RangeSlider';
import VoiceRecognition from './VoiceRecognition';
import { SidebarWrapper } from './AlgoliaComponent.style';
import basicStyle from '@iso/assets/styles/constants';

const plainOptions = ['Modern', 'Klasik','Otantik'];
const yuzeyDokusu=['Mat','Parlak'];
const uygulamaAlani=['Duvar-Taban','Taban','Duvar'];
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
const { rowStyle, colStyle, gutter } = basicStyle;

const defaultCheckedList = ['Modern', 'Klasik','Otantik'];
const onChange = checkedList => {
  //setCheckedList(checkedList);
  // setIndeterminate(
  //   !!checkedList.length && checkedList.length < plainOptions.length
  // );
  // setCheckAll(checkedList.length === plainOptions.length);
  console.log('xxxx checkedList.length',checkedList)
};
// const onCheckAllChange = e => {
//   setCheckedList(e.target.checked ? plainOptions : []);
//   setIndeterminate(false);
//   setCheckAll(e.target.checked);
// };
export default ({ setVoice }) => (
  <SidebarWrapper className="isoAlgoliaSidebar">
  <div className="isoAlgoliaSidebarItem">    
        <InputSearch placeholder="Ara" />
    </div>
    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle">Ürün Grubu</h3>
      <RadioGroup>
                <Radio style={radioStyle} value={1}>
                  Vitrifiye
                </Radio>
                <Radio style={radioStyle} value={2}>
                  Seramik
                </Radio>
                <Radio style={radioStyle} value={3}>
                  Yapı Kimyasalları
                </Radio>
                <Radio style={radioStyle} value={4}>
                  Banyo Mobilyası
                </Radio>               
              </RadioGroup>
    </div>
    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle">Birim Fiyat</h3>
      <RadioGroup>
                <Radio style={radioStyle} value={1}>
                  50 TL/m<sup>2</sup> ve altı
                </Radio>
                <Radio style={radioStyle} value={2}>
                  50 TL/m<sup>2</sup> - 200 TL/m<sup>2</sup>
                </Radio>
                <Radio style={radioStyle} value={3}>
                  200 TL/m<sup>2</sup> - 400 TL/m<sup>2</sup>
                </Radio>
                <Radio style={radioStyle} value={4}>
                  400 TL/m<sup>2</sup> - 650 TL/m<sup>2</sup>
                </Radio>
                <Radio style={radioStyle} value={5}>
                  650 TL/m<sup>2</sup> - 1000 TL/m<sup>2</sup>
                </Radio>
                <Radio style={radioStyle} value={6}>
                  1000 TL/m<sup>2</sup> ve üstü
                </Radio>
              </RadioGroup>
    </div>

    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle" style={{ marginBottom: 10 }}>
        Stil
      </h3>
      <div>
                <div
                  style={{
                    borderBottom: '1px solid #E9E9E9',
                    paddingBottom: '15px',
                  }}
                >
                   <CheckboxGroup
                  options={plainOptions}
                  //value={checkedList}
                   onChange={onChange}
                />
                 
                </div>
                <br />
                <Checkbox
                    //indeterminate={indeterminate}
                    // onChange={onCheckAllChange}
                    // checked={checkAll}
                  >
                    Tümünü Seç
                  </Checkbox>
              </div>
      {/* <RangeSlider attributeName="price" /> */}
    </div>

    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle">Yüzey Dokusu</h3>
      <CheckboxGroup
                  options={yuzeyDokusu}
                 // value={checkedList}
                  // onChange={onChange}
                />
      {/* <RefinementList attributeName="categories" /> */}
    </div>

    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle">Uygulama Alanı</h3>
      <CheckboxGroup
                  options={uygulamaAlani}
                 // value={checkedList}
                  // onChange={onChange}
                />
      {/* <RefinementList attributeName="categories" /> */}
      {/* <RefinementList attributeName="brand" withSearchBox /> */}
    </div>

   
    <div className="isoAlgoliaSidebarItem">
      <h3 className="isoAlgoliaSidebarTitle">Rating</h3>
      {/* <StarRating attributeName="rating" style={{ background: '#ff0000' }} /> */}
    </div>
    <div className="isoAlgoliaSidebarItem isoInline">
      <h3 className="isoAlgoliaSidebarTitle">Toggle</h3>
      {/* <Toggle attributeName="free_shipping" label="Free Shipping" /> */}
    </div>

    {/* <ClearAll /> */}
  </SidebarWrapper>
);
