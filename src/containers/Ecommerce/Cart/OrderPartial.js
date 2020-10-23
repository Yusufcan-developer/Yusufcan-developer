//React
import React, { useState, useEffect } from "react";
import { Link, useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';

//Components
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { Table, Row, Col, message, InputNumber, Popconfirm, Form, Popover, Space, Tag } from "antd";
import Popconfirms from '@iso/components/Feedback/Popconfirm';
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Styles
import { DownOutlined } from '@ant-design/icons';
import { strikeout } from "./color.css";
import { RightOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "@iso/config/enumerations";

//Other Library
// import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const OrderPartial = () => {
  document.title = "Sipariş Hazırlama - Seramiksan B2B";
  const history = useHistory();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(true);
  const [quantity, setQuantity] = useState();
  const [productItem, setProductItem] = useState();
  const [cartData, setCartData] = useState();
  const [orderData, setOrderData] = useState();
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [editingKey, setEditingKey] = useState('');
  const [isPartial, setIsPartial] = useState();
  const isEditing = record => record.itemCode === editingKey & record.isPartial === isPartial;

  useEffect(() => {
    getCartList();
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Browse, 'Kısmi sipariş oluşturma');
  }, []);

  //Get Cart Listesi
  async function getCartList() {
    let productInfo;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let uname = token.uname;
    if (activeUser != undefined) { uname = activeUser }
    if (!token.uname) { return 'Unauthorized' }

    await fetch(`${siteConfig.api.carts.getGetByAccountNo}${uname}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        setOrderData(data.items);
        setCartData(data.items);
      })
      .catch();
    return productInfo;
  }

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };

  function handleVisibleChange() {
    setModalVisible(false);
    setEditingKey('');
  }

  const cancel = () => {
    setEditingKey('');
  };

  async function allAmountOrder(record) {
    await productItemOrder(record);
  }
  const edit = (record, deleteAmount = false) => {
    if (deleteAmount) { setQuantity(0); } else {
      setQuantity(record.amount); setModalVisible(true);
      setEditingKey(record.itemCode);
      setIsPartial(record.isPartial);
    }
    setProductItem(record, deleteAmount);
    const productIsPartialTitle = record.isPartial === true ? ' Parçalı' : ' Paletli';
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Delete, record.itemCode + productIsPartialTitle + ' ürün sipariş hazırlıktan sepete geri eklendi.' + 'Miktar ' + record.orderAmount);
  };

  function InputNumberOnchange(value) {
    setQuantity(value);
  }

  function nextOrderPage() {
    history.push('/checkout');
  }
  async function productItemOrder(allAmountItem, errorMessageType) {
    let productQuantity = localStorage.getItem('cartProductQuantity');
    productQuantity = JSON.parse(productQuantity);
    let sendDatabaseProductList

    if (allAmountItem.amount != undefined) {//Sepet miktarının tamamını alır
      sendDatabaseProductList = _.each(productQuantity, (item) => {
        item['amount'] = item['quantity'];
        delete item['quantity'];
        if (item.itemCode === allAmountItem.itemCode && item.isPartial === allAmountItem.isPartial) {
          item.orderAmount = allAmountItem.amount
          const productIsPartialTitle = allAmountItem.isPartial === true ? ' Parçalı' : ' Paletli';
          postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, allAmountItem.itemCode + productIsPartialTitle + ' ürün sipariş oluşturmaya hazırlandı.' + 'Miktar ' + allAmountItem.amount);
        }
      });
    }
    else {//Girilmiş olan sipariş miktarını alır
      sendDatabaseProductList = _.each(productQuantity, (item) => {
        item['amount'] = item['quantity'];
        delete item['quantity'];
        if (item.itemCode === productItem.itemCode && item.isPartial === productItem.isPartial) {
          item.orderAmount = quantity
          if (quantity > 0) {
            const productIsPartialTitle = allAmountItem.isPartial === true ? ' Parçalı' : ' Paletli';
            postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, productItem.itemCode + productIsPartialTitle + ' ürün sipariş oluşturmaya hazırlandı.' + 'Miktar ' + quantity);
          }
        }
      });
    }
    const token = jwtDecode(localStorage.getItem("id_token"));
    const activeUser = localStorage.getItem("activeUser")
    let account = token.uname;
    if (activeUser != undefined) { account = activeUser }
    const reqBody = { "items": sendDatabaseProductList, "accountNo": account };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    fetch(siteConfig.api.carts.postCart, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data) {
          if (data !== 'Unauthorized') {
            productQuantity = [];
            // Verileri Redux'a gönderme işlemi  
            let sendReduxProductList = _.each(data.items, (item) => {
              item['quantity'] = item['amount'];
            });
            if (sendReduxProductList) {
              sendReduxProductList.forEach(product => {
                productQuantity.push({
                  itemCode: product.itemCode,
                  quantity: product.quantity,
                  orderAmount: product.orderAmount,
                  isPartial: product.isPartial
                });
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            setOrderData(data.items);
            setCartData(data.items);
            setModalVisible(false);
            setEditingKey('');
          }
        }
        else {
          if (errorMessageType) {
            message.error('Sipariş silme işlemi başarısızdır.');
          }
          else {
            message.error('Sipariş ekleme işlemi başarısızdır.');
          }
        }
      })
      .catch();
  }

  //Cart Columns
  const CartColumns = [
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
      render: (text, record) => <Link to={'products/detail/' + record.itemCode}>{text}</Link>
    },
    {
      title: "Ürün Adı",
      dataIndex: ['item', 'description'],
      key: "item.description",
      align: "left",
    },
    {
      title: "Birim Fiyat",
      dataIndex: ['item', 'listPrice'],
      key: "item.listPrice",
      align: "right",
    },
    {
      title: "Birimi",
      dataIndex: ['item', 'unit'],
      key: "item.unit",
      render: (unit, record) => {
        return (
          <>
            {record.isPartial === true ? (
              unit === 'TOR' ?
                'TOR' : 'Kutu'
            ) : (unit)}
          </>)
      }
    },
    {
      title: "Palet",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      footerKey: "amount",
      editable: true,
    },
    {
      title: "Miktar (m2)",
      dataIndex: "totalM2",
      key: "totalM2",
      align: "right",
      footerKey: "totalM2",
      render: (totalM2) => { return numberFormat(totalM2) }
    },
    {
      title: "Kalan Miktar",
      dataIndex: "remaining",
      key: "remaining",
      align: "right",
      footerKey: "remaining",
      render: (record, item) =>
      //{ return (item.amount - item.orderAmount);
      {
        return (
          <>
            {item.amount > item.amount - item.orderAmount ? (
              <Tag color={'red'} key={item}>
                {item.amount - item.orderAmount}
              </Tag>
            ) : (<Tag color={'green'}>
              {item.amount - item.orderAmount}
            </Tag>)}
          </>)
      }

      //render: (record, item) => { return numberFormat(item.amount*item.totalM2Pallet-item.totalM2Pallet*item.orderAmount ); }
    },
    {
      title: 'İşlemler',
      dataIndex: 'operation',
      fixed: "right",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popover
              content={
                <div>
                  <Space size={10}>
                    {<InputNumber type="numeric" min={1} defaultValue={1} value={quantity} onChange={InputNumberOnchange} />}
                    <Button type="primary" onClick={productItemOrder}>Onayla</Button>
                  </Space>
                </div>
              }
              placement="left"
              title="Sipariş Miktarı"
              visible={modalVisible}
              trigger="click"
              onVisibleChange={handleVisibleChange}
            >
            </Popover>
          </span>
        ) : (
            <Space >

              <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                <i className="ion-android-create" />
              </a>
              <a disabled={editingKey !== ''} onClick={() => allAmountOrder(record)}>
                <i className="ion-ios-fastforward" />
              </a>

            </Space>
          );
      },
    },
  ];
  const CartToOrderColumns = [
    {
      title: "Ürün Kodu",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    {
      title: "Palet",
      dataIndex: "orderAmount",
      key: "orderAmount",
      align: "right",
      footerKey: "orderAmount",
    },
    {
      title: "Birimi",
      dataIndex: ['item', 'unit'],
      key: "item.unit",
      render: (unit, record) => {
        return (
          <>
            {record.isPartial === true ? (
              'Kutu'
            ) : (unit)}
          </>)
      }
    },
    {
      title: "Sipariş Miktarı (m2)",
      dataIndex: "orderM2",
      key: "orderM2",
      align: "right",
      footerKey: "orderM2",
      render: (record, item) => { return numberFormat(item.orderM2) }
    },

    {
      title: 'İşlemler',
      dataIndex: 'operation',
      fixed: "right",
      render: (_, record) => {
        return (
          <Popconfirms
            title="Seçilen sipariş miktarını silmek istiyor musunuz？"
            okText="Evet"
            cancelText="Hayır"
            placement="topRight"
            onConfirm={productItemOrder}
          >
            <a className="deleteBtn" >
              <i className="ion-android-delete" onClick={() => edit(record, true)} />
            </a>
          </Popconfirms>
        )
      },
    }
  ];

  return (
    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.CartToOrder" />}
      </PageHeader>
      <Box style={{ overflow: 'scroll' }}>
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" onClick={nextOrderPage} style={{ marginBottom: '5px' }}
          >
            {<IntlMessages id="forms.button.next" />}
            {<RightOutlined />}
          </Button>
        </Col>
        <Space size={50}>
          <Table
            title={() => "Sepetim"}
            columns={CartColumns}
            dataSource={cartData}
            onChange={handleChange}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="medium"
            bordered={false}
            // rowClassName={'table-item'}
            rowClassName={(record, index) => (record.amount === record.orderAmount ? 'initial' : "black")}
          />
          <Table
            title={() => "Siparişim"}
            columns={CartToOrderColumns}
            dataSource={orderData}
            onChange={handleChange}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="medium"
            bordered={false}
            rowClassName={(record, index) => (record.orderAmount > 0 ? "black" : "initial")}
          />
        </Space>
      </Box>
    </LayoutWrapper>
  );
}
export default OrderPartial;