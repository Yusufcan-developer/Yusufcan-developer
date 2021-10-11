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
import { Table, Row, Col, Radio, Tag, Modal, Input, message, Layout, Button } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';
import Popconfirms from '@iso/components/Feedback/Popconfirm';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Style
import { CloseOutlined, SettingOutlined, DownOutlined, CheckOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';

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
let getSelectedKey = [];

let sortingField;
let sortingOrder;
export default function () {
    document.title = "Dönemler - Seramiksan B2B";
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
    const [selectedToolbarStatus, setSelectedToolbarStatus] = useState();
    const [eventType, setEventType] = useState();

    const [demandAmountModal, setDemandAmountModal] = useState();
    const [demandUnitModal, setDemandUnitModal] = useState();
    const [demandConfirmLoading, setDemandConfirmLoading] = useState(false);
    const [clearTableChecked, setClearTableChecked] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const location = useLocation();
    const queryString = require('query-string');
    const history = useHistory();
    const statusChildren = [];
    const searchStatusChildren = [];
    const cancelReasonChildren = [];
    const warningDemandId = [];
    const resultMultipleCount = [];

    //Burada ki useEffect'ler page index page size
    useEffect(() => {
        setCurrentPage(pageIndex);
        getVariablesFromUrl();
    }, [pageIndex]);

    let searchUrl = queryString.parse(location.search);
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall, code, name, setOnRefreshMode] =
        useFetch(`${siteConfig.api.report.postPeriodItems}`, { "regionCodes": regionCodes, "fieldCodes": fieldCodes, "keyword": searchKey, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "siteMode": searchSiteMode }, searchUrl);
    
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

    //Status handle change
    function statusHandleChange(value) {
        setDemandStatus(value);
    }

    //Dates radio button handle change
    function onChangeRadioButton(e) {
        setSelectedRadioItem(e.target.value);
        setPrivateDate(null);
    }

    //Miktar girilen text alanında tüm değerleri seçiyor
    function onSelectAll(id) {
        document.getElementById(id).select();
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
        let control = false;
        let status;
        _.each(selectedItems, (item) => {
            if (item.status === 'Approved') { return control = true; }
            else { status = item.status; }
        });
        setToolbarEditingButton(true); setVisible(true); setSelectedToolbarStatus(status); setEventType('Toolbar')
        // if (control === true) { return message.warning('Onaylananlar düzenleme işlemi yapılamaz.') }
        // else { setToolbarEditingButton(true); setVisible(true); setSelectedToolbarStatus(status); setEventType('Toolbar') }
    }

    //Talep cancel durumları seçimi
    function onChangeCancelReasonButton(value) {
        setCancelReason(value);
    }

    //Period Columns
    let columns = [
        {
            title: "Durumu",
            dataIndex: "isActive",
            key: "isActive",
            width: 150,
            render: (isActive) => (
                <>
                    {isActive === true ? (
                        (<Tag color={'blue'} key={'Aktif'}>
                            {'Aktif'}
                        </Tag>)

                    ) : (
                        (<Tag color={'green'} key={'Pasif'}>
                            {'Pasif'}
                        </Tag>)

                    )}
                </>
            ),
        },
        {
            title: "Başlangıç Tarihi",
            dataIndex: "date",
            key: "startDate",
            type: "startDate",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'startDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (startDate, record) => moment(startDate).format(siteConfig.dateFormatAddTime),
        },
        {
            title: "Bitiş Tarihi",
            dataIndex: "date",
            key: "endDate",
            type: "endDate",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'endDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (endDate, record) => moment(endDate).format(siteConfig.dateFormatAddTime),
        },
        {
            title: "Son Teslim Tarihi",
            dataIndex: "date",
            key: "deadline",
            type: "deadline",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'deadline' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (deadline, record) => moment(deadline).format(siteConfig.dateFormatAddTime),
        },        
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
        // ExcelExport(columns, data, 'Talepler');
    }

    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.period.header" />}
            </PageHeader>
            <Box>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={6} >
                                    <FormItem label={<IntlMessages id="page.status" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>                           
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
                        </Row>
                        <Row>
                           
                        </Row>
                        <Row> 
                           
                        </Row>
                    </Panel>
                </Collapse>
            </Box>
            {/* Data list volume */}
            <Box>
                {hasSelected ?
                    <Col span={8} offset={16} align="right" >
                        <Button style={{ paddingLeft: '10px' }} >
                            Onayla ve sipariş Oluştur    <CheckOutlined />
                        </Button>                      
                     
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
                    rowClassName={(record, index) => (record.isRead === true ? 'table-background-color-notification-isUnRead' : "table-background-color-notification-isUnRead")}

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
