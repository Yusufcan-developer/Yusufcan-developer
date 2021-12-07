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
import { Table, Row, Col, TreeSelect, Radio, Tag, Dropdown, Menu, Modal, Input, message, Layout, Button, Spin } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';
import Popconfirms from '@iso/components/Feedback/Popconfirm';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterProductCategories } from "@iso/lib/hooks/fetchData/useFilterProductCategories";
import { usePostFilter } from "@iso/lib/hooks/fetchData/usePostFilterData";

//Style
import { SettingOutlined, DownOutlined, CheckOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';

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
import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import logMessage from '@iso/config/logMessage';
import enumerations from "../../config/enumerations";
import 'moment/locale/tr'
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
let getSelectedKey = [];

let sortingField;
let sortingOrder;
export default function () {
    document.title = "Talepler - Seramiksan B2B";
    const { Content } = Layout;

    const Option = SelectOption;
    let selectedTotalCount = 0;
    const [searchKey, setSearchKey] = useState('');
    const [amount, setAmount] = useState(0);
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
    const [address, setAddress] = useState();
    const [lookupAddressChildren, setLookupAddressChildren] = useState();
    const [demandStatus, setDemandStatus] = useState(enumerations.DemandStatus.Pending);
    const [selectedProductCategory, setSelectedProductCategory] = useState();
    const [selectedProductSeries, setSelectedProductSeries] = useState();
    const [selectedDimensions, setSelectedDimensions] = useState();
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
    const [onlyActive, setOnlyActive] = useState();
    const [selectedToolbarStatus, setSelectedToolbarStatus] = useState();
    const [eventType, setEventType] = useState();

    const [demandAmountModal, setDemandAmountModal] = useState();
    const [demandUnitModal, setDemandUnitModal] = useState();
    const [demandConfirmLoading, setDemandConfirmLoading] = useState(false);
    const [demandToOrderConfirmLoading, setDemandToOrderConfirmLoading] = useState(false);
    const [clearTableChecked, setClearTableChecked] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [failedDemandsNo, setFailedDemandsNo] = useState();
    const [failedDemandsShowPopup, setFailedDemandsShowPopup] = useState(false);
    const location = useLocation();
    const queryString = require('query-string');
    const history = useHistory();
    const statusChildren = [];
    const searchStatusChildren = [];
    const cancelReasonChildren = [];
    const warningDemandId = [];
    const resultMultipleCount = [];
    const productCategory = [];
    const productSeriesChildren = [];
    const productDimensionsChildren = [];
    const style = {
        height: 40,
        width: 40,
        lineHeight: '40px',
        borderRadius: 4,
        backgroundColor: '#1088e9',
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
    };
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
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall, code, name, setOnRefreshMode] =
        useFetch(`${siteConfig.api.report.postDemandItems}`, { "quota": parseFloat(amount), "productCategories": selectedProductCategory, "productDimensions": selectedDimensions, "productSeries": selectedProductSeries, "DealerCodes": dealerCodes, "status": demandStatus, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": typeof onlyActive !== 'undefined' ? undefined : fromDate !== null ? fromDate.format('YYYY-MM-DD') : null, "to": typeof onlyActive !== 'undefined' ? undefined : toDate !== null ? toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address, "siteMode": searchSiteMode, "onlyActive": typeof onlyActive !== 'undefined' ? true : undefined }, searchUrl);

    //Bayi,Bölge ve Saha kodlarının getirilmesi
    const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}`, searchUrl);

    //Status
    const [statusType] = useFilterData(`${siteConfig.api.lookup.getDemandStatus}`, searchUrl);
    for (let i = 0; i < statusType.length; i++) {
        statusChildren.push(<Option disabled={demandEditingModalPermissions(statusType[i].Key)} key={statusType[i].Key}>{statusType[i].Value}</Option>);
    }

    //Search status items
    const [searchStatusType] = useFilterData(`${siteConfig.api.lookup.getDemandStatus}`, searchUrl);
    for (let i = 0; i < searchStatusType.length; i++) {
        searchStatusChildren.push(<Option key={searchStatusType[i].Key}>{searchStatusType[i].Value}</Option>);
    }

    //İptal Nedenleri
    const [cancelReasonType] = useFilterData(`${siteConfig.api.lookup.cancelReason}`, searchUrl);
    for (let i = 0; i < cancelReasonType.length; i++) {
        cancelReasonChildren.push(<Option key={cancelReasonType[i].Key}>{cancelReasonType[i].Value}</Option>);
    }

    //Get Category
    const [productCategories] = useFilterProductCategories(`${siteConfig.api.lookup.postProductCategories}`, {});
    for (let i = 0; i < productCategories.length; i++) {
        productCategory.push(<Option key={productCategories[i]}>{productCategories[i]}</Option>);
    }

    //Post Series
    const [serieData, loadingSerieFilter, setOnChangeSerieFilter] = usePostFilter(`${siteConfig.api.lookup.postSeries}`, { "categories": selectedProductCategory, "siteMode": "Admin" });
    for (let i = 0; i < serieData.length; i++) {
        productSeriesChildren.push(<Option key={serieData[i]}>{serieData[i]}</Option>);
    }

    //Post Dimension
    const [dimensionData, loadingDimensionsFilter, setOnChangeDimensionsFilter] = usePostFilter(`${siteConfig.api.lookup.postDimensions}`, { "categories": selectedProductCategory, "siteMode": "Admin" });
    for (let i = 0; i < dimensionData.length; i++) {
        productDimensionsChildren.push(<Option key={dimensionData[i]}>{dimensionData[i]}</Option>);
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
        //Category get url data
        if (typeof parsed.pg !== 'undefined') {
            if (Array.isArray(parsed.pg)) {
                setSelectedProductCategory([parsed.pg]);
                setOnChangeDimensionsFilter(true); setOnChangeSerieFilter(true);
            } else { setSelectedProductCategory([parsed.pg]); setOnChangeDimensionsFilter(true); setOnChangeSerieFilter(true); }
        }
        if (typeof parsed.onlyActive !== 'undefined') { setOnlyActive(parsed.onlyActive); }
        if (typeof parsed.smode !== 'undefined') { setSiteMode(parsed.smode); }
        if (typeof parsed.from !== 'undefined') { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
        if (typeof parsed.from !== 'undefined') { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
        if (typeof parsed.keyword !== 'undefined') { setSearchKey(parsed.keyword); }
        if (typeof parsed.pgsize !== 'undefined') { setPageSize(parseInt(parsed.pgsize)); }
        if (typeof parsed.pgindex !== 'undefined') { setPageIndex(parseInt(parsed.pgindex)); }
        if (typeof parsed.sortingField !== 'undefined') { sortingField = parsed.sortingField; }
        if (typeof parsed.sortingOrder !== 'undefined') { sortingOrder = parsed.sortingOrder; }
        if (typeof parsed.amount !== 'undefined') { setAmount(parsed.amount); }
        let getStatus = [];
        if (typeof parsed.status !== 'undefined') {
            if (Array.isArray(parsed.status)) {
                _.each(parsed.status, (item) => {
                    getStatus.push(item);
                });
            } else { getStatus.push(parsed.status); }
        }
        setDemandStatus(getStatus);

        let getAddress = [];
        if (typeof parsed.address !== 'undefined') {
            if (Array.isArray(parsed.address)) {
                _.each(parsed.address, (item) => {
                    getAddress.push(item);
                });
            } else { getAddress.push(parsed.address); }
        }
        setAddress(getAddress);


        //Dimension get url data
        if (typeof parsed.dm !== 'undefined') {
            let dimensionNewArray
            if (parsed.dm)
                if (Array.isArray(parsed.dm)) {
                    dimensionNewArray = _.map(parsed.dm.map(e => e === 'null' || e === '' ? null : e));
                } else {
                    dimensionNewArray = _.map([parsed.dm].map(e => e === 'null' || e === '' ? null : e));
                }
            const nullOrBlankData = _.filter(dimensionNewArray, function (Item) {
                if (Item === null || Item === '') {
                    return true;
                }
            });
            if (nullOrBlankData.length > 0) { dimensionNewArray.push(''); }

            setSelectedDimensions(dimensionNewArray);
        }

        //Serie get url data
        if (typeof parsed.se !== 'undefined') {
            let seriesNewArray
            if (parsed.se)
                if (Array.isArray(parsed.se)) {
                    seriesNewArray = _.map(parsed.se.map(e => e === 'null' || e === '' ? null : e));
                } else {
                    seriesNewArray = _.map([parsed.se].map(e => e === 'null' || e === '' ? null : e));
                }
            const nullOrBlankData = _.filter(seriesNewArray, function (Item) {
                if (Item === null || Item === '') {
                    return true;
                }
            });
            if (nullOrBlankData.length > 0) { seriesNewArray.push(''); }
            setSelectedProductSeries(seriesNewArray);
        }

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
        if ((amount > 0) && (demandStatus.length > 1) && (demandStatus[0] !== 'Pending')) {
            message.warning('Lütfen durum alanını değiştiriniz. Miktar girişi yaptıysanız sadece durumu beklemede olarak seçiniz...');
            return;
        }
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
        params.delete('pg');
        params.delete('dm');
        params.delete('se');
        params.delete('status');
        params.delete('amount');
        params.delete('onlyActive');
        setOnlyActive();
        if ((fromDate !== '' & toDate !== '') && (fromDate !== null & toDate !== null)) {
            params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
            params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        }
        if (selectedDimensions && selectedDimensions.length > 0) {
            selectedDimensions.forEach(item => {
                if (item === siteConfig.nullOrEmptySearchItem) { params.append('dm', null); }
                else {
                    params.append('dm', item);
                    params.toString();
                }
            })
        }

        _.forEach(address, (item) => {
            params.append('address', item); params.toString();
        });

        _.filter(demandStatus, function (item) {
            params.append('status', item); params.toString();
        });

        _.filter(selectedProductCategory, function (item) {
            params.append('pg', item); params.toString();
        });

        _.filter(selectedProductSeries, function (item) {
            params.append('se', item); params.toString();
        });
        if (typeof sortingOrder !== 'undefined') { params.append('sortingOrder', sortingOrder); }
        if (typeof sortingField !== 'undefined') { params.append('sortingField', sortingField); }
        if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
        if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
        if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }
        if (amount > 0) { params.append('amount', amount); params.toString(); }
        params.append('smode', siteMode); params.toString();

        let createUrl = null;
        if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
        history.push(`${location.pathname}?${createUrl}`);
        setSearchSitemode(siteMode);
        setSelectedRowKeys([]);

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

    //Table handle change
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

    //Dates handle change
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

    //Product Dimension handle change
    function productDimensionsHandleChange(value) {
        setSelectedDimensions(value);
    }

    //Product Series handle change
    function productSeriesHandleChange(value) {
        setSelectedProductSeries(value);
    }

    //Product Group handle change
    function productGroupHandleChange(value) {
        if (typeof value !== 'undefined') { setSelectedProductCategory([value]); } else { setSelectedProductCategory(); }
        setOnChangeSerieFilter(true);
        setOnChangeDimensionsFilter(true);
    }

    //Status handle change
    function statusHandleChange(value) {
        setDemandStatus(value);
    }

    //Dates radio button handle change
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
        if (selectedItems.length > 0) { return true; }
        //İşlem türü gönderilmediği default olarak menü seçenekleri açık oluyor.
        if (typeof transactionKey === 'undefined') { return false; }
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
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Rejected') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
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
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Rejected') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
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
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Rejected') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return false;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            return true;
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
                else if (item.status === 'Cancelled') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Approved') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return false;
                        case 'SiparisOlustur':
                            if (typeof item.orderNo === 'undefined') { return false; }
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }
                else if (item.status === 'Rejected') {
                    switch (transactionKey) {
                        case 'Duzenle':
                            return true;
                        case 'SiparisOlustur':
                            return true;
                        case 'TalepSil':
                            return true;
                    }
                }

            }
        }
        return false;
    }

    //Kullanıcı yetkisine göre talep durumlarının seçme durumları
    function permissionCheck(status, item) {
        const token = jwtDecode(localStorage.getItem("id_token"));
        if (token.urole === 'admin') { return false; }
        else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            if ((status === 'Cancelled') || (status === 'Rejected') || (status === 'Approved') && (typeof item.orderNo !== 'undefined')) { return true; }
            return false;
        }
    }

    //checklenen değerler
    function getSelected() {
        if (selectedRowKeys.length > 0) {
            return selectedRowKeys
        }
        else {
            _.each(selectedItems, (item) => {
                if (data[0].id !== data[0].id) {
                    getSelected = [];
                    const index = _.findIndex(data, function (i) { return i.id === item.id });
                    if (index > -1) {
                        getSelectedKey.push(index);
                    }
                }

            });
        }
        return getSelectedKey;
    }

    //Tek tek işaretlenen checklerin temizlenmesi
    function clearItemChecked(record, selected) {
        let newKeyArr = [];
        _.each(selectedRowKeys, (index) => {
            if (index === record.key && selected === false) { }
            else {
                newKeyArr.push(index);
            }
        });
        _.each(getSelectedKey, (i) => {
            newKeyArr.push(i);
        });
        getSelectedKey = [];
        if ((selected === true) || (typeof selected === 'undefined')) {
            newKeyArr.push(record.key);
        }
        else {
            newKeyArr = _.without(newKeyArr, record.key);
        }
        setSelectedRowKeys(newKeyArr);
    }

    function clearItemsChecked(record, selectedRows) {
        //Seçilen veya miktar girilen alanların checklenmesi veya kaldırılması.
        let newKeyArr = [];
        let getSelectedKey = selectedRowKeys;

        _.each(selectedRows, (index) => {
            if ((record === true) || (typeof record === 'undefined')) {
                newKeyArr.push(index.key);
            }
            else {
                getSelectedKey = _.without(getSelectedKey, index.key);
            }
        });
        _.each(getSelectedKey, (index) => {
            newKeyArr.push(index);
        });

        if (record === false) { setSelectedRowKeys(getSelectedKey); }
        else {
            setSelectedRowKeys(newKeyArr);
        }
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        selectedRowKeys: getSelected(),
        onSelect: (record, selected, selectedRows) => {
            let selectedIds = [];
            let selectedItems = []
            //Geçici olarak eklendi api sonrası tek bir koşul değişecek.
            if (selectedRows.length > 0) {
                _.each(selectedRows, (item) => {
                    if (typeof item !== 'undefined') {
                        selectedIds.push(item.id);
                        selectedItems.push(item);
                    }
                });

                clearItemChecked(record, selected);
                setSelectedItemsId(selectedIds);
                setSelectedItems(selectedItems);
                selectedTotalCount = selectedIds.length;
                setSelectedDemand(selectedRows[0]);
                setHasSelected(true);

            }
            else { setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); setSelectedItems([]); setSelectedRowKeys([]) }

        },
        onSelectAll: (record, selected, selectedRows) => {
            let selectedItems = []
            let selectedIds = []

            if (record) {
                _.each(selectedRows, (item) => {
                    selectedIds.push(item.id);
                    selectedItems.push(item);

                });
                setSelectedDemand(selectedRows[0]);
                clearItemsChecked(record, selectedRows);
                if (selectedRows.length > 0) {
                    setSelectedItemsId(selectedIds);
                    setSelectedItems(selectedItems);
                    selectedTotalCount = selectedIds.length;
                    setHasSelected(true);
                }

            }
            else {
                setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); setSelectedItems([]); clearItemsChecked(record, selectedRows);
            }
        },
        getCheckboxProps: (record) => ({
            disabled: permissionCheck(record.status, record), // Column configuration not to be checked
        }),

    };

    //Table üzerinde bulunan işlemler menüsü (Düzenle,Yeni parola,Sil)
    const menu = (item) => (
        <Menu onClick={_.debounce (e => {handleMenuClick(e)  }, 1000)} loading={demandToOrderConfirmLoading}>
            {transactionsItemDisabled(item, "Duzenle") === false ? <Menu.Item key="Duzenle">Düzenle</Menu.Item> : null}
            {transactionsItemDisabled(item, "SiparisOlustur") === false ? <Menu.Item key="SiparisOlustur">Sipariş Oluştur</Menu.Item> : null}
            {/* {transactionsItemDisabled(item, "TalepSil") === false ? <Menu.Item key="TalepSil">Talep Sil</Menu.Item> : null} */}
        </Menu>
    );

    //Menü Secimlerine Göre Modal açma işlemleri
    //2 Adet Modal bulunmaktadır.
    function handleMenuClick(value) {
        setModalEditingDemand(selectedDemand);
        switch (value.key) {
            case 'Duzenle':
                demandEditing();
                break;
            case 'SiparisOlustur':
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
        setDemandAmountModal(typeof record.approvedAmount !== 'undefined' ? record.approvedAmount : record.amount);
        setDemandUnitModal(record.unit);
        setStatusModal(record.status);
    };

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
                        message.warning({ content: messageText + ' işlemi başarısızdır. ' + data.message, duration: 2 });
                        postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Update, demandId + ' ID ye sahip Talebin ' + logMessage.Demand.updateError + 'Sebebi ' + data.message);

                    } else if (data.status === 400) {
                        message.warning({ content: messageText + ' işlemi başarısızdır. ' + data.message, duration: 2 });
                        postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Update, demandId + ' ID ye sahip Talebin ' + logMessage.Demand.updateError + 'Sebebi ' + data.message);
                    }
                    else {
                        //Tekli aktarımlar için
                        if (selectedItems.length < 1) {
                            message.success({ content: messageText + ' başarıyla güncellendi. ', duration: 2 });
                            postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Update, demandId + ' ID ye sahip ' + logMessage.Demand.updateSuccess + 'Yeni durumu ' + messageText);
                            setVisible(false);
                            setOnRefreshMode(true);
                            setSelectedDemand();
                            setSelectedItemsId();
                        }
                    }
                }
            })
            .catch();
        setDemandConfirmLoading(false);
        if (data.isSuccessful === false) { return false; }
        else { return true; }
    }

    //Talep düzenleme çoklu işlem
    async function postEditingMultipleDemand(demandId, reqBody, messageText) {
        const token = jwtDecode(localStorage.getItem("id_token"));

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
                resultMultipleCount.push(demandId);
                if (typeof data !== 'undefined') {
                    if (data.isSuccessful === false) {
                        message.warning({ content: messageText + ' işlemi başarısızdır. ', duration: 2 });
                        warningDemandId.push(demandId);
                    } else if (data.status === 400) {
                        message.warning({ content: messageText + ' işlemi başarısızdır. ', duration: 2 });
                        warningDemandId.push(demandId);
                    }
                    else {
                        //islem başarılıdır

                    }
                }
            })
            .catch();
        if ((warningDemandId.length < 1) && (resultMultipleCount.length === selectedItems.length)) {
            message.success('Talepler başarıyla ' + messageText);
            setOnRefreshMode(true);
            setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); setSelectedItems([])
            setVisible(false);
            setSelectedDemand();
            setSelectedItemsId();
            setDemandConfirmLoading(false);
            setSelectedRowKeys([]);
            handleCancel();
        }
        else {
            //Başarısız kayıtlar vardır
            //message.success({ content: messageText + ' başarıyla güncellendi. ', duration: 2 });

        }
    }

    //Kabul edilen talep işlemleri
    async function acceptDemand() {
        if ((!demandAmountModal) && (selectedItems.length < 1)) { return message.error('Miktar giriniz'); }

        //Çoklu Onaylama
        if (selectedItems.length > 0) {
            setClearTableChecked(true);
            setDemandConfirmLoading(true);
            _.each(selectedItems, (item) => {
                postEditingMultipleDemand(item.id, { "approvedAmount": item.amount, "newStatus": statusModal }, 'Onaylama');
            });
        }

        //Tekli Onaylama
        else {
            if (selectedDemand)
                if (selectedDemand) {
                    const amount = parseFloat(demandAmountModal);
                    postEditingDemand(selectedDemand.id, { "approvedAmount": amount, "newStatus": statusModal }, 'Onaylama');
                }
        }
    }

    //İptal edilen talep işlemleri
    async function cancelDemand() {
        if ((!selectedDemand) || (!cancelReason)) { return message.error('İptal durumu seçiniz'); }

        //Çoklu Onaylama
        if (selectedItems.length > 0) {
            setClearTableChecked(true);
            setDemandConfirmLoading(true);
            _.each(selectedItems, (item) => {
                postEditingMultipleDemand(item.id, { "newStatus": statusModal, "cancelReason": cancelReason, "cancelReasonDescription": cancelReasonText }, 'İptal işlemi');
            });
        }

        //Tekli Onaylama
        else {
            postEditingDemand(selectedDemand.id, { "newStatus": statusModal, "cancelReason": cancelReason, "cancelReasonDescription": cancelReasonText }, 'İptal işlemi');

        }
    }

    //Red edilen talep işlemleri
    async function rejectedDemand() {
        //Çoklu Onaylama
        if (selectedItems.length > 0) {
            setClearTableChecked(true);
            setDemandConfirmLoading(true);
            _.each(selectedItems, (item) => {
                postEditingMultipleDemand(item.id, { "newStatus": statusModal, "cancelReason": cancelReason, "cancelReasonDescription": cancelReasonText }, 'Red işlemi');
            });
        }

        //Tekli Onaylama
        else {
            postEditingDemand(selectedDemand.id, { "newStatus": statusModal, "cancelReason": cancelReason, "cancelReasonDescription": cancelReasonText }, 'Red işlemi');

        }
    }

    //Bekleme konumuna geri alma
    async function pendingDemand() {
        if ((!demandAmountModal) && (selectedItems.length < 1)) { return message.error('Miktar giriniz'); }

        //Çoklu Onaylama
        if (selectedItems.length > 0) {
            setClearTableChecked(true);
            setDemandConfirmLoading(true);
            _.each(selectedItems, (item) => {
                postEditingMultipleDemand(item.id, { "newStatus": statusModal }, 'Bekleme İşlemi');
            });
        }

        //Tekli Onaylama
        else {
            postEditingDemand(selectedDemand.id, { "newStatus": statusModal }, 'Bekleme İşlemi');

        }
    }

    //Sipariş oluşturma
    async function createOrder() {
        //Sipariş başarılı bir şekilde oluşturulduysa popup pencerisini kapat
        if (selectedDemand && selectedDemand.status === enumerations.DemandStatus.Approved && typeof selectedDemand.orderNo === 'undefined') {
            postSaveOrder([selectedDemand.id]);
        }
        else { message.warning('Sadece onaylanan talepleri sipariş oluşturabilirsiniz.') }
    }

    function demandEditing() {
        if (selectedDemand && typeof selectedDemand.orderNo === 'undefined') {
            setVisible(true);
        }
        else { message.warning('Siparişi oluşmuş talepleri düzenleyemezsiniz.') }

    }

    //Seçilenleri sipariş oluşturma işlemi
    async function multiplePostSaveOrder() {
        // setAcceptInfoVisible(true);
        const demandStatusControl = _.filter(selectedItems, function (x) { return x.status !== enumerations.DemandStatus.Approved || x.status == enumerations.DemandStatus.Approved && typeof x.orderNo !== 'undefined'; });
        if (demandStatusControl.length > 0) {
            message.warning('Sadece onaylanan ve siparişi oluşturulamamış talepleri sipariş oluşturabilirsiniz.')
        }
        else {
            postSaveOrder(selectedItemsId);
        }

    }

    //Seçilenleri talepleri işlemi
    async function multipleDemandDelete() {
        setDeleteDemand(true);
        _.each(selectedItemsId, (item) => {
            //   postNotificationIsread(item, true);
        });
    }

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
            case 'Rejected':
                if (!cancelReason) { return message.error('Red Durumu seçiniz'); }
                rejectedDemand();
                break;
        }
    }

    //Save Order
    async function postSaveOrder(demandIds) {

        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const dealerCode = token.dcode;
        setDemandToOrderConfirmLoading(true);
        message.info('Sipariş oluşturma işlemi başladı lütfen bekleyiniz...')
        const reqBody = { "demandIds": demandIds }
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        await fetch(siteConfig.api.report.postDemandToOrder, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (typeof data !== 'undefined') {
                    if (data.isSuccessful === false) {
                        message.warning({ content: 'Sipariş kaydetme işlemi başarısızdır. ' + data.message, duration: 2 });
                        if ((data.failedDemands) && (data.failedDemands.length > 0)) {
                            setFailedDemandsNo(data.successfulDemands);
                            setFailedDemandsShowPopup(true);
                        }
                        else { orderFailedPopupClose(); }
                        // demandSaveResult(false, itemCode, amount, data.message);
                    } else {
                        message.success({ content: 'Siparişler başarıyla oluşturuldu.', duration: 5 });
                        if ((data.failedDemands) && (data.failedDemands.length > 0)) {
                            setFailedDemandsNo(data.successfulDemands);
                            setFailedDemandsShowPopup(true);
                        }
                        else { orderFailedPopupClose(); }
                    }
                }
            })
            .catch();
        setDemandToOrderConfirmLoading(false);
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
        setEventType();
    };

    function orderFailedPopupClose() {
        setDemandNo();
        setDemandAmountModal();
        setStatusModal();
        setVisible(false);
        setAcceptInfoVisible(false);
        setToolbarEditingButton(false);
        setDeleteDemand(false);
        setEventType();
        setFailedDemandsShowPopup(false);
        setOnRefreshMode(true);
        setHasSelected(false); selectedTotalCount = 0; setSelectedItemsId([]); setSelectedItems([])
        setVisible(false);
        setSelectedDemand();
        setSelectedItemsId();
        setDemandConfirmLoading(false);
        setSelectedRowKeys([]);
        handleCancel();
    }

    //Demand status modal change
    function demandStatusChangeModal(value) {
        setStatusModal(value);
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
        const demandStatusControl = _.filter(selectedItems, function (x) { return typeof x.orderNo === 'undefined'; });
        if (demandStatusControl.length === 0) {
            message.warning('Sadece bekleyen ve siparişi oluşturulamamış talepleri sipariş oluşturabilirsiniz.')
        }
        else {
            let control = false;
            let status;
            _.each(selectedItems, (item) => {
                if (item.status === 'Approved') { return control = true; }
                else { status = item.status; }
            });
            setToolbarEditingButton(true); setVisible(true); setSelectedToolbarStatus(status); setEventType('Toolbar');
        }
    }

    function demandEditingQuantityPermission() {
        //Bu kodu incele gereksinim olabilir
        //if(selectedItems.length>1){return true;}
        if (typeof eventType !== 'undefined') { return false; }
        if ((token.urole === 'admin') && (statusModal === 'Approved')) { return true; }
        else if ((token.urole === 'fieldmanager') && (statusModal === 'Approved')) {
            return true;
        }
        else if ((token.urole === 'regionmanager') && (statusModal === 'Approved')) {
            return true;
        }
        else if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            return false;
        }
    }

    function demandEditingModalPermissions(type) {

        const token = jwtDecode(localStorage.getItem("id_token"));

        if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            switch (type) {
                case 'Approved':
                    return true;
                case 'Cancelled':
                    return false;
                case 'Pending':
                    return false;
                case 'Rejected':
                    return true;
            }
        }
    }

    //Talep cancel durumları seçimi
    function onChangeCancelReasonButton(value) {
        setCancelReason(value);
    }

    //
    function deadlineControl(item) {
        let disabled = false;
        if (item && item.deadline < new Date()) { return disabled = true; }
        return disabled;
    }
    function onChangeAmountEntered(e) {
        const { value } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            setAmount(value);
        }
    }

    //Demand Columns
    let columns = [
        {
            title: "Durumu",
            dataIndex: "statusText",
            key: "statusText",
            width: 100,
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
            width: 150,
            ellipsis: true
        },
        {
            title: "Sevk Adresi",
            dataIndex: "addressCode",
            key: "addressCode",
            width: 150
        },
        {
            title: "Talep No",
            dataIndex: "demandNo",
            key: "demandNo",
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.orderNo - b.orderNo,
            sortOrder: tableOptions.sortedInfo.columnKey === 'demandNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 150,
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
            render: (date, record) => moment(date).format(siteConfig.dateFormatAddTime),
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
            title: "Onaylanan Miktar",
            dataIndex: "approvedAmount",
            key: "approvedAmount",
            align: "right",
            render: (approvedAmount) => typeof approvedAmount !== 'undefined' ? numberFormat(approvedAmount) : '-',
            width: 120,
        },
        {
            title: "Onaylanma Tarihi",
            dataIndex: "approveDate",
            key: "approveDate",
            type: "approveDate",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (approveDate, record) => typeof approveDate !== 'undefined' ? moment(approveDate).format(siteConfig.dateFormatAddTime) : '-',
        },
        {
            title: "Sipariş Numarası",
            dataIndex: "orderNo",
            key: "orderNo",
            type: "orderNo",
            width: 150,
            render: (orderNo, record) => typeof orderNo !== 'undefined' ? <a href={'/reports/orders/?keyword=' + orderNo}>{orderNo}</a> : '-',
        },
        {
            title: "İptal Nedeni",
            dataIndex: "cancelReasonText",
            key: "cancelReasonText",
            type: "cancelReasonText",
            width: 100,
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
        ExcelExport(columns, data, 'Talepler');
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
                                    <FormItem label={<IntlMessages id="page.productGroup" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 6 : 0} >
                                    <FormItem label={<IntlMessages id="page.series" />}></FormItem>
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
                                    mode="multiple"
                                    placeholder="Talep durumu seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    onChange={statusHandleChange}
                                    optionFilterProp="children"
                                    value={demandStatus}
                                >
                                    {searchStatusChildren}
                                </Select>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Ürün grubu seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    onChange={productGroupHandleChange}
                                    optionFilterProp="children"
                                    value={selectedProductCategory}
                                >
                                    {productCategory}
                                </Select>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>                            <Select
                                showSearch
                                mode="multiple"
                                placeholder="Seri seçiniz"
                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                onChange={productSeriesHandleChange}
                                optionFilterProp="children"
                                value={selectedProductSeries}
                            >
                                {productSeriesChildren}
                            </Select>
                            </Col>

                        </Row>
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} >
                                <FormItem label={<IntlMessages id="page.addressTitle" />}></FormItem>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} >
                                <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} >

                                <FormItem label={<IntlMessages id="page.dimensions" />}></FormItem>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} >
                                <FormItem label={<IntlMessages id="page.amount" />}></FormItem>
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
                                <Select
                                    showSearch
                                    mode="multiple"
                                    placeholder="Ebat seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    onChange={productDimensionsHandleChange}
                                    optionFilterProp="children"
                                    value={selectedDimensions}
                                >
                                    {productDimensionsChildren}
                                </Select>
                                <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                                <Input size="small" placeholder="Ürün Adı, Talep No ... giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />

                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Miktar giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={amount} onKeyDown={keyPress} onChange={event => onChangeAmountEntered(event)} />

                                <Button style={{ marginLeft: '10px', marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
                                    {<IntlMessages id="forms.button.label_Search" />}
                                </Button>
                            </Col>

                        </Row>
                    </Panel>
                </Collapse>
            </Box>

            <Box>
                {/* Data list volume */}
                <div style={{ textAlign: 'center', borderRadius: '4px' }}>
                    <Spin tip="İşlem uzun sürebilir lütfen bekleyiniz..." spinning={demandToOrderConfirmLoading}
                    >
                    </Spin></div>
                {hasSelected ?
                    <Col span={8} offset={16} align="right" >
                        {token.urole === 'admin' || ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) ?
                            <Button style={{ paddingLeft: '10px' }} onClick={_.throttle (e => {multiplePostSaveOrder()  }, 1000, { leading: false })}>
                                Sipariş Oluştur    <CheckOutlined />
                            </Button> : null}
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
                            Düzenle    <EditOutlined />
                        </Button>
                        {/* <Button disabled={true} onClick={() => (multipleDemandDelete())}>
                            Talebi Sil    <CloseOutlined />
                        </Button> */}
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
                {amount > 0 ? null :
                    <ReportPagination
                        onShowSizeChange={onShowSizeChange}
                        onChange={currentPageChange}
                        pageSize={pageSize}
                        total={totalDataCount}
                        current={pageIndex}
                        position="top"
                    />}

                <Col span={8} offset={16} align="right" >
                    <Button type="primary" size="small" style={{ marginBottom: '5px' }}
                        icon={<DownloadOutlined />} onClick={exportExcelButton}>
                        {<IntlMessages id="forms.button.exportExcel" />}
                    </Button>
                </Col>
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
                {amount > 0 ? null :
                    <ReportPagination
                        onShowSizeChange={onShowSizeChange}
                        onChange={currentPageChange}
                        pageSize={pageSize}
                        total={totalDataCount}
                        current={pageIndex}
                        position="bottom"
                    />
                }
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
                <div style={{ textAlign: 'center', borderRadius: '4px' }}>
                    <Spin tip="İşlem uzun sürebilir lütfen bekleyiniz..." spinning={demandConfirmLoading}
                    >
                    </Spin></div>
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
                    <Form.Item label="Talep Durumu" >
                        <Select
                            placeholder="Talep durumu seçiniz"
                            style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                            onChange={demandStatusChangeModal}
                            optionFilterProp="children"
                            value={statusModal}
                        >
                            {statusChildren}
                        </Select>
                    </Form.Item>
                    {demandEditingQuantityPermission(eventType) ?
                        <Form.Item label="Miktar" >
                            <Input id="amount" value={demandAmountModal} onClick={event => onSelectAll('amount')}
                                onChange={event => onChangeAmount(event)} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} />
                            <span style={{ paddingLeft: '5px' }}>{demandUnitModal}</span>
                        </Form.Item> : null}

                    {statusModal === 'Cancelled' || statusModal === 'Rejected' ?
                        <Form.Item label="İptal Nedeni">
                            <Select
                                placeholder="İptal seçiniz"
                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                onChange={onChangeCancelReasonButton}
                                optionFilterProp="children"
                                value={cancelReason}
                            >
                                {cancelReasonChildren}
                            </Select></Form.Item> : null}

                    <Form.Item label="Açıklama" >
                        <TextArea onChange={event => handleDescription(event)} value={description} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '830px' : '100%' }} />
                    </Form.Item>
                </Form>

            </Modal>
            <Modal
                title={'Siparişi oluşturulamayan talepler'}
                visible={failedDemandsShowPopup}
                maskClosable={false}
                footer={[
                    <Button key="back" type="primary" onClick={event => orderFailedPopupClose()}>
                        Kapat
                    </Button>
                ]}>
                <React.Fragment>
                    {
                        failedDemandsNo && failedDemandsNo.length > 0 ? (
                            <React.Fragment>
                                <p style={{ margin: '10px 0 10px 0' }}>Aşağıda listelenen talep(ler) sipariş oluşturulamamıştır:</p>
                                <ul style={{ listStylePosition: 'inside', listStyleType: 'initial' }}>
                                    {failedDemandsNo.map(item => { return (<li><strong>{item}</strong> </li>) })}
                                </ul>
                            </React.Fragment>
                        ) : null
                    }
                </React.Fragment>

            </Modal>
        </LayoutWrapper>
    );
}
