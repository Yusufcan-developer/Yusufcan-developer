import React, { Component } from 'react';
import moment from 'moment';
import IntlMessages from "@iso/components/utility/intlMessages";
// import { Icon } from 'antd';
import { SingleCardWrapper } from './Shuffle.styles';
import { Icon, Switch, Card, Avatar, Form, Row, Col, Space,Button } from "antd";
export default class extends Component {
  render() {
    const listClass = `isoSingleCard card ${this.props.view}`;
    const style = { zIndex: 100 - this.props.index };

    return (
      <SingleCardWrapper id={this.props.id} className={listClass} style={style}>
        <div className="isoCardImage">
          <img alt="#" src={this.props.img} />
        </div>
        <div className="isoCardContent">
          <h3 className="isoCardTitle">{this.props.desc}</h3>
          <span className="isoCardDate">
            {moment(this.props.timestamp).format('MMM Do, YYYY')}
          </span>
          <Button
                        type="primary"
                        // icon={<PoweroffOutlined />}
                    >  {<IntlMessages id="Sepete Ekle" />}
                    </Button>
        </div>
        <button className="isoDeleteBtn" onClick={this.props.clickHandler}>
          <Icon type="close" />
        </button>
        
      </SingleCardWrapper>
    );
  }
}
