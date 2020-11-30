//React
import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch, useParams, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import { Table, Row, Col, Pagination, TreeSelect, Dropdown, Menu, Select, Modal, message } from "antd";
//Fetch
import { useCartListData } from "@iso/lib/hooks/fetchData/useGetCartList";
import { useGetLookupTreeData } from "@iso/lib/hooks/fetchData/useGetLookupTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

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
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import enumerations from "../../../config/enumerations";

//Other Library
// import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import logMessage from '@iso/config/logMessage';
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CartList = () => {
  document.title = "Sepet Listesi - Seramiksan B2B";
  let newView = 'MobileView';
  if (window.innerWidth > 1220) {
    newView = 'DesktopView';
  }
  //Bayi Kodu Tekli veya çoklu seçim kontrolü
  const [dealerCodeSelectModSingle, setDealerCodeSelectModSingle] = useState(false);

  const queryString = require('query-string');
  const history = useHistory();
  const [form] = Form.useForm();

  const { switchActivation, changeTheme } = Actions;
  const { isActivated, topbarTheme, sidebarTheme, layoutTheme } = useSelector(
    state => state.ThemeSwitcher
  );
  const { productQuantity, products } = useSelector(state => state.Ecommerce);
  const { addToCart, changeViewTopbarCart, changeProductQuantity, otherCart } = ecommerceActions;
  const dispatch = useDispatch();

  const styleButton = { background: sidebarTheme.buttonColor };
  const [searchKey, setSearchKey] = useState('');
  const [expandedKeys, setExpandedKeys] = useState();
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [iconLoading, setIconLoading] = useState(false);
  const [deleteCartVisible, setDeleteCartVisible] = useState(false);
  const [tableOptions, setState] = useState({
    sortedInfo: "",
    filteredInfo: ""
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(1)
  const [startingPageIndex, setStartingPageIndex] = useState(1);
  const [selectedCart, setSelectedCart] = useState();
  const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()).format(siteConfig.dateFormat))
  const [toDate, setToDate] = useState(moment(new Date()).format(siteConfig.dateFormat))
  const [dealerCodes, setDealerCodes] = useState()
  const [regionCodes, setRegionCodes] = useState()
  const [fieldCodes, setFieldCodes] = useState();
  const [accountNo, setAccountNo] = useState();
  const [selectedDealerCode, setSelectedDealerCode] = useState();
  const [newUrlParams, setNewUrlParams] = useState('')
  const location = useLocation();
  const { searchQuery } = useParams();

  //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
  useEffect(() => {
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Browse, logMessage.Carts.browse);
  }, [pageIndex]);

  //Cart Data
  const [cartData, loadingCartData, setOnChange, cartDetailData, totalDataCount] = useCartListData(`${siteConfig.api.carts.cartGetAll}?includeItems=${true}`);

  //Bayi kodları listesi ve Lookup döndürme işlemi
  const [lookupDealerTreeData] = useGetLookupTreeData(`${siteConfig.api.lookup.getDealerCodes}`);
  const lookupDealerChildren = [];
  _.each(lookupDealerTreeData, (item, i) => {
    lookupDealerChildren.push(<Option key={item.Key}>{item.Key + '-' + item.Value}</Option>);
  });

  //Sipariş Kalemleri Görüntüleme
  async function onExpand(expandedKeys) {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  //Sepet Kalemleri Expand İşlemi
  function expandedRow(row, index) {
    let cartDetailIndex;
    _.each(cartData, (item, i) => {
      if (item.accountNo === row.accountNo) { return cartDetailIndex = i }
    });
    return (<Table
      columns={CartDetailcolumns}
      dataSource={cartData[cartDetailIndex].items}
      pagination={false}
      scroll={{ x: 'max-content' }}
      size="medium"
      bordered={false}
      summary={() => {
        return renderFooter(CartDetailcolumns, cartData[cartDetailIndex].items)
      }}
    />);
  };

  //Get Search Data
  function dataSearch(selectedPageIndex, selectedPageSize) {
    postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Browse, logMessage.Carts.search);
    const params = new URLSearchParams(location.search);

    params.delete('keyword');
    params.delete('pgsize');
    params.delete('pgindex');

    if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
    if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
    if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
    let createUrl = null;
    if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
    history.push(`${location.pathname}?${createUrl}`);

    return setOnChange(true);
  }
  //Search Button Event
  const searchButton = () => {
    dataSearch();
  }

  async function postStartEditingBehalfOf(accountNo) {
    try {
      const reqBody = {};
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
        },
        body: JSON.stringify(reqBody)
      };
      let newStartBehalfOfUrl = siteConfig.api.carts.postStartEditingBehalfOf.replace('{accountNo}', accountNo);
      await fetch(`${newStartBehalfOfUrl}`, requestOptions)
        .then(response => {
          const status = apiStatusManagement(response);
          return status;
        })
        .then(data => {
          postSaveLog(enumerations.LogSource.Cart, enumerations.LogTypes.Add, dealerCodes + logMessage.Carts.selectedCart);
        })
        .catch();
    }
    catch (err) {
      console.log(err);
    }
  };

  //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Sepet Düzenlemeyi Aktifleştir</Menu.Item>
      <Menu.Item key="2">Sil</Menu.Item>
    </Menu>
  );

  //Menü Secimlerine Göre Modal açma işlemleri
  async function handleMenuClick(value) {
    switch (value.key) {
      case '1':
        localStorage.setItem('activeUser', selectedCart.accountNo);
        await postStartEditingBehalfOf(selectedCart.accountNo);
        history.push('/cart');
        window.location.reload(false);
        break;
      case '2':
        setAccountNo(selectedCart.accountNo);
        setDeleteCartVisible(true);
        break;
      default:
        break;
    }
  }
  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...tableOptions,
      ["sortedInfo"]: sorter,
      ["filteredInfo"]: filters
    });
  };

  /**Pagination : Tablo  pageSize'ı değiştirir*/
  function onShowSizeChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
  }

  /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
  function currentPageChange(current, pageSize) {
    setPageSize(pageSize);
    setPageIndex(current);
    dataSearch(current, pageSize);
  }
  //Cart silme fetch işlemi
  async function deleteCart(accountNo) {
    let cart;
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      }
    };
    await fetch(`${siteConfig.api.carts.deleteCart}${accountNo}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        cart = data;
      })
      .catch();
    return cart;
  }
  //Sepet Silme işlemi
  async function handleCartDeleteOk() {
    const cart = await deleteCart(selectedCart.accountNo);

    if (cart) { message.success('Sepet başarıyla silinmiştir.'); setDeleteCartVisible(false); }
    else { message.error('Sepet silme işlemi başarısızdır.'); }
    return setOnChange(true);
  };

  //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
  function handleCancel() {
    setDeleteCartVisible(false);
  };
  //Select Component Bayi Kodu değiştirme 
  function dealerCodeHandleChange(value) {
    if (dealerCodeSelectModSingle) { setDealerCodes([value]); } else {
      setDealerCodes(value);
    }
  }

  async function handleCreateCart() {
    if (dealerCodes === undefined) { message.warning('Sepet Oluşturmak İçin Lütfen Bayi Seçiniz') }
    else {
      localStorage.setItem('activeUser', dealerCodes);
      await postStartEditingBehalfOf(dealerCodes);
      history.push('/cart');
      window.location.reload(false);
    }
  }

  //Cart Detail Columns
  const CartDetailcolumns = [
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
      footerKey: "amount"
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
      title: "Toplam",
      dataIndex: "totalCost",
      key: "totalCost",
      align: "right",
      footerKey: "totalCost",
      render: (totalCost, item) => { return numberFormat(totalCost) }
    },
  ];

  //Cart Columns
  let columns = [
    {
      title: "Sepet No",
      dataIndex: "cartId",
      key: "cartId",
      render: () => '-'
    },
    {
      title: "Bağlı Hesap No",
      dataIndex: "accountNo",
      key: "accountNo",
    },
    {
      title: "Açıklama",
      dataIndex: "accountDescription",
      key: "accountDescription",
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      type: "date",
      sorter: (a, b) => a.orderDate - b.orderDate,
      sortOrder:
        tableOptions.sortedInfo.columnKey === "date" &&
        tableOptions.sortedInfo.order,
      render: (orderDate) => moment(orderDate).format(siteConfig.dateFormatAddTime)
    },
    {
      title: "Toplam Kalem",
      dataIndex: "items",
      key: "items",
      type: "items",
      render: (items) => items.length
    },
    {
      title: "İşlemler",
      dataIndex: "title",
      key: "title",
      fixed: "right",
      render: (text, record) => (
        <Dropdown overlay={menu} trigger={['hover']} onVisibleChange={event => { setSelectedCart(record) }} >
          <Button >
            İşlemler  <DownOutlined />
          </Button>
        </Dropdown>
      ),
    }
  ];
  return (

    <LayoutWrapper>
      <PageHeader>
        {<IntlMessages id="page.CreateCarts.header" />}
      </PageHeader>
      <Box>
        {newView !== 'MobileView' ?
          <Row>
            <Col span={6}>
              <FormItem label={<IntlMessages id="page.accountNo" />}></FormItem>
            </Col>
          </Row>
          : null}
        <Row>
          <Col span={newView !== 'MobileView' ? 6 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Hesap Kodu seçiniz"
              optionFilterProp="children"
              value={dealerCodes}
              onChange={dealerCodeHandleChange}
              filterOption={(input, option) =>
                option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
              }
            >
              {lookupDealerChildren}
            </Select>
          </Col>
          <Col span={newView !== 'MobileView' ? 1 : 0} md={newView !== 'MobileView' ? null : 12} sm={newView !== 'MobileView' ? null : 12} xs={newView !== 'MobileView' ? null : 24}>
          </Col>
          <Button type="primary" loading={iconLoading} onClick={handleCreateCart}>
            {<IntlMessages id="forms.button.label_Choose" />}
          </Button>
        </Row>
      </Box>
      <PageHeader>
        {<IntlMessages id="page.ActiveCarts.header" />}
      </PageHeader>
      <Box>
        <Collapse accordion>
          <Panel header={<IntlMessages id="page.filtered" />} key="0">
            <Row>
              <Col span={6}>
                <FormItem label={<IntlMessages id="page.accountNo" />}></FormItem>
              </Col>
              <Col span={6} >
                <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
              </Col>
              <Col span={5} offset={1}>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <TreeSelect
                  // treeData={{}}
                  value={selectedDealerCode}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"Hesap Kodu Seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: '250px' }}
                  dropdownMatchSelectWidth={500}
                />
              </Col>
              <Col span={6}>
                <Input size="small" placeholder="" value={searchKey} onChange={event => setSearchKey(event.target.value)} />
              </Col>
              <Col span={5} offset={1}>
                <Button type="primary" loading={iconLoading} onClick={searchButton}>
                  {<IntlMessages id="forms.button.label_Search" />}
                </Button>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Box>
      {/* Data list volume */}
      <Box >
        <Col span={8} offset={16} align="right" >
          {/* <Button type="primary" size="small" style={{ marginBottom: '5px' }} loading={iconLoading}
            icon={<DownloadOutlined />} onClick={exportExcelButton}>
            {<IntlMessages id="forms.button.exportExcel" />}
          </Button> */}
        </Col>
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={pageIndex}
          position="top"
        />
        <Table
          columns={columns}
          dataSource={cartData}
          onChange={handleChange}
          loading={loadingCartData}
          expandable={{ 'expandedRowRender': expandedRow }}
          pagination={false}
          onExpand={onExpand}
          scroll={{ x: 'max-content' }}
          size="medium"
          bordered={false}
        />
        <ReportPagination
          onShowSizeChange={onShowSizeChange}
          onChange={currentPageChange}
          pageSize={pageSize}
          total={totalDataCount}
          current={pageIndex}
          position="bottom"
        />
        <Modal
          visible={deleteCartVisible}
          title={accountNo + " sepeti silinecektir"}
          okText="Sil"
          cancelText="İptal"
          maskClosable={false}
          onCancel={handleCancel}
          onOk={handleCartDeleteOk}
        >
          <p>{accountNo + 'kullanıcısının sepet silme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz?'}</p>
          <Form
            form={form}
            layout="vertical"
            name="form_in_modal"
            initialValues={{
              modifier: 'public',
            }}
          >
          </Form>
        </Modal>
      </Box>
    </LayoutWrapper>
  );
}

export default CartList;