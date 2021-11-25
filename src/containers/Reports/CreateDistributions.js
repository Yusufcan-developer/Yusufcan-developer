//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
// import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
// import DatePicker from "@iso/components/uielements/datePicker";
import Button from "@iso/components/uielements/button";
import { Form, Table, Row, Col, TreeSelect, Radio, InputNumber, Popover, Space, Modal, TimePicker, Tooltip, message, Alert, Checkbox, Tag, Input, DatePicker, Tabs } from "antd";
import PageHeader from "@iso/components/utility/pageHeader";
import Collapse from "@iso/components/uielements/collapse";
// import Input from '@iso/components/uielements/input';
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';

//Configs
import { RightOutlined } from '@ant-design/icons';
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import numberFormat from "@iso/config/numberFormat";
import renderFooter from "./ReportSummary";
import viewType from '@iso/config/viewType';
import { strikeout } from "../Ecommerce/Cart/color.css";


//Other Library
import enumerations from "../../config/enumerations";
import _ from 'underscore';
import logMessage from "../../config/logMessage";
import moment, { now } from 'moment';
import 'moment/locale/tr'
import { object } from "prop-types";
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const { Panel } = Collapse;
const { TextArea } = Input;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
let sortingField;
let sortingOrder;
const format = 'HH:mm';
const { TabPane } = Tabs;

export default function () {
    document.title = "Dağıtım Planlama - Seramiksan B2B";

    const children = [];
    const Option = SelectOption;
    const [selectedRadioItem, setSelectedRadioItem] = useState(1);
    const [privateDate, setPrivateDate] = useState('Bugun');
    const [distributionItem, setDistributionItem]=useState();
    const [searchKey, setSearchKey] = useState('');
    const [tableOptions, setState] = useState({
        sortedInfo: "",
        filteredInfo: ""
    });
    let tarih=true;
    const [driverName, setDriverName] = useState();
    const [boolDate,setBooldate]=useState(true);
    const [carPlate, setCarPlate] = useState();
    const [phone, setPhone] = useState();
    const [dates, setDate] = useState();
    const [time, setTime] = useState();
    const [visible, setVisible] = useState();
    const [specification, setSpecification] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [validation, setValidation] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [startingPageIndex, setStartingPageIndex] = useState(1);
    const [fromDate, setFromDate] = useState(moment(moment().subtract(0, 'days').toDate()));
    const [toDate, setToDate] = useState(moment(new Date()));
    const [dealerCodes, setDealerCodes] = useState();
    const [regionCodes, setRegionCodes] = useState();
    const [fieldCodes, setFieldCodes] = useState();
    const [selectedDealerCode, setSelectedDealerCode] = useState();
    const [newUrlParams, setNewUrlParams] = useState('')
    const location = useLocation();
    const [selectedStatusType, setSelectedStatusType] = useState(['Öneri']);
    const [address, setAddress] = useState();
    const [lookupAddressChildren, setLookupAddressChildren] = useState();
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [distributionId, setDistributionId] = useState();
    const [orderNo, setOrderNo] = useState();
    const [maximumAmountControl, setMaximumAmountControl] = useState();
    const [quantity, setQuantity] = useState();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalVisible, setModalVisible] = useState(true);
    const [totalWight, setTotalWeight] = useState();
    const [selectedDistributionData, setSelectedDistributionData] = useState();
    const [description, setDescription] = useState('');
    const [dateValidation, setDateValidation]= useState(true);
    const [timeValidation, setTimeValidation]= useState(true);
    const isEditing = record => record.itemCode === editingKey && record.distributionId === distributionId && record.orderNo === orderNo;

    const queryString = require('query-string');
    const history = useHistory();
    let getSelectedKey = [];

    //Burada ki useEffect'ler page index page size sonuçlarına göre veri getiriyor.
    useEffect(() => {
        postSaveLog(enumerations.LogSource.ReportDistributions, enumerations.LogTypes.Browse, logMessage.Reports.Distributions.browse);
        getVariablesFromUrl()
        setCurrentPage(pageIndex);
        const token = jwtDecode(localStorage.getItem("id_token"));
        if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            getAdress(token.dcode);
        }
        return () => {
            localStorage.removeItem('distributions');
        }
    }, [pageIndex]);

    let searchUrl = queryString.parse(location.search);
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, aggregatesOverall] =
        useFetch(`${siteConfig.api.report.postDistributions}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate.format('YYYY-MM-DD'), "to": toDate.format('YYYY-MM-DD'), "keyword": searchKey, "status": selectedStatusType, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address, "excludeZeroRemainingLines": true }, searchUrl);

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

        if (typeof parsed.from !== 'undefined') { setFromDate(moment(parsed.from + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); }
        if (typeof parsed.from !== 'undefined') { setToDate(moment(parsed.to + 'T00:00:00-00:00', 'YYYY-MM-DD' + 'THH:mm:ss', null)); setSelectedRadioItem(2); setPrivateDate(null); }
        if (typeof parsed.keyword !== 'undefined') { setSearchKey(parsed.keyword); }
        if (typeof parsed.pgsize !== 'undefined') { setPageSize(parseInt(parsed.pgsize)); }
        if (typeof parsed.pgindex !== 'undefined') { setPageIndex(parseInt(parsed.pgindex)); }
        if (typeof parsed.sortingField !== 'undefined') { sortingField = parsed.sortingField; }
        if (typeof parsed.sortingOrder !== 'undefined') { sortingOrder = parsed.sortingOrder; }

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

        if (typeof parsed.fic !== 'undefined') {
            if (Array.isArray(parsed.fic)) {
                _.each(parsed.fic, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.fic) }
        }

        if (typeof parsed.rec !== 'undefined') {
            if (Array.isArray(parsed.rec)) {
                _.each(parsed.rec, (item, i) => {
                    newDealarCode.push(item);
                });
            } else { newDealarCode.push(parsed.rec) }
        }

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

        const params = new URLSearchParams(location.search);

        params.delete('dec');
        params.delete('rec');
        params.delete('fic');
        params.delete('from')
        params.delete('to');
        params.delete('keyword');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('sortingField');
        params.delete('sortingOrder');
        params.delete('address');

        params.append('from', moment(moment(fromDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        params.append('to', moment(moment(toDate, "DD/MM/YYYY")).format("YYYY-MM-DD")); params.toString();
        if (typeof sortingOrder !== 'undefined') { params.append('sortingOrder', sortingOrder); }
        if (typeof sortingField !== 'undefined') { params.append('sortingField', sortingField); }
        if (selectedPageSize) { params.append('pgsize', selectedPageSize); setPageSize(selectedPageSize) } else { params.append('pgsize', pageSize) }
        if (selectedPageIndex) { params.append('pgindex', selectedPageIndex) } else { setPageIndex(startingPageIndex); params.append('pgindex', startingPageIndex) }
        if (searchKey.length > 0) { params.append('keyword', searchKey); params.toString(); }

        _.forEach(address, (item) => {
            params.append('address', item); params.toString();
        });

        let createUrl = null;
        if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
        history.push(`${location.pathname}?${createUrl}`);
        setSelectedRowKeys([]);
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
        if (typeof sorter !== 'undefined') {
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

    //Send selected distribution items
    async function sendDistributionItems(items, selectedDealerCode) {
        const token = jwtDecode(localStorage.getItem("id_token"));
        let accountNo;
        if (selectedDealerCode) {
            accountNo = selectedDealerCode
        } else {
            accountNo = token.dcode;
        }
        
        setConfirmLoading(true);
        let selectedDate = dates.format('YYYY-MM-DD');
        let selectedTime = time.format('HH:mm:ssZ');
        let sendDate = moment((selectedDate + " " + selectedTime));

        const reqBody = { 'items': items, "driverName": driverName, "phone": phone, "plateNo": carPlate, "description": description,  "date": sendDate.format('YYYY-MM-DDTHH:mm:ss.sssZ') }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        let newSaveOrderUrl = siteConfig.api.report.postSaveLineItems.replace('{accountNo}', accountNo);
        await fetch(`${newSaveOrderUrl}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (data.isSuccess === true) {
                    localStorage.removeItem('distributions');
                    setDriverName();
                    setCarPlate();
                    setPhone();
                    setDescription('');
                    message.info(data.message, 8);
                    setSelectedRowKeys([]);
                    setSpecification(false);
                    setConfirmLoading(false);
                    setVisible(false);
                } else {
                    message.warning(data.message, 8);
                    setConfirmLoading(false);
                }
            })
            .catch();
    }

    //Seçilenleri onaylama işlemi
    async function handleOk() {
        if ((!driverName) || (!carPlate) || (!phone) || (!dates) || (!time)) {
            setValidation(false);
            message.warning('Lütfen bilgileri eksiksiz giriniz', 3);
            if (!dates) { setDateValidation(false); }
            if (!time) { setTimeValidation(false); }
        }
        else if (specification === false) {
            message.warning('Lütfen sol alt köşede bulunan şartnameyi işaretleyiniz', 3);
        }
        else {
            let items = [];
            let selectedDealerCode;
            let distributions = localStorage.getItem('distributions');
            distributions = JSON.parse(distributions);
            distributions = _.filter(distributions, function (i) { return i.quantity > 0 });         
            _.each(distributions, (item) => {
                selectedDealerCode = item.dealerCode;
                items.push({
                    distributionLineId: item.distributionLineId,
                    amount: item.quantity,
                    status: item.status,
                });
            });
            const NotUrgentCount = _.filter(distributions, function (item) { return item.status === enumerations.status.NotUrgent; });
            if ((items.length > 1) && (NotUrgentCount.length === 0)) {
                message.warning('En az 1 ürünün kalem durumunu kalabilir olarak seçmelisiniz.', 3);
            }
            else {
                await sendDistributionItems(items, selectedDealerCode);
            }
        }
    };

    const edit = (record) => {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        const dealerCodeControl = _.find(distributions, function (i) { return i.dealerCode !== record.dealerCode && i.quantity > 0 });
        if (dealerCodeControl) {
            message.warning('Birden fazla bayi ile dağıtım planlaması yapamazsınız', 5);
        } else {
            const item = _.find(distributions, function (i) { return i.distributionLineId === record.distributionLineId });
            if ((item) && (item.quantity > 0)) {
                if(record.canBeSoldPartially===true){
                if (record.minimumDistributableAmountInPartial === 1) {
                    setQuantity(numberFormat(item.quantity));
                    setMaximumAmountControl(record.remainingDistributableAmountInPartial);
                    setModalVisible(true);
                }
                else {
                    setQuantity(numberFormat(item.quantity / record.minimumDistributableAmountInPartial));
                    setMaximumAmountControl(record.remainingDistributableAmountInPartial);
                    setModalVisible(true);
                }
            }
            else{
                if (record.minimumDistributableAmountInPallet === 1) {
                    setQuantity(numberFormat(item.quantity));
                    setMaximumAmountControl(record.remainingDistributableAmountInPallet);
                    setModalVisible(true);
                }
                else {
                    setQuantity(numberFormat(item.quantity / record.minimumDistributableAmountInPallet));
                    setMaximumAmountControl(record.remainingDistributableAmountInPallet);
                    setModalVisible(true);
                }
            }
            } 
            else {
                if(record.canBeSoldPartially===true){
                setQuantity(numberFormat(record.remainingDistributableAmountInPartial));
                setMaximumAmountControl(record.remainingDistributableAmountInPartial);
                setModalVisible(true);
                }
                else{
                    setQuantity(numberFormat(record.remainingDistributableAmountInPallet));
                    setMaximumAmountControl(record.remainingDistributableAmountInPallet);
                    setModalVisible(true);
                }
            }
            setEditingKey(record.itemCode);
            setOrderNo(record.orderNo);
            setDistributionId(record.distributionId);
        }
    };

    function dealerCodesControl(items) {
        const dealerCode = items[0];
        let control = false;
        _.each(items, (item) => {
            if (item.dealerCode !== dealerCode.dealerCode) {
                return control = true;
            }
        });
        return control;
    }
    
    function addDistributionItemAll(items, selectedItem) {
        const control = dealerCodesControl(items);
        if (control) {
            //Buradaki kod alanı güncellenecek...
        }
        else {
            let distributions = localStorage.getItem('distributions');
            distributions = JSON.parse(distributions);
            if (!distributions) { distributions = [] }

            _.each(items, (item) => {
                const index = _.findIndex(distributions, function (i) { return i.distributionLineId === item.distributionLineId });
                if (index > -1) {
                    if (selectedItem === true) { distributions[index].quantity = item.plannedAmount; } else if (selectedItem === false) {
                        distributions[index].quantity = 0;
                    }
                    else {
                        distributions[index].unitWeight = item.unitWeight * quantity;
                        distributions[index].quantity = quantity;
                    }
                } else {
                    distributions.push({
                        itemCode: item.itemCode,
                        quantity: selectedItem === true ? item.plannedAmount : quantity,
                        orderNo: item.orderNo,
                        distributionLineId: item.distributionLineId,
                        distributionNo: item.distributionNo,
                        addressDescription: item.addressDescription,
                        itemDescription: item.itemDescription,
                        unit: item.unit,
                        dealerCode: item.dealerCode,
                        unitWeight: item.unitWeight * (selectedItem === true ? item.plannedAmount : quantity),
                        plannedAmount: item.plannedAmount,
                        distributionStatus:enumerations.status.Priority
                    })
                }

                localStorage.setItem('distributions', JSON.stringify(distributions));
                setModalVisible(false);
                setQuantity();
                setEditingKey('');

                //Seçilen veya miktar girilen alanların checklenmesi veya kaldırılması.
                let newKeyArr = [];
                let getSelectedKey = selectedRowKeys;

                _.each(items, (index) => {
                    if ((selectedItem === true) || (typeof selectedItem === 'undefined')) {
                        newKeyArr.push(index.key);
                    }
                    else {
                        getSelectedKey = _.without(getSelectedKey, index.key);
                    }
                });
                _.each(getSelectedKey, (index) => {
                    newKeyArr.push(index);
                });

                if (selectedItem === false) { setSelectedRowKeys(getSelectedKey); }
                else {
                    setSelectedRowKeys(newKeyArr);
                }
            });

        }

    }

    function addDistributionItem(item, selectedItem, rowIndex, selectAll) {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        const dealerCodeControl = _.find(distributions, function (i) { return i.dealerCode !== item.dealerCode && i.quantity > 0 });
        if (dealerCodeControl) {
            message.warning('Birden fazla bayi ile dağıtım yapamazsınız', 5);
        } else {
            if (!distributions) { distributions = [] }
            //Daha önceden kayıt varmı kontrolü
            const index = _.findIndex(distributions, function (i) { return i.distributionLineId === item.distributionLineId });
            if (index > -1) {
                if (selectedItem === true) { distributions[index].quantity = item.plannedAmount; } else if (selectedItem === false) {
                    distributions[index].quantity = 0;
                }
                else {
                    if(item.canBeSoldPartially===true){
                    if (item.minimumDistributableAmountInPartial === 1) {
                        distributions[index].unitWeight = parseFloat(quantity) * item.unitWeight;
                        distributions[index].quantity = parseFloat(quantity);
                    }
                    else {
                        distributions[index].unitWeight = parseFloat(quantity) * item.minimumDistributableAmountInPartial * item.unitWeight;

                        distributions[index].quantity = parseFloat(quantity) * item.minimumDistributableAmountInPartial;
                    }
                }
                    else{
                        if (item.minimumDistributableAmountInPallet === 1) {
                            distributions[index].unitWeight = parseFloat(quantity) * item.unitWeight;
                            distributions[index].quantity = parseFloat(quantity);
                        }
                        else {
                            distributions[index].unitWeight = parseFloat(quantity) * item.minimumDistributableAmountInPallet * item.unitWeight;
    
                            distributions[index].quantity = parseFloat(quantity) * item.minimumDistributableAmountInPallet;
                        }
                    }

                }
            } else {
                let selectedQuantity;
                let seletedUnitWeight;
                if(item.canBeSoldPartially===true){
                if (item.minimumDistributableAmountInPartial === 1) {
                    selectedQuantity = parseFloat(quantity);
                }
                else {
                    const amount = parseFloat(quantity);
                    selectedQuantity = amount * item.minimumDistributableAmountInPartial;
                }
            }
            else{
                if (item.minimumDistributableAmountInPallet === 1) {
                    selectedQuantity = parseFloat(quantity);
                }
                else {
                    const amount = parseFloat(quantity);
                    selectedQuantity = amount * item.minimumDistributableAmountInPallet;
                }
            }
                distributions.push({
                    itemCode: item.itemCode,
                    quantity: selectedItem === true ? item.plannedAmount : selectedQuantity,
                    orderNo: item.orderNo,
                    distributionLineId: item.distributionLineId,
                    distributionNo: item.distributionNo,
                    addressDescription: item.addressDescription,
                    itemDescription: item.itemDescription,
                    unit: item.unit,
                    dealerCode: item.dealerCode,
                    unitWeight: item.unitWeight * (selectedItem === true ? item.plannedAmount : selectedQuantity),
                    plannedAmount: item.plannedAmount,
                    status:enumerations.status.Priority,
                })
            }
            localStorage.setItem('distributions', JSON.stringify(distributions));
            setModalVisible(false);
            setQuantity();
            setEditingKey('');

            //Seçilen veya miktar girilen alanların checklenmesi veya kaldırılması.
            let newKeyArr = [];
            _.each(selectedRowKeys, (index) => {
                if (index === rowIndex && selectedItem === false) { }
                else {
                    newKeyArr.push(index);
                }
            });
            _.each(getSelectedKey, (i) => {
                newKeyArr.push(i);
            });
            getSelectedKey = [];
            if ((selectedItem === true) || (typeof selectedItem === 'undefined')) {
                newKeyArr.push(rowIndex);
            }
            else{
                newKeyArr= _.without(newKeyArr, rowIndex);
            }
            setSelectedRowKeys(newKeyArr);
        }
    }

    function InputNumberOnchange(value) {
        if (parseFloat(maximumAmountControl) > value) {
            setQuantity(value);
        }
        else {
            setQuantity(parseFloat(maximumAmountControl));
        }
    }

    function handleVisibleChange() {
        setModalVisible(false);
        setEditingKey('');
    }

    function getSelected() {
        if (selectedRowKeys.length > 0) {
            return selectedRowKeys
        }
        else {
            let distributions = localStorage.getItem('distributions');
            distributions = JSON.parse(distributions);

            _.each(distributions, (item) => {
                const index = _.findIndex(data, function (i) { return i.distributionLineId === item.distributionLineId && item.quantity > 0 });
                if (index > -1) {
                    getSelectedKey.push(index);
                }
            });
        }
        return getSelectedKey;
    }

    function getEnteredQuantity(distributionLineId) {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);

        //Daha önceden kayıt varmı kontrolü
        const item = _.find(distributions, function (i) { return i.distributionLineId === distributionLineId });
        if (item) {
            return item.quantity;
        }
        return 0;
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        selectedRowKeys: getSelected(),
        onSelect: (record, selected, selectedRows) => {
            addDistributionItem(record, selected, record.key);
        },
        onSelectAll: (record, selected, selectedRows) => {
            addDistributionItemAll(selectedRows, record);
        },
    };

    let columns = [
        {
            title: "Bayi Adı",
            dataIndex: "dealerName",
            key: "dealerName",
            width: 150,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'dealerName' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            ellipsis: {
                showTitle: false,
            }, render: addressDescription => (
                <Tooltip placement="topLeft" title={addressDescription}>
                    {addressDescription}
                </Tooltip>
            ),


        },
        {
            title: "Dağıtım Kodu",
            dataIndex: "distributionNo",
            key: "distributionNo",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'distributionNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            ellipsis: true,
        },
        {
            title: "Sipariş T.",
            dataIndex: "distributionOrderDate",
            key: "distributionOrderDate",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'distributionOrderDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 120,
            render: (distributionOrderDate) => moment(distributionOrderDate).format(siteConfig.dateFormat),
        },
        {
            title: "Adres Açıklama",
            dataIndex: "addressDescription",
            key: "addressDescription",
            width: 150,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'addressDescription' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            ellipsis: {
                showTitle: false,
            }, render: addressDescription => (
                <Tooltip placement="topLeft" title={addressDescription}>
                    {addressDescription}
                </Tooltip>
            ),

        },
        {
            title: "Sipariş No",
            dataIndex: "orderNo",
            key: "orderNo",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            ellipsis: true
        },
        {
            title: "Ürün Kodu",
            dataIndex: "itemCode",
            key: "itemCode",
            // width: 120,
            ellipsis: true,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'itemCode' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: "Ürün Açıklaması",
            dataIndex: "itemDescription",
            key: "itemDescription",
            width: 180,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'itemDescription' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            ellipsis: {
                showTitle: false,
            }, render: addressDescription => (
                <Tooltip placement="topLeft" title={addressDescription}>
                    {addressDescription}
                </Tooltip>
            ),
        },
        {
            title: "Birim",
            dataIndex: "unit",
            key: "unit",
            align: "right",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'unit' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 75,
        },
        {
            title: "Planlanan Ağırlık",
            dataIndex: "palletWeight",
            key: "palletWeight",
            align: "right",
            ellipsis: true,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'palletWeight' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 150,
            render: (palletWeight) => numberFormat(palletWeight),
        },
        {
            title: "Önerilen Miktar",
            dataIndex: "plannedAmount",
            key: "plannedAmount",
            render: (plannedAmount) => numberFormat(plannedAmount),
            sorter: (a, b) => a.plannedAmount - b.plannedAmount,
            align: "right",
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'plannedAmount' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            footerKey: 'palletWeight',
            ellipsis: true,
            width: 150,           
        },
        {
            title: 'Planlanan Miktar',
            dataIndex: 'enteredQuantity',
            editable: true,
            // fixed: "right",
            align: 'right',
            key: 'enteredQuantity',
            footerKey: "plannedAmount",
            ellipsis: true,
            width: 150,
            render: (enteredQuantity, record) => numberFormat(getEnteredQuantity(record.distributionLineId))
        },
        {
            dataIndex: 'operation',
            // fixed: "right",
            ellipsis: true,
            render: (_, record, rowIndex) => {
                const editable = isEditing(record);
                let minimumDistributableAmount=0;
                if(record.canBeSoldPartially===true){
                    minimumDistributableAmount=record.minimumDistributableAmountInPartial
                }else(minimumDistributableAmount= record.minimumDistributableAmountInPallet);
                return editable ? (
                    <span>
                        <Popover
                            content={
                                <div>
                                    <Space size={10}>
                                        <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{record.unit === 'M2' ? 'Palet' : ''}</span>
                                        <InputNumber type="numeric" min={1} defaultValue={1} value={quantity} onChange={InputNumberOnchange} />
                                        <Button type="primary" onClick={() => addDistributionItem(record, undefined, rowIndex)}>Onayla</Button>
                                    </Space>
                                    <Col span={16} align="middle">
                                        <span style={{ fontWeight: 'normal', fontSize: '80%' }}>{record.unit === 'M2' ? 'M2 : ' + numberFormat(parseInt(quantity) * minimumDistributableAmount) : ''}</span>
                                    </Col>
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

                            <a disabled={editingKey !== ''} onClick={() => edit(record, rowIndex)}>
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

    let summaryColumns = [
        {
            title: "Dağıtım Kodu",
            dataIndex: "distributionNo",
            key: "distributionNo",
            width: 120,

        },
        {
            title: "Adres Açıklama",
            dataIndex: "addressDescription",
            key: "addressDescription",
            ellipsis: true,
        },
        {
            title: "Ürün Kodu",
            dataIndex: "itemCode",
            key: "itemCode",
            width: 120,

        },
        {
            title: "Durumu",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (text, record) => (
                <Select
                onChange={distributionStatusHandleChange}
                optionFilterProp="children"
                defaultValue={text}
            >
                <Option value="Priority">Öncelikli</Option>
                <Option value="NotUrgent">Kalabilir</Option>
            </Select>
              ),
        },
        {
            title: "Ürün Açıklaması",
            dataIndex: "itemDescription",
            key: "itemDescription",
            ellipsis: {
                showTitle: false,
            }, render: addressDescription => (
                <Tooltip placement="topLeft" title={addressDescription}>
                    {addressDescription}
                </Tooltip>
            ),
        },
        {
            title: "Birim",
            dataIndex: "unit",
            key: "unit",
            width: 80,
        },
        {
            title: "Toplam Ağırlık",
            dataIndex: "unitWeight",
            key: "unitWeight",
            align: "right",
            width: 150,
            render: (unitWeight) => numberFormat(unitWeight),
            footerKey: "unitWeight"
        },
        {
            title: "Önerilen Miktar",
            dataIndex: "plannedAmount",
            key: "plannedAmount",
            align: "right",
            width: 150,
            render: (plannedAmount) => numberFormat(plannedAmount),
            footerKey: "plannedAmount"
        },
        {
            title: 'Planlanan Miktar',
            dataIndex: 'quantity',
            editable: true,
            align: 'right',
            key: 'quantity',
            footerKey: "quantity",
            width: 150,
            render: (quantity) => numberFormat(quantity),
        },
    ];

    const createPlainDistribution = () => {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        distributions = _.filter(distributions, function (i) { return i.quantity > 0 });
        setSelectedDistributionData(distributions);
        setVisible(true);
    }

    const calculateSelectedWeight = () => {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        distributions = _.filter(distributions, function (i) { return i.quantity > 0 });
        let sum = distributions.reduce((x, item) => {
            return x + item.unitWeight;
        }, 0);
        return sum;
    }

    function onChangeRadioButton(e) {
        setSelectedRadioItem(e.target.value);
        setPrivateDate(null);
    }

    //Seçilenler Modal iptal işlemi
    function handleCancel() {
        setVisible(false);
    };

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
    function distributionStatusHandleChange(value) {
        let distributions = localStorage.getItem('distributions');
        distributions = JSON.parse(distributions);
        if (value) {
            const index = _.findIndex(distributions, function (i) { return i.distributionLineId === distributionItem.distributionLineId });
            if (index > -1) {
                distributions[index].status = value;
            }
            localStorage.setItem('distributions', JSON.stringify(distributions));
        }
    }

    const handleChangeDriverNAme = e => {
        setDriverName(e.target.value);
    }

    const handleChangeCarPLate = e => {
        setCarPlate(e.target.value);
    }

    const handleChangePhone = e => {
        setPhone(e.target.value);
    }

    function handleChangeDistributionDate(value, dateString) {
        if (dateString === '') { setDateValidation(false); }
        else {
            setDateValidation(true);
        }
        setDate(moment(dateString + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
    }

    function handleChangeTime(value, dateString) {
        if (dateString === '') { setTimeValidation(false); }
        else {
            setTimeValidation(true);
        }
        setTime(moment(dateString, format));
    }
    function handleDescription(e) {
        setDescription(e.target.value);
    }
    function disabledMinutes() {
        var minutes = [];
        for (let i = 0; i < 60; i++) {
            if ((i !== 0) && (i !== 30)) {
                minutes.push(i);
            }
        }
        return minutes;
    }

    function disabledDate(current) {
        // Can not select days before today and today
        return current < moment().startOf("day");
    }

    function handleSubmitCheck(value) {
        setSpecification(value);
    }
    const onFinish = (fieldsValue) => {
        // Should format date value before submit.
        const rangeValue = fieldsValue['range-picker'];
        const rangeTimeValue = fieldsValue['range-time-picker'];
        const values = {
          ...fieldsValue,
          'date-picker': fieldsValue['date-picker'].format('DD-MM-YYYY'),
          'date-time-picker': fieldsValue['date-time-picker'].format('YYYY-MM-DD HH:mm:ss'),
          'month-picker': fieldsValue['month-picker'].format('YYYY-MM'),
          'range-picker': [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')],
          'range-time-picker': [
            rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss'),
            rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss'),
          ],
          'time-picker': fieldsValue['time-picker'].format('HH:mm:ss'),
        };
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

    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.distributionPlainTitle.header" />}
            </PageHeader>
            <Box style={{ marginBottom: '15px' }}>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={view !== 'MobileView' ? 5 : 0} >
                                    <FormItem label={<IntlMessages id="page.dealerCodeTitle" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 5 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                    <FormItem label={<IntlMessages id="page.dateRangeTitle" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 5 : 0} >
                                    <FormItem label={<IntlMessages id="page.addressTitle" />}></FormItem>
                                </Col>
                                <Col span={view !== 'MobileView' ? 5 : 0} >
                                    <FormItem label={<IntlMessages id="page.keywordTitle" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 5 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
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
                            <Col span={view !== 'MobileView' ? 5 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
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
                                </Radio.Group> </Col>
                            <Col span={view !== 'MobileView' ? 5 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>

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
                            <Col span={view !== 'MobileView' ? 5 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Anahtar kelime" value={searchKey} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />

                            </Col>
                            <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
                                    {<IntlMessages id="forms.button.label_Search" />}
                                </Button>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>

            </Box>
            <Alert
                description="Aşağıdaki listede yer alan ürünleri tıklayarak dağıtım planı oluşturabilirsiniz. Planlanan Miktarı düzenlemek için 'kalem' ikonuna tıklayarak yeni miktar giriniz. Seçiminizi bitirdiğinizde 'Listeyi Oluştur' butonuna tıklayarak araç ve araç bilgileri girebileceğiniz onaylama ekranı çıkacaktır."
                type="info"
                showIcon closable
                style={{ marginBottom: '15px', width: '100%' }}
            />
            {/* Data list volume */}
            <Box >
                <Row >
                    <Col span={8} style={{ width: '100%', fontWeight:'bold' }} align="left">
                        {calculateSelectedWeight() > 0 && <span>Seçili toplam ağırlık:   <Tag color="blue">
                            {numberFormat(calculateSelectedWeight()) + ' kg'}
                        </Tag>  </span>}
                    </Col>
                    <Col span={8} offset={8} align="right" >
                        <Button type="primary" size="small"
                            icon={<RightOutlined />} onClick={createPlainDistribution}>
                            {<IntlMessages id="forms.button.plainCreate" />}
                        </Button>
                    </Col>
                </Row>
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
                    // scroll={{ x: 'max-content' }}
                    // size="medium"
                    bordered={false}
                    rowSelection={{
                        ...rowSelection,
                    }}
                    summary={() => {
                        return renderFooter(columns, data, false, aggregatesOverall, false)
                    }}
                    rowClassName={(record, index) => (getEnteredQuantity(record.distributionLineId) <= 0 ? 'table-background-color-notification-isUnRead' : "tableTextSize")}
                />
                <ReportPagination
                    onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={pageIndex}
                    position="bottom"
                />

                {/* Secilenlerin modal üzerinde gösterilmesi ve onaylanması */}
                <Modal
                    width={1500}
                    visible={visible}
                    title={"Dağıtım Planlama Listesi Onay"}
                    cancelText="İptal"
                    okText='Onayla'
                    maskClosable={false}
                    onCancel={handleCancel}
                    onOk={handleOk}
                    okButtonProps={{ disabled: specification }}
                    footer={null}

                >
                    <Form
                        form={form}
                        layout="vertical"
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                    >
                        <Box >
                            <Row>
                                <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                    <Form.Item name="driverName"
                                        rules={[{ required: true, message: 'Şoför adı giriniz!' }]}
                                    >
                                        <label style={{
                                            fontSize: '14px', fontWeight: '500'
                                        }}>
                                            Şoför Adı *
                                    <Input
                                                label="Şoför Adı"
                                                type="driverName"
                                                placeholder="Zorunlu alan giriniz"
                                                value={driverName}
                                                onChange={handleChangeDriverNAme}
                                            /></label>
                                    </Form.Item>
                                </Col>
                                <Col offset={1} span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                    <Form.Item name="plate"
                                        rules={[{ required: true, message: 'Plaka giriniz!' }]}
                                    >
                                        <label style={{
                                            fontSize: '14px', fontWeight: '500'
                                        }}>
                                            Plaka *
                                    <Input
                                                label="Plaka"
                                                type='plate'
                                                placeholder="Zorunlu alan giriniz"
                                                value={carPlate}
                                                onChange={handleChangeCarPLate}
                                            /></label></Form.Item>
                                </Col>
                                <Col offset={1} span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                    <Form.Item name="phone"
                                        rules={[{ required: true, message: 'Telefon giriniz!' }]}
                                    >
                                        <label style={{
                                            fontSize: '14px', fontWeight: '500'
                                        }}>
                                            Telefon *
                                    <Input
                                                label="Telefon"
                                                type='phone'
                                                placeholder="Zorunlu alan giriniz"
                                                value={phone}
                                                step={1}
                                                onChange={handleChangePhone}
                                            /></label></Form.Item>
                                </Col>
                                <Col offset={1} span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                               
                                <Form.Item name="date-picker">
                                        <label style={{
                                            fontSize: '14px', fontWeight: '500', color:dateValidation ===true ? 'black' : 'red'
                                        }}>
                                            {dateValidation ===true ? 'Tarih *' : 'Tarih Giriniz!'}
                                            <DatePicker
                                                placeholder="Zorunlu alan giriniz"
                                                format={siteConfig.dateFormat}
                                                disabledDate={disabledDate}
                                                onChange={handleChangeDistributionDate}
                                                style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                            // value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
                                            /></label></Form.Item> 
                                </Col>
                                <Col offset={1} span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                    {<label style={{
                                        fontSize: '14px', fontWeight: '500', color:timeValidation ===true ? 'black' : 'red'
                                    }}>
                                            {timeValidation ===true ? 'Saat *' : 'Saat Giriniz!'}
                                {
                                            <TimePicker placeholder="Zorunlu alan giriniz"
                                                showNow={false} disabledMinutes={disabledMinutes} format={format} onChange={handleChangeTime} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                            />}
                                    </label>}
                                </Col>
                            </Row>
                            <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                {<label style={{
                                    fontSize: '14px', fontWeight: '500'
                                }}>
                                Açıklama
                                {
                                      
                                    }
                                </label>}
                            </Col>
                            <TextArea onChange={handleDescription} style={{ marginBottom: '8px', width: view !== 'MobileView' ? '830px' : '100%' }}
                            />
                        </Box>
                        <Table
                            columns={summaryColumns}
                            dataSource={selectedDistributionData}
                            pagination={false}
                            // scroll={{ x: 'max-content' }}
                            scroll={{ x: 1300 }}
                            size="medium"
                            bordered={false}
                            scroll={{ y: 300 }}
                            onRow={(record) => ({
                                onClick: () => (setDistributionItem(record))
                            })}
                            summary={() => {
                                return renderFooter(summaryColumns, selectedDistributionData, false, aggregatesOverall, false)
                            }}
                        />

                        <Row style={{ margin: '10px' }}>
                            <Col align="left" span={view !== 'MobileView' ? 12 : 0} md={view !== 'MobileView' ? null : 24} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Checkbox onChange={handleSubmitCheck}>Tarafınıza vermiş olduğumuz siparişlerden, listede yer alan ürünlerin belirttiğimiz plakalı araca yüklenmesini rica ederiz. Karayollarının Yönetmeliğine uygun tonajda yapılan yükleme sonrası oluşabilecek kaza, hasar, hırsızlık ve tonaj ile ilgili cezai durumlarda sorumluluk tamamen tarafımıza ait olduğunu kabul ve beyan ederiz.</Checkbox>
                            </Col>
                            <Col align={'right'} span={view !== 'MobileView' ? 10 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                <Button key="back" type="primary" onClick={handleCancel}>
                                    Kapat
                              </Button>                              </Col>

                            <Col htmlType="submit" align={'right'} span={view !== 'MobileView' ? 2 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                <Form.Item>
                                    <Button loading={confirmLoading} htmlType="submit"  key="back" type="primary" onClick={handleOk}>
                                        Kaydet
                              </Button>
                                </Form.Item>
                            </Col>
                            <Col>
                            <p><strong>Not:</strong> Aracın kapasitesinden fazla tonaj (yaklaşık 3 ton) planlanmalıdır ve yükleme esnasında oluşabilecek tonaj fazlalığı için kalabilecek ürünler belirtilmelidir.</p>
</Col>
                        </Row>
                    </Form>
                </Modal>
            </Box>
        </LayoutWrapper>
    );
}
