//React
import React, { useState, useEffect } from "react";
import { NavLink, useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Table, Row, Col, TreeSelect, Radio, InputNumber, Popover, Space } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Input from '@iso/components/uielements/input';
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

//Configs
import { DownloadOutlined } from '@ant-design/icons';
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';

//Other Library
import enumerations from "../../config/enumerations";
import _ from 'underscore';
import ExcelExport from "./ExcelExport";
import logMessage from "../../config/logMessage";
import moment from 'moment';
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;

export default function () {
    document.title = "Dağıtım Listesi - Seramiksan B2B";

    const children = [];
    const Option = SelectOption;
    const [selectedRadioItem, setSelectedRadioItem] = useState(1);
    const [privateDate, setPrivateDate] = useState('Bugun');
    const [searchKey, setSearchKey] = useState('');
    const [tableOptions, setState] = useState({
        sortedInfo: "",
        filteredInfo: ""
    });
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [startingPageIndex, setStartingPageIndex] = useState(1);
    const [fromDate, setFromDate] = useState(moment(moment().subtract(180, 'days').toDate()));
    const [toDate, setToDate] = useState(moment(new Date()));
    const [dealerCodes, setDealerCodes] = useState();
    const [regionCodes, setRegionCodes] = useState();
    const [fieldCodes, setFieldCodes] = useState();
    const [selectedDealerCode, setSelectedDealerCode] = useState();
    const [newUrlParams, setNewUrlParams] = useState('')
    const location = useLocation();
    const [selectedStatusType, setSelectedStatusType] = useState();
    const [address, setAddress] = useState();
    const [lookupAddressChildren, setLookupAddressChildren] = useState();
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [orderNo, setOrderNo] = useState();
    const [quantity, setQuantity] = useState();
    const [modalVisible, setModalVisible] = useState(true);
    const isEditing = record => record.itemCode === editingKey && record.orderNo === orderNo;

    const queryString = require('query-string');
    const history = useHistory();

    //Burada ki useEffect'ler page index page size sonuçlarına göre veri getiriyor.
    useEffect(() => {
        postSaveLog(enumerations.LogSource.ReportDistributions, enumerations.LogTypes.Browse, logMessage.Reports.Distributions.browse);
        getVariablesFromUrl()
        setCurrentPage(pageIndex);
        const token = jwtDecode(localStorage.getItem("id_token"));
        if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            getAdress(token.dcode);
        }
    }, [pageIndex]);

    let searchUrl = queryString.parse(location.search);
    
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
        useFetch(`${siteConfig.api.report.postDistributions}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate.format('YYYY-MM-DD'), "to": toDate.format('YYYY-MM-DD'), "keyword": searchKey, "status": selectedStatusType, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address }, searchUrl);

    //Bayi,Bölge ve Saha kodlarının getirilmesi
    const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

    //Durum Tipleri
    const [statusTypeData] = useFilterData(`${siteConfig.api.lookup.getDistributionStatusTypes}`, searchUrl);
    for (let i = 0; i < statusTypeData.length; i++) {
        children.push(<Option key={statusTypeData[i]}>{statusTypeData[i]}</Option>);
    }
    //Url'i çözümleme işlemi
    function getVariablesFromUrl() {

        const parsed = queryString.parse(location.search);

        if (parsed.from !== undefined) { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
        if (parsed.from !== undefined) { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
        if (parsed.keyword !== undefined) { setSearchKey(parsed.keyword); }
        if (parsed.pgsize !== undefined) { setPageSize(parseInt(parsed.pgsize)); }
        if (parsed.pgindex !== undefined) { setPageIndex(parseInt(parsed.pgindex)); }
        if (parsed.sortingField !== undefined) { sortingField = parsed.sortingField; }
        if (parsed.sortingOrder !== undefined) { sortingOrder = parsed.sortingOrder; }

        let statusGetType = [];
        if (parsed.status !== undefined) {
            if (Array.isArray(parsed.status)) {
                _.each(parsed.status, (item) => {
                    statusGetType.push(item);
                });
            } else { statusGetType.push(parsed.status); }
        }
        setSelectedStatusType(statusGetType);

        let getAddress = [];
        if (parsed.address !== undefined) {
            if (Array.isArray(parsed.address)) {
                _.each(parsed.address, (item) => {
                    getAddress.push(item);
                });
            } else { getAddress.push(parsed.address); }
        }
        setAddress(getAddress);

        let newDealarCode = []

        if (parsed.fic !== undefined) {
            if (Array.isArray(parsed.fic)) {
                _.each(parsed.fic, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.fic) }
        }

        if (parsed.rec !== undefined) {
            if (Array.isArray(parsed.rec)) {
                _.each(parsed.rec, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.rec) }
        }

        if (parsed.dec !== undefined) {
            if (Array.isArray(parsed.dec)) {
                _.each(parsed.dec, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.dec) }
        }
        setSelectedDealerCode(newDealarCode);

        //Bayi kodlarının Tree select özelliğine göre düzenlenmesi.
        let fieldArrObj = [];
        let regionArrObj = [];
        let dealerArrObj = [];

        if (newDealarCode.length === 0) { return setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj) }
        _.filter(newDealarCode, function (item) {
            if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj); }
            else if (item.split("|").length === 2) {
                regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj);
            }
            else {
                dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj);
            }
        });
        onChangeDealerCode(newDealarCode);

        return setOnChange(true);
    }

    //Get Search Data
    function dataSearch(selectedPageIndex, selectedPageSize) {
        const params = new URLSearchParams(location.search);

        params.delete('dec');
        params.delete('rec');
        params.delete('fic');
        params.delete('from')
        params.delete('to');
        params.delete('keyword');
        params.delete('status');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('sortingField');
        params.delete('sortingOrder');
        params.delete('address');

        params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        if (sortingOrder !== undefined) { params.append('sortingOrder', sortingOrder); }
        if (sortingField !== undefined) { params.append('sortingField', sortingField); }
        if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
        if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
        if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }

        _.filter(selectedStatusType, function (item) {
            params.append('status', item); params.toString();
        });

        _.forEach(address, (item) => {
            params.append('address', item); params.toString();
        });

        let createUrl = null;
        if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
        history.push(`${location.pathname}?${createUrl}`);

        return setOnChange(true);
    }

    //Search Button Event
    const searchButton = () => {
        dataSearch();
    };
    //Keyword 'Enter' search
    const keyPress = e => {
        if (e.keyCode === 13) {
            dataSearch();
        }
    }
    //Change DealerCode
    async function onChangeDealerCode(value) {
        let fieldArrObj = [];
        let regionArrObj = [];
        let dealerArrObj = [];
        const params = new URLSearchParams(location.search);
        params.delete('dec');
        params.delete('rec');
        params.delete('fic');
        params.delete('from')
        params.delete('to');
        params.delete('keyword');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('address');

        if (value.length === 0) { setNewUrlParams(''); params.delete('fic'); params.delete('rec'); params.delete('dec'); setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setDealerCodes(dealerArrObj); setSelectedDealerCode([]) }
        else {
            _.filter(value, function (item) {
                if (item.split("|").length === 1) { fieldArrObj.push(item); setFieldCodes(fieldArrObj); params.append('fic', item); params.toString(); }
                else if (item.split("|").length === 2) {
                    regionArrObj.push(item.split("|")[1]); setRegionCodes(regionArrObj); params.append('rec', item); params.toString();
                }
                else {
                    dealerArrObj.push(item.split("|")[2]); setDealerCodes(dealerArrObj); params.append('dec', item); params.toString();
                }
                setSelectedDealerCode(value)
                setNewUrlParams(params.toString());
            });
            if (dealerArrObj.length === 1) { await getAdress(dealerArrObj[0]); }
        }
    };

    //Change from and To date
    function changeTimePicker(value, dateString) {
        setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
    }

    const handleChange = (pagination, filters, sorter) => {
        setState({
            ...tableOptions,
            ["sortedInfo"]: sorter,
            ["filteredInfo"]: filters
        });
        if (sorter !== undefined) {
            if (sorter.order === "descend") {
                sortingOrder = 'DESC';
            } else { sortingOrder = 'ASC'; }

            sortingField = sorter.field;
            dataSearch()
        }
    };

    //Search DailerName Tree Select Component
    function filterTreeNodeDealerCode(value, treeNode) {
        if (value && treeNode && treeNode.title) {
            const filterValue = value.toLocaleLowerCase('tr')
            const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
            return treeNodeTitle.indexOf(filterValue) !== -1;
        }
        return false;
    }

    //Change Status Type
    function statusTypeHandleChange(value) {
        setSelectedStatusType(value);
    }

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

    //Select Component Rol değiştirme 
    function addressHandleChange(value) {
        setAddress(value);
    }

    //Get adress
    async function getAdress(dealerCodes) {
        //Get User Info  
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(siteConfig.api.lookup.getAddresses.replace('{dealerCodes}', dealerCodes), requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                const addressChildren = [];
                _.each(data, (item, i) => {
                    addressChildren.push(<Option key={item.addressCode}>{item.addressCode + '-' + item.addressTitle + '-' + item.address2 + '-' + item.phone}</Option>);
                });
                setLookupAddressChildren(addressChildren)
            })
            .catch();
        return data;
    }
    const edit = (record, deleteAmount = false) => {
        if (deleteAmount) { setQuantity(0); } else {
            setQuantity(record.remainingAmount); setModalVisible(true);
            setEditingKey(record.itemCode);
            setOrderNo(record.orderNo);
        }
    };
    function addDistributionItem(item,selectedItem) {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        if (!distributions) { distributions = [] }
        //Daha önceden kayıt varmı kontrolü
        const index = _.findIndex(distributions, function (i) { return i.itemCode === item.itemCode; });
        if (index > 0) {
            if (selectedItem) { distributions[index].quantity = item.remainingAmount; } else if (selectedItem===false) {
                distributions[index].quantity = 0;
            }
            else {
                distributions[index].quantity = quantity;
            }
        } else {
            distributions.push({
                itemCode: item.itemCode,
                quantity: selectedItem === true ? item.remainingAmount : quantity,
                orderNo: item.orderNo,
            })
        }

        localStorage.setItem('distributions', JSON.stringify(distributions));
        setModalVisible(false);
        setQuantity();
        setEditingKey('');
    }
    function InputNumberOnchange(value) {
        setQuantity(value);
    }
    function handleVisibleChange() {
        setModalVisible(false);
        setEditingKey('');
    }
    async function allAmountOrder(record) {
        await addDistributionItem(record);
    }
    // rowSelection object indicates the need for row selection
    const rowSelection = {

        
        onSelect: (record, selected, selectedRows) => {
            addDistributionItem(record,selected);
        },
        onSelectAll: (record, selected, selectedRows) => {
            // let selectedIds = []
            // if (record) {
            //   _.each(selectedRows, (item) => {
            //     selectedIds.push(item.id);
            //   });
            //   if (selectedRows.length > 0) {
            //     setSelectedItemsId(selectedIds);
            //     selectedTotalCount = selectedIds.length;
            //     setHasSelected(true);
            //   }
            // }
            // else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); }
        }
    };
    let columns = [       
        {
            title: "Durum",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Dağıtım Kodu",
            dataIndex: "distributionId",
            key: "distributionId",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'distributionId' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: "Dağıtım Sipariş Tarihi",
            dataIndex: "distributionOrderDate",
            key: "distributionOrderDate",
            key: "toDate",
            render: (distributionOrderDate) => moment(distributionOrderDate).format(siteConfig.dateFormat),
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'distributionOrderDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
        },
        // {
        //   title: "Adres Kodu",
        //   dataIndex: "addressCode",
        //   key: "addressCode"
        // },
        {
            title: "Adres Açıklama",
            dataIndex: "addressDescription",
            key: "addressDescription",
        },
        {
            title: "Sipariş No",
            dataIndex: "orderNo",
            key: "orderNo",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: "Ürün Kodu",
            dataIndex: "itemCode",
            key: "itemCode",
            sorter: (a, b) => a.itemCode.length - b.itemCode.length,
            sortOrder:
                tableOptions.sortedInfo.columnKey === "itemCode" &&
                tableOptions.sortedInfo.order
        },
        {
            title: "Ürün Açıklaması",
            dataIndex: "itemDescription",
            key: "itemDescription"
        },
        {
            title: "Birim",
            dataIndex: "unit",
            key: "unit",
            width: 50,
        },
        {
            title: "Birim Ağırlık",
            dataIndex: "unitWeight",
            key: "unitWeight",
            align: "right",
            footerKey: 'Genel Toplam',
            render: (unitWeight) => numberFormat(unitWeight),
        },
        {
            title: "Planlanan Ağırlık",
            dataIndex: "palletWeight",
            key: "palletWeight",
            align: "right",
            footerKey: 'palletWeight',
            render: (palletWeight) => numberFormat(palletWeight),
        },
        {
            title: "Planlanan Miktar",
            dataIndex: "plannedAmount",
            key: "plannedAmount",
            render: (plannedAmount) => numberFormat(plannedAmount),
            sorter: (a, b) => a.plannedAmount - b.plannedAmount,
            align: "right",
            sortOrder:
                tableOptions.sortedInfo.columnKey === "plannedAmount" &&
                tableOptions.sortedInfo.order,
            footerKey: "plannedAmount"
        },
        {
            title: "Dağıtılan  Miktar",
            dataIndex: "distributedAmount",
            key: "distributedAmount",
            align: "right",
            render: (distributedAmount) => numberFormat(distributedAmount),
            footerKey: "distributedAmount"
        },
        {
            title: "Kalan  Miktar",
            dataIndex: "remainingAmount",
            key: "remainingAmount",
            align: "right",
            fixed: "right",
            render: (remainingAmount) => numberFormat(remainingAmount),
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'remainingAmount' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            footerKey: "remainingAmount"
        },
        {
            title: 'Giriş Yapılan Miktar',
            dataIndex: 'enteredQuantity',
            editable: true,
            fixed: "right",
            align: 'right',
            key: 'enteredQuantity',
            render: (enteredQuantity, record) => numberFormat(getEnteredQuantity(record.orderNo, record.itemCode))
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
                                        <Button type="primary" onClick={() => addDistributionItem(record)}>Onayla</Button>
                                    </Space>
                                </div>
                            }
                            placement="left"
                            title="Dağıtım Miktarı"
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
                            {/* <a disabled={editingKey !== ''} onClick={() => allAmountOrder(record)}>
                                <i className="ion-ios-fastforward" />
                            </a> */}

                        </Space>
                    );
            },
        },
    ];

    function getEnteredQuantity(orderNo, itemCode,selectItem) {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);

        //Daha önceden kayıt varmı kontrolü
        const item = _.find(distributions, function (i) { return i.itemCode === itemCode && i.orderNo === orderNo; });

        if (item) {
            return item.quantity;
        }
        return 0;
    }
    //Hide order table column
    const token = jwtDecode(localStorage.getItem("id_token"));
    if (token.urole === 'admin') { }
    else if (token.urole === 'fieldmanager') {
        const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Field;
        if (getHideColumns.length > 0) {
            for (let index = 0; index < getHideColumns.length; index++) {
                columns = _.without(columns, _.findWhere(columns, {
                    dataIndex: getHideColumns[index].dataIndex
                }
                ))
            }
        }
    }
    else if (token.urole === 'regionmanager') {
        const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Region;
        if (getHideColumns.length > 0) {
            for (let index = 0; index < getHideColumns.length; index++) {
                columns = _.without(columns, _.findWhere(columns, {
                    dataIndex: getHideColumns[index].dataIndex
                }
                ))
            }
        }
    }
    else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
        const getHideColumns = ColumnOptionsConfig.DistributionTableHideColumns.Dealer;
        if (getHideColumns.length > 0) {
            for (let index = 0; index < getHideColumns.length; index++) {
                columns = _.without(columns, _.findWhere(columns, {
                    dataIndex: getHideColumns[index].dataIndex
                }
                ))
            }
        }
    }

    //Excel Oluştur
    const exportExcelButton = () => {
        postSaveLog(enumerations.LogSource.ReportDistributions, enumerations.LogTypes.Export, logMessage.Reports.Distributions.exportExcel);
        ExcelExport(columns, data, 'Dağıtım Listesi');
    }
    function onChangeRadioButton(e) {
        setSelectedRadioItem(e.target.value);
        setPrivateDate(null);
    }

    //Change Cheques Type
    function privateDateHandleChange(value) {
        setPrivateDate(value);

        if (value === 'SonBirHafta') {
            setFromDate(moment(moment().subtract(7, 'days').toDate()));
            setToDate(moment(new Date()));
        }
        else if (value === 'Bugun') {
            setFromDate(moment(moment().subtract(0, 'days').toDate()));
            setToDate(moment(new Date()));
        }
        else if (value === 'SonUcGun') {
            setFromDate(moment(moment().subtract(3, 'days').toDate()));
            setToDate(moment(new Date()));
        } else if (value === 'SonBirAy') {
            setFromDate(moment(moment().subtract(30, 'days').toDate()));
            setToDate(moment(new Date()));
        }
        else if (value === 'SonUcAy') {
            setFromDate(moment(moment().subtract(90, 'days').toDate()));
            setToDate(moment(new Date()));
        }
        else if (value === 'SonAltiAy') {
            setFromDate(moment(moment().subtract(180, 'days').toDate()));
            setToDate(moment(new Date()));
        }
        else if (value === 'SonBirYil') {
            setFromDate(moment(moment().subtract(366, 'days').toDate()));
            setToDate(moment(new Date()));
        }
    }
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.distributionTitle.header" />}
            </PageHeader>
            <Box>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={view !== 'MobileView' ? 6 : 0} >
                                    <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 6 : 0} >
                                    <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 6 : 0} >
                                    <FormItem label={<IntlMessages id="page.addressTitle" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <TreeSelect
                                    treeData={treeData}
                                    onChange={onChangeDealerCode}
                                    value={selectedDealerCode}
                                    filterTreeNode={filterTreeNodeDealerCode}
                                    treeCheckable={true}
                                    showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                    placeholder={"Bayi Kodu Seçiniz"}
                                    showSearch={true}
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    dropdownMatchSelectWidth={500}
                                />
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Anahtar kelime" value={searchKey} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Select
                                    mode={"multiple"}
                                    style={{ width: '100%' }}
                                    placeholder="Sevk Adresi Seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    value={address}
                                    dropdownMatchSelectWidth={750}
                                    onChange={addressHandleChange}
                                    filterOption={(input, option) =>
                                        option.children.toString().toLocaleLowerCase('tr').indexOf(input.toLocaleLowerCase('tr')) >= 0
                                    }
                                >
                                    {lookupAddressChildren}
                                </Select>
                            </Col>
                        </Row>
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                    <FormItem label={<IntlMessages id="page.statusType" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                    <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Select
                                    mode="multiple"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    placeholder="Durumu Tipi Seçiniz"
                                    onChange={statusTypeHandleChange}
                                    value={selectedStatusType}
                                >
                                    {children}
                                </Select>
                            </Col>

                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Radio.Group onChange={onChangeRadioButton} value={selectedRadioItem} style={view === 'MobileView' ? null : { marginLeft: '-30px' }}>
                                    <Row>
                                        <Col span={2} >
                                            <Radio value={1} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
                                            </Radio>
                                        </Col>
                                        <Col style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
                                            <Select
                                                placeholder="Tarih aralığı seçiniz"
                                                disabled={selectedRadioItem === 1 ? false : true}
                                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                                onChange={privateDateHandleChange}
                                                optionFilterProp="children"
                                                value={privateDate}
                                            >
                                                <Option value="Bugun">Bugün</Option>
                                                <Option value="SonUcGun">Son 3 gün</Option>
                                                <Option value="SonBirHafta">Son 1 Hafta</Option>
                                                <Option value="SonBirAy">Son 1 Ay</Option>
                                                <Option value="SonUcAy">Son 3 Ay</Option>
                                                <Option value="SonAltiAy">Son 6 Ay</Option>
                                                <Option value="SonBirYil">Son 1 Yıl</Option>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={2} >
                                            <Radio value={2} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} size="small">
                                            </Radio>
                                        </Col>
                                        <Col style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '90%' }} size="small">
                                            <RangePicker
                                                disabled={selectedRadioItem === 2 ? false : true}
                                                format={siteConfig.dateFormat}
                                                onChange={changeTimePicker}
                                                defaultValue={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                                value={[moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)]}
                                            />
                                        </Col>
                                    </Row>
                                </Radio.Group>            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
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
                    <Button type="primary" size="small" style={{ marginBottom: '5px' }}
                        icon={<DownloadOutlined />} onClick={exportExcelButton}>
                        {<IntlMessages id="forms.button.exportExcel" />}
                    </Button>
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
                    dataSource={data}
                    onChange={handleChange}
                    loading={loading}
                    pagination={false}
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    scroll={{ x: 'max-content' }}
                    size="medium"
                    bordered={false}
                    rowClassName="editable-row"
                    // rowClassName={(record, index) => (getEnteredQuantity(record.orderNo, record.itemCode) > 0 ? "black" : "initial")}
                    rowSelection={{
                        ...rowSelection,
                    }}
                    summary={() => {
                        return renderFooter(columns, data, false, aggregatesOverall, true)
                    }}
                />
                <ReportPagination
                    onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={pageIndex}
                    position="bottom"
                />
            </Box>
        </LayoutWrapper>
    );
}
