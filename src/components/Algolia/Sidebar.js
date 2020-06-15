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
// const onChange = checkedList => {
//     setCheckedList(checkedList);
//     setIndeterminate(
//       !!checkedList.length && checkedList.length < plainOptions.length
//     );
//     setCheckAll(checkedList.length === plainOptions.length);
//   };
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
      <h3 className="isoAlgoliaSidebarTitle">Fiyat</h3>
      <RadioGroup>
                <Radio style={radioStyle} value={1}>
                  0 TL - 50 TL
                </Radio>
                <Radio style={radioStyle} value={2}>
                  50 TL - 200 TL
                </Radio>
                <Radio style={radioStyle} value={3}>
                  200 TL - 400 TL
                </Radio>
                <Radio style={radioStyle} value={3}>
                  400 TL - 650 TL
                </Radio>
                <Radio style={radioStyle} value={3}>
                  650 TL - 1000 TL
                </Radio>
                <Radio style={radioStyle} value={3}>
                  1000 TL ve üzeri
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
                 // value={checkedList}
                  // onChange={onChange}
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
