//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import { Table, Row, Col, TreeSelect, Radio, Tag, Dropdown, Menu, Modal, Input, message, Space, Layout, Button } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';
import Popconfirms from '@iso/components/Feedback/Popconfirm';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Style
import { CloseOutlined, SettingOutlined, DownOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';

//Other Library
// import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import logMessage from '@iso/config/logMessage';
import enumerations from "../../config/enumerations";
import 'moment/locale/tr'
import Item from "antd/lib/list/Item";
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

let sortingField;
let sortingOrder;
export default function () {
    document.title = "Talepler - Seramiksan B2B";
    const { Content } = Layout;

    const Option = SelectOption;
    let selectedTotalCount = 0;
    const [searchKey, setSearchKey] = useState('');
    const [tableOptions, setState] = useState({
        sortedInfo: "",
        filteredInfo: ""
    });
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [startingPageIndex, setStartingPageIndex] = useState(1);
    const [fromDate, setFromDate] = useState(moment(moment().subtract(0, 'days').toDate()));
    const [toDate, setToDate] = useState(moment(new Date()));
    const [dealerCodes, setDealerCodes] = useState();
    const [regionCodes, setRegionCodes] = useState();
    const [fieldCodes, setFieldCodes] = useState();
    const [selectedDealerCode, setSelectedDealerCode] = useState();
    const [newUrlParams, setNewUrlParams] = useState('');
    const [selectedRadioItem, setSelectedRadioItem] = useState(1);
    const [privateDate, setPrivateDate] = useState('Bugun');
    const [status, setSelectedStatus] = useState();
    const [address, setAddress] = useState();
    const [lookupAddressChildren, setLookupAddressChildren] = useState();
    const [demandStatus, setDemandStatus] = useState(enumerations.DemandStatus.Pending);
    const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());
    const [selectedItemsId, setSelectedItemsId] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const [hasSelected, setHasSelected] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState();
    const [cancelReason, setCancelReason] = useState();
    const [cancelReasonText, setCancelReasonText] = useState();
    const [visible, setVisible] = useState(false);
    const [acceptInfoVisible, setAcceptInfoVisible] = useState(false);
    const [deleteDemand, setDeleteDemand] = useState(false);
    const [toolbarEditingButton, setToolbarEditingButton] = useState(false);
    const [componentSize, setComponentSize] = useState('default');
    const [demandNo, setDemandNo] = useState();
    const [description, setDescription] = useState();
    const [statusModal, setStatusModal] = useState();
    const [selectedToolbarStatus, setSelectedToolbarStatus] = useState();
    const [eventType, setEventType] = useState();

    const [demandAmountModal, setDemandAmountModal] = useState();
    const [demandUnitModal, setDemandUnitModal] = useState();
    const [demandConfirmLoading, setDemandConfirmLoading] = useState(false);

    const location = useLocation();
    const queryString = require('query-string');
    const history = useHistory();
    const statusChildren = [];

    //Burada ki useEffect'ler page index page size
    useEffect(() => {
        setCurrentPage(pageIndex);
        getVariablesFromUrl();
        const token = jwtDecode(localStorage.getItem("id_token"));
        if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            getAdress(token.dcode);
        }
    }, [pageIndex]);

    let searchUrl = queryString.parse(location.search);
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
        useFetch(`${siteConfig.api.report.postDemandItems}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate !== null ? fromDate.format('YYYY-MM-DD') : null, "to": toDate !== null ? toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address, "siteMode": searchSiteMode }, selectedDemand && selectedDemand.id ? selectedDemand.id : searchUrl);
    //Bayi,Bölge ve Saha kodlarının getirilmesi
    const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

    //Status
    const [statusType] = useFilterData(`${siteConfig.api.lookup.getOrderStatus}`, searchUrl);
    for (let i = 0; i < statusType.length; i++) {
        statusChildren.push(<Option key={statusType[i]}>{statusType[i]}</Option>);
    }

    //Url'i çözümleme işlemi
    function getVariablesFromUrl() {
        //Url değerini alıyoruz.
        const parsed = queryString.parse(location.search);
        const siteMode = getSiteMode();

        //site mode paste url manuel.
        if ((siteMode !== parsed.smode) && (typeof parsed.smode !== 'undefined')) {
            setSiteMode(parsed.smode);
            setSearchSitemode(parsed.smode);
            window.location.reload(false);
        }
        if (typeof parsed.smode !== 'undefined') { setSiteMode(parsed.smode); }
        if (typeof parsed.from !== 'undefined') { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
        if (typeof parsed.from !== 'undefined') { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
        if (typeof parsed.keyword !== 'undefined') { setSearchKey(parsed.keyword); }
        if (typeof parsed.pgsize !== 'undefined') { setPageSize(parseInt(parsed.pgsize)); }
        if (typeof parsed.pgindex !== 'undefined') { setPageIndex(parseInt(parsed.pgindex)); }
        if (typeof parsed.sortingField !== 'undefined') { sortingField = parsed.sortingField; }
        if (typeof parsed.sortingOrder !== 'undefined') { sortingOrder = parsed.sortingOrder; }

        let getStatus = [];
        if (typeof parsed.status !== 'undefined') {
            if (Array.isArray(parsed.status)) {
                _.each(parsed.status, (item) => {
                    getStatus.push(item);
                });
            } else { getStatus.push(parsed.status); }
        }
        setSelectedStatus(getStatus);

        let getAddress = [];
        if (typeof parsed.address !== 'undefined') {
            if (Array.isArray(parsed.address)) {
                _.each(parsed.address, (item) => {
                    getAddress.push(item);
                });
            } else { getAddress.push(parsed.address); }
        }
        setAddress(getAddress);

        let newDealarCode = []
        //Field url data
        if (typeof parsed.fic !== 'undefined') {
            if (Array.isArray(parsed.fic)) {
                _.each(parsed.fic, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.fic) }
        }

        //RegionCode url data
        if (typeof parsed.rec !== 'undefined') {
            if (Array.isArray(parsed.rec)) {
                _.each(parsed.rec, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.rec) }
        }

        //Dealar url data
        if (typeof parsed.dec !== 'undefined') {
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
    //Get Search Data
    function dataSearch(selectedPageIndex, selectedPageSize) {
        const params = new URLSearchParams(location.search);
        const siteMode = getSiteMode();

        params.delete('smode');
        params.delete('dec');
        params.delete('rec');
        params.delete('fic');
        params.delete('address');
        params.delete('from')
        params.delete('to');
        params.delete('keyword');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('sortingField');
        params.delete('sortingOrder');
        params.delete('status');

        if ((fromDate !== '' & toDate !== '') && (fromDate !== null & toDate !== null)) {
            params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
            params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        }

        _.forEach(address, (item) => {
            params.append('address', item); params.toString();
        });

        _.filter(status, function (item) {
            params.append('status', item); params.toString();
        });

        if (typeof sortingOrder !== 'undefined') { params.append('sortingOrder', sortingOrder); }
        if (typeof sortingField !== 'undefined') { params.append('sortingField', sortingField); }
        if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
        if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
        if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
        params.append('smode', siteMode); params.toString();

        let createUrl = null;
        if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
        history.push(`${location.pathname}?${createUrl}`);
        setSearchSitemode(siteMode);

        return setOnChange(true);
    }

    //Search Button Event
    const searchButton = () => {
        dataSearch();
    };

    //Change DealerCode
    async function onChangeDealerCode(value) {
        let fieldArrObj = [];
        let regionArrObj = [];
        let dealerArrObj = [];
        setDealerCodes([]);
        setFieldCodes([]);
        setRegionCodes([]);
        const params = new URLSearchParams(location.search);
        params.delete('smode');
        params.delete('dec');
        params.delete('rec');
        params.delete('fic');
        params.delete('from')
        params.delete('to');
        params.delete('keyword');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('address');
        params.delete('status');

        setLookupAddressChildren([]);
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
        if (value !== null) {
            setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
            setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        }
        else {
            setToDate(null);
            setFromDate(null);
        }
    }

    //Search DailerName Tree Select Component
    function filterTreeNodeDealerCode(value, treeNode) {
        if (value && treeNode && treeNode.title) {
            const filterValue = value.toLocaleLowerCase('tr')
            const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
            return treeNodeTitle.indexOf(filterValue) !== -1;
        }
        return false;
    }

    const handleChange = (pagination, filters, sorter) => {
        setState({
            ...tableOptions,
            ["sortedInfo"]: sorter,
            ["filteredInfo"]: filters
        });
        if (typeof sorter !== 'undefined') {
            if (sorter.order === "descend") {
                sortingOrder = 'DESC';
            } else { sortingOrder = 'ASC'; }

            sortingField = sorter.field;
            dataSearch()
        }
    };

    /**Pagination : Tablo  pageSize'ı değiştirir*/
    function onShowSizeChange(current, pageSize) {
        setPageSize(pageSize);
        setPageIndex(current);
        dataSearch(current, pageSize);
    }

    /**Pagination : Seçili sayfanın saklandığı state'i değiştirir*/
    function currentPageChange(current, pageSize) {
        setPageIndex(current);
        setPageSize(pageSize);
        dataSearch(current, pageSize);
    }

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

    function statusHandleChange(value) {
        setDemandStatus(value);
    }
    function onChangeRadioButton(e) {
        setSelectedRadioItem(e.target.value);
        setPrivateDate(null);
    }
    //Select Component Rol değiştirme 
    function addressHandleChange(value) {
        setAddress(value);
    }
    //Keyword 'Enter' search
    const keyPress = e => {
        if (e.keyCode === 13) {
            dataSearch();
        }
    }
    //Miktar girilen text alanında tüm değerleri seçiyor
    function onSelectAll(id) {
        document.getElementById(id).select();
    }

    function transactionsItemDisabled(item, transactionKey) {
        //Kullanıcı 1 den fazla değer check işlemi yaptığı zaman oluşuyor.
        if(selectedItems.length>1){return true;}
        //İşlem türü gönderilmediği default olarak menü seçenekleri açık oluyor.
        if(typeof transactionKey==='undefined'){return false;}
        if (item !== null) {
            const token = jwtDecode(localStorage.getItem("id_token"));
            const period = item.period;
            //Periyot tarihleri dışında ise düzenlemeler yapılamaz sadece admin yapabilir.
            if ((period.deadline < new Date()) && (token.urole !== 'admin')) { return true; }

            if (token.urole === 'admin') { return false; }
            else if (token.urole === 'fieldmanager') {
                if (item.status === 'Pending') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Cancelled') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
            }
            else if (token.urole === 'regionmanager') {
                if (item.status === 'Pending') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Cancelled') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
            }
            else if (token.urole === 'support') {
                if (item.status === 'Pending') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Cancelled') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }
            }
            else if (token.urole === 'director') {

            }
            else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
                if (item.status === 'Pending') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if(item.status==='Cancelled'){
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if(item.status==='Approved'){
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return false;
                        case 'TalepSil':
                            return true;
                    }
                }             

            }
        }
        return false;
    }
    //Order Detail Columns
    let columns = [
        {
            title: "Durumu",
            dataIndex: "statusText",
            key: "statusText",
            width: 150,
            render: (statusText) => (
                <>
                    {statusText === 'Beklemede' ? (
                        (<Tag color={'blue'} key={statusText}>
                            {statusText}
                        </Tag>)

                    ) : (
                        statusText === 'Onaylandı' ? (
                            (<Tag color={'green'} key={statusText}>
                                {statusText}
                            </Tag>)

                        ) : (
                            <Tag color={'red'} key={statusText}>
                                {statusText}
                            </Tag>))}
                </>
            ),
        },
        {
            title: "Bayi Kodu",
            dataIndex: "dealerCode",
            key: "dealerCode",
            style: { font: { sz: "48", bold: true } },
            width: 100
        },
        {
            title: "Bayi Adı",
            dataIndex: "dealerName",
            key: "dealerName",
            width: 200,
            ellipsis: true

        },
        {
            title: "Sevk Adresi",
            dataIndex: "addressCode",
            key: "addressCode",
            width: 200
        },
        {
            title: "Talep No",
            dataIndex: "demandNo",
            key: "demandNo",
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.orderNo - b.orderNo,
            sortOrder: tableOptions.sortedInfo.columnKey === 'demandNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 150
        },
        {
            title: "Talep Tarihi",
            dataIndex: "date",
            key: "date",
            type: "date",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (date, record) => date,
        },
        {
            title: "Ürün Kodu",
            dataIndex: "itemId",
            key: "itemId",
            width: 150,
        },
        {
            title: "Ürün Açıklaması",
            dataIndex: "itemDescription",
            key: "itemDescription",
            width: 300,
        },
        {
            title: "Miktar",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (amount) => numberFormat(amount),
            width: 120,
        },
        {
            title: '',
            dataIndex: "title",
            key: "title",
            fixed: "right",
            render: (text, record) => (
                <Dropdown disabled={transactionsItemDisabled(record)} overlay={menu(record)} trigger={['hover']} onVisibleChange={event => { setSelectedDemand(record) }} >
                    <Button >
                        {view === 'MobileView' ? <SettingOutlined /> : 'İşlemler'}  <DownOutlined />
                    </Button>
                </Dropdown>
            ),
        }
    ];

    //Hide order table column
    const token = jwtDecode(localStorage.getItem("id_token"));
    if (token.urole === 'admin') { }
    else if (token.urole === 'fieldmanager') {
        const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Field;
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
        const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Region;
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
        const getHideColumns = ColumnOptionsConfig.CustomerRecordTableHideColumns.Dealer;
        if (getHideColumns.length > 0) {
            for (let index = 0; index < getHideColumns.length; index++) {
                columns = _.without(columns, _.findWhere(columns, {
                    dataIndex: getHideColumns[index].dataIndex
                }
                ))
            }
        }
    }
    //Excel Oluşturma
    const exportExcelButton = () => {
        postSaveLog(enumerations.LogSource.ReportAccountTransactions, enumerations.LogTypes.Export, logMessage.Reports.TransactionAccount.exportExcel);
        // ExcelExport(columns, data, 'Sipariş Kalemleri');
    }

    //Sipariş oluşturulması için izin verilenler
    function permissionCheck(status) {
        if ((status === 'Cancelled')) { return true; }
        return false;
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onSelect: (record, selected, selectedRows) => {
            let selectedIds = [];
            let selectedItems=[]
            //Geçici olarak eklendi api sonrası tek bir koşul değişecek.
            if (selectedRows.length > 0) {
                _.each(selectedRows, (item) => {
                    if (typeof item !== 'undefined') {
                        selectedIds.push(item.id);
                        selectedItems.push(item);
                    }
                });
                setSelectedItemsId(selectedIds);
                setSelectedItems(selectedItems);
                selectedTotalCount = selectedIds.length;
                setHasSelected(true);
            }
            else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]);setSelectedItems([]) }


            //Olması gereken şekil api düzenlemesinden sonra değiştirilecek.

            // if (selectedRows.length > 0) {
            //     _.each(selectedRows, (orderNo) => {
            //         if (typeof item !== 'undefined') {
            //             selectedIds.push(orderNo);
            //         }
            //     });
            //     setSelectedItemsId(selectedIds);
            //     selectedTotalCount = selectedIds.length;
            //     setHasSelected(true);
            // }
            // else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); }
        },
        onSelectAll: (record, selected, selectedRows) => {
            let selectedIds = []
            if (record) {
                _.each(selectedRows, (item) => {
                    selectedIds.push(item.id);
                });
                if (selectedRows.length > 0) {
                    setSelectedItemsId(selectedIds);
                    selectedTotalCount = selectedIds.length;
                    setHasSelected(true);
                }
            }
            else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); }
        },
        getCheckboxProps: (record) => ({
            disabled: permissionCheck(record.status), // Column configuration not to be checked
        }),

    };
    //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
    const menu = (item) => (
        <Menu onClick={handleMenuClick}>
            {transactionsItemDisabled(item, "Duzenle") === false ?  <Menu.Item key="Duzenle">Düzenle</Menu.Item> : null}
            {transactionsItemDisabled(item, "SiparisOlustur") === false ?  <Menu.Item key="SiparisOlustur">Sipariş Oluştur</Menu.Item> : null}
            {transactionsItemDisabled(item, "TalepSil") === false ?  <Menu.Item key="TalepSil">Talep Sil</Menu.Item> : null }
        </Menu>
    );

    //Menü Secimlerine Göre Modal açma işlemleri
    //2 Adet Modal bulunmaktadır.
    function handleMenuClick(value) {
        setModalEditingDemand(selectedDemand);
        switch (value.key) {
            case 'Duzenle':
                setVisible(true);
                break;
            case '2':
                createOrder();
                //Sipariş başarılı bir şekilde oluşturulduysa ekranı kapat
                break;
            case '3':
                // setDeleteUserVisible(true);
                break;
            default:
                break;
        }
    }

    //Component Size
    const onFormLayoutChange = ({ size }) => {
        setComponentSize(size);
    };

    //Kullanıcı düznleme modalına verileri gönderme işlemi Burada veriler state atılıyor ve modal aktif hale getirliyor.
    async function setModalEditingDemand(record) {
        setDemandNo(record.orderNo);
        setDemandAmountModal(record.amount);
        setDemandUnitModal(record.unit);
        setStatusModal(record.status);
    };

    //Talep kaydetme işlemi
    async function postSaveDemand(query) {
        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const dealerCode = token.dcode;
        setDemandConfirmLoading(true);
        const reqBody = query;
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        await fetch(siteConfig.api.report.postDemands, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (typeof data !== 'undefined') {
                    if (data.isSuccessful === false) {
                        const getMessage = data.message;
                        message.warning({ content: 'kaydetme işlemi başarısızdır. ', duration: 2 });
                    } else {
                        message.success({ content: 'başarıyla kaydedildi', duration: 2 });
                    }
                }
            })
            .catch();
        setDemandConfirmLoading(false);
        if (data.isSuccessful === false) { return false; }
        else { return true; }
    }

    //Talep düzenleme işlemi
    async function postEditingDemand(demandId, reqBody, messageText) {
        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const dealerCode = token.dcode;
        setDemandConfirmLoading(true);
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        let newSaveOrderUrl = siteConfig.api.report.postDemandUpdate.replace('{demandId}', demandId);
        await fetch(`${newSaveOrderUrl}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (typeof data !== 'undefined') {
                    if (data.isSuccessful === false) {
                        message.warning({ content: messageText + ' işlemi başarısızdır. ', duration: 2 });
                    } else if (data.status === 400) {
                        message.warning({ content: messageText + ' işlemi başarısızdır. ', duration: 2 });
                    }
                    else {
                        message.success({ content: messageText + ' başarıyla güncellendi. ', duration: 2 });
                        setVisible(false);
                        setOnChange(true);
                        setSelectedDemand();
                        setSelectedItemsId();
                    }
                }
            })
            .catch();
        setDemandConfirmLoading(false);
        if (data.isSuccessful === false) { return false; }
        else { return true; }
    }
    //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
    function handleCancel() {
        setDemandNo();
        setDemandAmountModal();
        setStatusModal();
        setVisible(false);
        setAcceptInfoVisible(false);
        setToolbarEditingButton(false);
        setDeleteDemand(false);
    };

    //Talebin Düzenleme kayıt işlemi
    async function handleOk() {
        //Secilen talep durum tipine göre kaydetme kontrolü
        if (!statusModal) { return message.error('Talep Durum seçiniz'); }
        switch (statusModal) {
            case 'Approved':
                acceptDemand();
                break;
            case 'Cancelled':
                cancelDemand();
                break;
            case 'Pending':
                pendingDemand();
                break;
        }
    }

    //Kabul edilen talep işlemleri
    async function acceptDemand() {
        if (!demandAmountModal) { return message.error('Miktar giriniz'); }
        if (selectedDemand) {
            const amount = parseFloat(demandAmountModal);
            postEditingDemand(selectedDemand.id, { "approvedAmount": amount, "newStatus": statusModal }, 'Onaylama');
        }

    }

    //İptal edilen talep işlemleri
    async function cancelDemand() {
        if ((!selectedDemand) || (!cancelReason)) { return message.error('İptal durumu seçiniz'); }
        postEditingDemand(selectedDemand.id, { "newStatus": statusModal, "cancelReason": cancelReason, "cancelReasonDescription": cancelReasonText }, 'İptal işlemi');
    }

    //Bekleme konumuna geri alma
    async function pendingDemand() {
        if (selectedDemand) {
            const amount = parseFloat(demandAmountModal);
            postEditingDemand(selectedDemand.id, { "newStatus": statusModal }, 'Bekleme'); //Bekleme durumuna almak
        }
    }
    async function createOrder() {
        //Sipariş oluşturma işlemi
        //Sipariş başarılı bir şekilde oluşturulduysa popup pencerisini kapat
    }

    //Seçilenleri sipariş oluşturma işlemi
    async function multiplePostNotificationIsRead() {
        setAcceptInfoVisible(true);
        _.each(selectedItemsId, (item) => {
            debugger
            //   postNotificationIsread(item, true);
        });
    }

    function demandStatusChangeModal(value) {
        setStatusModal(value);
    }
    //Seçilenleri talepleri işlemi
    async function multipleDemandDelete() {
        setDeleteDemand(true);
        _.each(selectedItemsId, (item) => {
            //   postNotificationIsread(item, true);
        });
    }

    //Kural açıklaması değiştirme
    function handleDescription(e) {
        setDescription(e.target.value);
    }

    // '.' at the end or only '-' in the input box.   
    function onChangeAmount(e) {
        const { value } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            setDemandAmountModal(value);
        }
    };

    function demandCancelOrRejection() {
        debugger
        let control=false;
        let status;
        _.each(selectedItems, (item) => {
            if(item.status==='Approved'){return control=true;}
            else{status=item.status;}
        });
        if (control === true) { return message.warning('Onaylananlar düzenleme işlemi yapılamaz.') }
        else { setToolbarEditingButton(true); setVisible(true); setSelectedToolbarStatus(status);setEventType('Toolbar') }
    }

    function demandEditingModalPermissions(item, type, eventType) {

        const token = jwtDecode(localStorage.getItem("id_token"));
        if (eventType === 'Toolbar') {
            if (token.urole === 'admin') { return false; }
            else if (token.urole === 'fieldmanager') {
            }
            else if (token.urole === 'regionmanager') {
            }
            else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
                if (selectedToolbarStatus === 'Pending') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return false;
                    }
                }
                else if (selectedToolbarStatus === 'Cancelled') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return true;
                    }
                }
                else if (selectedToolbarStatus === 'Approved') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return false;
                    }
                }
            }
        }
        else {
            if ((type !== null) && (typeof item !== 'undefined')) {
                if (token.urole === 'admin') { return false; }
                else if (token.urole === 'fieldmanager') {
                }
                else if (token.urole === 'regionmanager') {
                }
                else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
                    if (item.status === 'Pending') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return false;
                        }
                    }
                    else if (item.status === 'Cancelled') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return true;
                        }
                    }
                    else if (item.status === 'Approved') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return false;
                        }
                    }


                }
            }
        }
    }
    
    function toolbarPermissions(item, type, eventType) {

        const token = jwtDecode(localStorage.getItem("id_token"));
        if (eventType === 'Toolbar') {
            if (token.urole === 'admin') { return false; }
            else if (token.urole === 'fieldmanager') {
            }
            else if (token.urole === 'regionmanager') {
            }
            else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
                if (selectedToolbarStatus === 'Pending') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return false;
                    }
                }
                else if (selectedToolbarStatus === 'Cancelled') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return true;
                    }
                }
                else if (selectedToolbarStatus === 'Approved') {
                    switch (type) {
                        case 'Approved':
                            return true;
                        case 'Cancelled':
                            return false;
                        case 'Pending':
                            return false;
                    }
                }
            }
        }
        else {
            if ((type !== null) && (typeof item !== 'undefined')) {
                if (token.urole === 'admin') { return false; }
                else if (token.urole === 'fieldmanager') {
                }
                else if (token.urole === 'regionmanager') {
                }
                else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
                    if (item.status === 'Pending') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return false;
                        }
                    }
                    else if (item.status === 'Cancelled') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return true;
                        }
                    }
                    else if (item.status === 'Approved') {
                        switch (type) {
                            case 'Approved':
                                return true;
                            case 'Cancelled':
                                return false;
                            case 'Pending':
                                return false;
                        }
                    }


                }
            }
        }
    }
    //Talep cancel durumları seçimi
    const onChangeRadioCancelButton = e => {
        setCancelReason(e.target.value);
    }
    //
    function deadlineControl(item) {
        let disabled = false;
        if (item && item.deadline < new Date()) { return disabled = true; }
        return disabled;
    }

    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.demands.header" />}
            </PageHeader>
            <Box>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={6}>
                                    <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
                                </Col>
                                <Col span={6} >
                                    <FormItem label={<IntlMessages id="page.status" />}></FormItem>
                                </Col>
                                <Col span={6} >
                                    <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <TreeSelect
                                    treeData={treeData}
                                    value={selectedDealerCode}
                                    onChange={onChangeDealerCode}
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
                                <Select
                                    placeholder="Sevk durumu seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    onChange={statusHandleChange}
                                    optionFilterProp="children"
                                    value={demandStatus}
                                >
                                    <Option value="Pending">Bekleyenler</Option>
                                    <Option value="Approved">Onaylananlar</Option>
                                    <Option value="Cancelled">İptal Edilenler</Option>
                                </Select>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Ürün Adı, Talep No ... giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />

                            </Col>
                        </Row>
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} >
                                <FormItem label={<IntlMessages id="page.addressTitle" />}></FormItem>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} >
                                <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                            </Col>
                        </Row>
                        <Row>
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
                                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                                value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
                                            />
                                        </Col>
                                    </Row>
                                </Radio.Group>
                            </Col>

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
            <Box>
                {hasSelected ?
                    <Col span={8} offset={16} align="right" >
                        <Button style={{ paddingLeft: '10px' }} onClick={() => (multiplePostNotificationIsRead())}>
                            <CheckOutlined />
                        </Button>
                        <Popconfirms
                            visible={acceptInfoVisible}
                            title="Seçilen talepler arasında onaylanmayanlar var otomatik olarak onaylamak istiyor musunuz？"
                            okText="Evet"
                            cancelText="Hayır"
                            placement="topRight"
                            onCancel={handleCancel}

                        // onConfirm={productItemOrder}
                        >
                            <a className="deleteBtn" >
                                {/* <i className="ion-android-delete" onClick={() => edit(record, true)} /> */}
                            </a>
                        </Popconfirms>
                        <Button onClick={event => demandCancelOrRejection(event)}>
                            <EditOutlined />
                        </Button>
                        <Button disabled={true} onClick={() => (multipleDemandDelete())}>
                            <CloseOutlined />
                        </Button>
                        <Popconfirms
                            visible={deleteDemand}
                            title="Seçilen talepler silmek istiyor musunuz？"
                            okText="Evet"
                            cancelText="Hayır"
                            placement="topRight"
                            onCancel={handleCancel}

                        // onConfirm={productItemOrder}
                        >
                            <a className="deleteBtn" >
                                {/* <i className="ion-android-delete" onClick={() => edit(record, true)} /> */}
                            </a>
                        </Popconfirms>
                        {/* {selectedTotalCount} Öğe seçildi */}
                    </Col> : ''
                }
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
                    // scroll={{ x: 'calc(700px + 50%)' }}
                    scroll={{ x: 'max-content' }}
                    size="medium"
                    bordered={false}

                    summary={() => {
                        return renderFooter(columns, data, false, aggregatesOverall, true)
                    }}
                    rowSelection={{
                        ...rowSelection
                    }}
                    rowClassName={(record, index) => (record.isRead === true ? 'table-background-color-notification-isUnRead' : "table-background-color-notification-isUnRead")}
                //   onRow={(record) => ({
                //     onClick: () => (selectedNotification(record))
                //   })}
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
            <Modal
                visible={visible}
                title={typeof demandNo === 'undefined' ? 'Talep Düzenle' : demandNo}
                onOk={handleOk}
                onCancel={handleCancel}
                maskClosable={false}
                width={800}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        İptal
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleOk}
                    >
                        Kaydet
                    </Button>
                ]}
            >
                <Form
                    labelCol={{
                        span: 4,
                    }}
                    wrapperCol={{
                        span: 14,
                    }}
                    layout="horizontal"
                    initialValues={{
                        size: componentSize,
                    }}
                    onValuesChange={onFormLayoutChange}
                    size={componentSize}
                >
                    {/* <Form.Item label="Kullanıcı adı"> */}
                    {/* <Input value={username} onChange={event => setUsername(event.target.value)} /> */}
                    {/* </Form.Item> */}

                    <Form.Item label="Talep Durumu" >
                        <Select
                            placeholder="Talep durumu seçiniz"
                            style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                            onChange={demandStatusChangeModal}
                            optionFilterProp="children"
                            value={statusModal}
                        >
                            {demandEditingModalPermissions(selectedDemand,'Approved',eventType)===false ? <Option value="Approved">Kabul</Option> :null}
                            {demandEditingModalPermissions(selectedDemand,'Cancelled',eventType)===false ? <Option value="Cancelled">İptal</Option> : null}
                            {demandEditingModalPermissions(selectedDemand,'Pending',eventType)===false ?<Option value="Pending">Beklemede</Option>: null }
                        </Select>
                    </Form.Item>
                    {demandEditingModalPermissions('Amount') === true ?
                        <Form.Item label="Miktar" >
                            <Input id="amount" value={demandAmountModal} onClick={event => onSelectAll('amount')}
                                onChange={event => onChangeAmount(event)} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} />
                            <span style={{ paddingLeft: '5px' }}>{demandUnitModal}</span>
                        </Form.Item> : null}

                    {statusModal === 'Cancelled' ?
                        <Form.Item label="İptal Nedeni">
                            <Radio.Group onChange={onChangeRadioCancelButton} value={cancelReason} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}  >
                                <Space direction="vertical">
                                    <Radio style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={enumerations.cancelReason.InsufficientTotalDemand}>Yetersiz toplam talep</Radio>
                                    <Radio style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={enumerations.cancelReason.DealerRequest}>Bayi isteği</Radio>
                                    <Radio style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={enumerations.cancelReason.None}>Hiçbiri</Radio>
                                </Space>
                            </Radio.Group></Form.Item> : null}

                    <Form.Item label="Açıklama" >
                        <TextArea onChange={event => handleDescription(event)} value={description} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '830px' : '100%' }} />
                    </Form.Item>
                </Form>

            </Modal>
        </LayoutWrapper>
    );
}
