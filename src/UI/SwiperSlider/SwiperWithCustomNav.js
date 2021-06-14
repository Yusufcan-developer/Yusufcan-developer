import React, { useState } from 'react';
import styled from 'styled-components';
import Swiper from 'react-id-swiper';
import Button from '../Antd/Button/Button';
const Wrapper = styled.div`
  position: relative;
  .ant-btn {
    position: absolute;
    top: calc(50% - 32px / 2);
    z-index: 1;
    &.prev {
      left: 15px;
    }
    &.next {
      right: 15px;
    }
  }
`;

export default function SwiperWithCustomNav(props) {
  const [swiper, updateSwiper] = useState(null);
  const { children, navigationControl } = props;
  const goNext = () => {
    if (swiper === null) {
      swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiper === null) {
      swiper.slidePrev();
    }
  };

  return (
    <Wrapper >
      <Swiper getSwiper={updateSwiper}>{children}</Swiper>
      {navigationControl != false ? (
        <Button className="prev" type="primary" onClick={goPrev}>
          Geri
        </Button>
      ) : (<> </>)}
      {navigationControl != false ? (
        <Button className="next" type="primary" onClick={goNext}>
          İleri
        </Button>
      ) : (<> </>)}

    </Wrapper>
  );
}
