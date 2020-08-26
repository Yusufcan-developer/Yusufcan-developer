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
import Input from '@iso/components/uielements/input';
import { Table, Row, Col, Pagination, TreeSelect, Dropdown, Menu, Alert, Modal, message, InputNumber,Popconfirm,Form ,Popover,Space} from "antd";
import TopbarAlert from '../../Topbar/TopbarAlert';

//Redux
import { useDispatch, useSelector } from 'react-redux';
import Actions from '@iso/redux/themeSwitcher/actions';
import config from '@iso/redux/ecommerce/config'
import ecommerceActions from '@iso/redux/ecommerce/actions';

//Styles
import { DownOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import renderFooter from "..//../Reports/ReportSummary";
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

const OrderSectional = () => {

  const queryString = require('query-string');
  const history = useHistory();
  const [form] = Form.useForm();

  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity, otherCart } = ecommerceActions;
  const dispatch = useDispatch();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [modalVisible,setModalVisible]=useState(true);
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [quantity,setQuantity]=useState();
  const [cartData,setCartData]=useState();
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
  const edit = record => {
    setQuantity(record.amount);
    setModalVisible(true)
    setEditingKey(record.itemCode);
  };
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
      editable:true,
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
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) => {
          const editable = isEditing(record);
          return editable ? (
            <span>           
              <Popover
        content={
          <div>
            {<Input value={quantity} onChange={event => setQuantity(event.target.value)}/>}
            <Button type="primary">Onayla</Button>
          </div>
        }
        placement="left" 
        title="Sipariş Miktarı"
        visible={modalVisible}
        trigger="click"
        onVisibleChange={handleVisibleChange}
        // onVisibleChange={this.handleVisibleChange}
      >
      </Popover>
            </span>
          ) : (         
            <Space>
                <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                 Düzenle
            </a>
            <Button type="primary">Button</Button>
          
          </Space>
          );
        },
      },
  ];
 
  return (

    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.CartToOrder" />}
      </PageHeader>
      {/* Data list volume */}
      <Box >
        <Col span={8} offset={16} align="right" >         
        </Col>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
        //   total={totalDataCount}
          current={pageIndex}
          position="top"
        />
        <Table
          columns={CartColumns}
          dataSource={cartData}
          onChange={handleChange}
        //   loading={loadingCartData}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
        />
          {/* <Box ></Box>
          <Table
          columns={CartColumns}
          dataSource={cartData}
          onChange={handleChange}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
        /> */}
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
        //   total={totalDataCount}
          current={pageIndex}
          position="bottom"
        />
      </Box>
    </LayoutWrapper>
  );
}

export default OrderSectional;