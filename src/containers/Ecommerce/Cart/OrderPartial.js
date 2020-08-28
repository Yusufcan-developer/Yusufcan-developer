//React
import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';

//Components
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import { Table, Row, Col, Pagination, TreeSelect, Dropdown, Menu, Alert, Modal, message, InputNumber, Popconfirm, Form, Popover, Space } from "antd";
import TopbarAlert from '../../Topbar/TopbarAlert';
import Popconfirms from '@iso/components/Feedback/Popconfirm';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import Actions from '@iso/redux/themeSwitcher/actions';
import config from '@iso/redux/ecommerce/config'
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Styles
import { DownOutlined } from '@ant-design/icons';
import { strikeout } from "./color.css";
import { RightOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import renderFooter from "../../Reports/ReportSummary";
import numberFormat from "@iso/config/numberFormat";
import ReportPagination from "../../Reports/ReportPagination";

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

  const queryString = require('query-string');
  const history = useHistory();
  const [form] = Form.useForm();

  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity, otherCart } = ecommerceActions;
  const dispatch = useDispatch();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [modalVisible, setModalVisible] = useState(true);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [quantity, setQuantity] = useState();
  const [productItem, setProductItem] = useState();
  const [cartData, setCartData] = useState();
  const [orderData, setOrderData] = useState();
  const [searchKey, setSearchKey] = useState('');
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [editingKey, setEditingKey] = useState('');

  const isEditing = record => record.itemCode === editingKey;
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    getCartList();
  }, []);

  //Url'i çözümleme işlemi
  function getVariablesFromUrl(query) {

    //Url değerini alıyoruz.
    const parsed = queryString.parse(location.search);

    if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
    if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
    if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
  }

  //Get Cart Listesi
  async function getCartList() {
    //Get Database to Redux Product Info
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
        if (!response.ok) { return response.statusText; }//throw Error(response.statusText);
        return response.json();
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
  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
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
    }
    setProductItem(record, deleteAmount);
  };
  function InputNumberOnchange(value) {
    setQuantity(value);
  }
  function nextOrderPage() {
    history.push('/checkout');
  }
  async function productItemOrder(allAmountItem, errorMessageType) {
    let products = localStorage.getItem('cartProducts');
    let productQuantity = localStorage.getItem('cartProductQuantity');
    products = JSON.parse(products);
    productQuantity = JSON.parse(productQuantity);
    let sendDatabaseProductList

    if (allAmountItem.amount != undefined) {//Sepet miktarının tamamını alır
      sendDatabaseProductList = _.each(productQuantity, (item) => {
        item['amount'] = item['quantity'];
        delete item['quantity'];
        if (item.itemCode === allAmountItem.itemCode) { item.orderAmount = allAmountItem.amount }
      });
    }
    else {//Girilmiş olan sipariş miktarını alır
      sendDatabaseProductList = _.each(productQuantity, (item) => {
        item['amount'] = item['quantity'];
        delete item['quantity'];
        if (item.itemCode === productItem.itemCode) { item.orderAmount = quantity }
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
        switch (response.status) {
          case 201:
            return response.json();
            break;
          case 400:
            return response.json();
            break;
          case 401:
            // Go to login
            break;
          case 404:
            // Show 404 page
            break;
          case 500:
            // Serveur Error redirect to 500
            break;
          default:
            // Unknow Error
            break;
        }
      })
      .then(data => {
        if (data) {
          if (data !== 'Unauthorized') {
            products = {};
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
                  orderAmount: product.orderAmount
                });
                products[product.itemCode] = product.item;
              });
            }
            localStorage.setItem('cartProductQuantity', JSON.stringify(productQuantity));
            localStorage.setItem('cartProducts', JSON.stringify(products));
            setOrderData(data.items);
            setCartData(data.items);
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
      title: "Palet",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      footerKey: "amount",
      editable: true,
    },    
    {
      title: "Miktar (m2)",
      dataIndex: "totalM2Pallet",
      key: "totalM2Pallet",
      align: "right",
      footerKey: "totalM2Pallet",
      render: (totalM2Pallet) => { return numberFormat(totalM2Pallet) }
    },
    {
      title: "Kalan Miktar",
      dataIndex: "remaining",
      key: "remaining",
      align: "right",
      footerKey: "remaining",
      render: (record, item) => { return numberFormat(item.amount-item.orderAmount ); }
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
                  {<InputNumber type="numeric" min={1} defaultValue={1} value={quantity} onChange={InputNumberOnchange} />}
                  <Button type="primary" onClick={productItemOrder}>Onayla</Button>
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
      title: "Sipariş Miktarı (m2)",
      dataIndex: "totalM2Pallet",
      key: "totalM2Pallet",
      align: "right",
      footerKey: "totalM2Pallet",
      render: (record,item) => { return numberFormat(item.totalM2Pallet*item.orderAmount) }
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
      <Box >
        <Col span={8} offset={16} align="right" >
          <Button type="primary" size="small" onClick={nextOrderPage} style={{ marginBottom: '5px' }}
            >
            {<IntlMessages id="forms.button.next" /> }
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