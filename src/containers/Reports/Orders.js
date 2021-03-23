//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

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
import { Table, Row, Col, TreeSelect, Tag, Select, Radio } from "antd";

//Fetch
import { usePostOrderReport } from "@iso/lib/hooks/fetchData/usePostOrderReport";
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";

//Styles
import { DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
import renderFooter from "./ReportSummary";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import viewType from '@iso/config/viewType';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import { setSiteMode } from '@iso/lib/helpers/setSiteMode';

//Other Library
import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr';
import enumerations from "../../config/enumerations";
import logMessage from '@iso/config/logMessage';
moment.locale('tr');
var jwtDecode = require('jwt-decode');


const { Panel } = Collapse;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
let sortingField;
let sortingOrder;
const OrdersReport = () => {
    document.title = "Siparişler - Seramiksan B2B";

    const queryString = require('query-string');
    const history = useHistory();
    const [lookupAddressChildren, setLookupAddressChildren] = useState();
    const [searchKey, setSearchKey] = useState('');
    const [tableOptions, setState] = useState({
        sortedInfo: "",
        filteredInfo: ""
    });
    const statusChildren = [];
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(20)
    const [startingPageIndex, setStartingPageIndex] = useState(1);
    const [fromDate, setFromDate] = useState(moment(moment().subtract(0, 'days').toDate()));
    const [toDate, setToDate] = useState(moment(new Date()));
    const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());
    const [dealerCodes, setDealerCodes] = useState()
    const [regionCodes, setRegionCodes] = useState()
    const [fieldCodes, setFieldCodes] = useState();
    const [selectedDealerCode, setSelectedDealerCode] = useState();
    const [selectedRadioItem, setSelectedRadioItem] = useState(1);
    const [privateDate, setPrivateDate] = useState('Bugun');
    const [newUrlParams, setNewUrlParams] = useState('');
    const [address, setAddress] = useState();
    const [status, setSelectedStatus] = useState();
    const location = useLocation();

    //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
    useEffect(() => {
        postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Browse, logMessage.Reports.Order.browse);
        setCurrentPage(pageIndex);
        getVariablesFromUrl();
        const token = jwtDecode(localStorage.getItem("id_token"));
        if ((token.urole === 'dealersv') || (token.urole === 'dealerwhouse') || (token.urole === 'dealerlimited')) {
            getAdress(token.dcode);
        }
    }, [pageIndex]);

    useEffect(() => {
        setChangePageSize(pageSize);
        getVariablesFromUrl()
    }, [pageSize]);

    let searchUrl = queryString.parse(location.search);
    
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderDetailData, aggregatesOverall] =
        usePostOrderReport(`${siteConfig.api.report.postOrders}`, { "DealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes, "from": fromDate !== null ? fromDate.format('YYYY-MM-DD') : null, "to": toDate !== null ? toDate.format('YYYY-MM-DD') : null, "keyword": searchKey, "status": status, "pageIndex": pageIndex - 1, "pageCount": pageSize, "sortingField": sortingField, "sortingOrder": sortingOrder, "addressCodes": address, "siteMode": searchSiteMode }, searchUrl);

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
        const siteMode=getSiteMode();
    
        //site mode paste url manuel.
        if ((siteMode !==  parsed.smode) && (typeof parsed.smode !== 'undefined')) {
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
        setSearchSitemode(siteMode);
        onChangeDealerCode(newDealarCode);

        return setOnChange(true);
    }

    //Sipariş Kalemleri Expand İşlemi
    function expandedRowRender(row, index) {
        let orderDetailIndex;
        let partialUnitData;
        _.each(orderDetailData, (item, i) => {
            if (item.Key === row.orderNo) { return orderDetailIndex = i }
        });
        if (typeof orderDetailIndex !== 'undefined') {
            partialUnitData = _.groupBy(orderDetailData[orderDetailIndex].Value, function (item) { return item.unit; });
        }
        else { partialUnitData = null }
        const r = _.map(partialUnitData, (item) => {
            return (
                <Table
                    columns={OrderDetailcolumns}
                    dataSource={item}
                    pagination={false}
                    bordered={false}
                    summary={() => {
                        return renderFooter(OrderDetailcolumns, item, false)
                    }}
                />);
        });

        return (<React.Fragment>{r} </React.Fragment>);
    };

    //Get Search Data
    function dataSearch(selectedPageIndex, selectedPageSize) {
        const params = new URLSearchParams(location.search);
        const siteMode=getSiteMode();

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

        if ((fromDate !== '' & toDate !== '') && (fromDate !== null & toDate !== null)){
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
        setSearchSitemode(siteMode);

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
        setDealerCodes([]);
        setFieldCodes([]);
        setRegionCodes([]);
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

    //Search DailerName Tree Select Component
    function filterTreeNodeDealerCode(value, treeNode) {
        if (value && treeNode && treeNode.title) {
            const filterValue = value.toLocaleLowerCase('tr')
            const treeNodeTitle = treeNode.title.toLocaleLowerCase('tr')
            return treeNodeTitle.indexOf(filterValue) !== -1;
        }
        return false;
    }

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
        setPageSize(pageSize);
        setPageIndex(current);
        dataSearch(current, pageSize);
    }
    //Select Component Rol değiştirme 
    function addressHandleChange(value) {
        setAddress(value);
    }

    //Change Status Type
    function statusHandleChange(value) {
        setSelectedStatus(value);
    }

    //Get adress
    async function getAdress(dealerCodes) {
        //Get User Info  
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") ||  undefined
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

    //Excel Oluşturma
    const exportExcelButton = () => {
        postSaveLog(enumerations.LogSource.ReportOrders, enumerations.LogTypes.Export, logMessage.Reports.Order.exportExcel);
        ExcelExport(columns, data, 'Siparişler', orderDetailData, OrderDetailcolumns, 'order');
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
    //Order Detail Columns
    const OrderDetailcolumns = [
        {
            title: "Ürün Kodu",
            dataIndex: "itemCode",
            key: "itemCode",
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
            footerKey: "amount",
            width: 50,
        },
        {
            title: "Birim",
            dataIndex: "unit",
            key: "unit",
            width: 50,
        },
        {
            title: "Teslimat Miktarı",
            dataIndex: "deliveryAmount",
            key: "deliveryAmount",
            align: "right",
            render: (deliveryAmount) => numberFormat(deliveryAmount),
            footerKey: "deliveryAmount",
            width: 150,
        },
        {
            title: "Kalan miktar",
            dataIndex: "remainingAmount",
            key: "remainingAmount",
            align: "right",
            render: (remainingAmount) => numberFormat(remainingAmount),
            footerKey: "remainingAmount",
            width: 100,
        },
        {
            title: "Birim fiyat",
            dataIndex: "unitPrice",
            key: "unitPrice",
            align: "right",
            width: 100,
            render: (unitPrice) => numberFormat(unitPrice)
        },
        {
            title: "Sevke Hazır Miktar",
            dataIndex: "distributionSuggestedAmount",
            key: "distributionSuggestedAmount",
            align: "right",
            render: (distributionSuggestedAmount) => numberFormat(distributionSuggestedAmount),
            footerKey: "distributionSuggestedAmount",
            width: 150,
        },
        {
            title: "Dağıtımdaki Miktar",
            dataIndex: "distributionActualAmount",
            key: "distributionActualAmount",
            align: "right",
            render: (distributionActualAmount) => numberFormat(distributionActualAmount),
            footerKey: "distributionActualAmount",
            width: 200,
        },
        {
            title: "",
            dataIndex: "",
            key: "",
            align: "right",
            // render: (distributionActualAmount) => numberFormat(distributionActualAmount),
            footerKey: "",
        },
    ];

    //Order Columns
    let columns = [
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
            title: "Sipariş No",
            dataIndex: "orderNo",
            key: "orderNo",
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.orderNo - b.orderNo,
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderNo' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            width: 150
        },
        {
            title: "Sipariş Tarihi",
            dataIndex: "orderDate",
            key: "orderDate",
            type: "date",
            width: 200,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'orderDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (orderDate, record) => moment(orderDate).format(siteConfig.dateFormat) + ' ' + record.orderTimeStr,
        },
        {
            title: "Cari/DBS",
            dataIndex: "dealerSubCode",
            key: "C-DBS",
            width: 100,
            render: dealerSubCode => (
                <>
                    {!dealerSubCode.endsWith('D') ? (
                        <Tag color={'green'} key={dealerSubCode}>
                            {'CARİ'}
                        </Tag>
                    ) : (
                            <Tag color={'geekblue'} key={dealerSubCode}>
                                {'DBS'}
                            </Tag>
                        )}
                </>
            ),
        },
        {
            title: "Belge No",
            dataIndex: "documentId",
            key: "documentId",
            width: 100,
        },
        {
            title: "Ödeme",
            dataIndex: "payment",
            key: "payment",
            width: 200,
        },
        {
            title: "Adres Kodu",
            dataIndex: "addressCode",
            key: "addressCode",
            width: 150,
        },
        {
            title: "Teslimat Adresi",
            dataIndex: "deliveryAddress",
            key: "deliveryAddress",
            footerKey: 'Genel Toplam',
            width: 200
        },
        {
            title: "Toplam",
            dataIndex: "total",
            key: "total",
            align: "right",
            width: 150,
            render: (total) => numberFormat(total),
            footerKey: "total",
        },
        {
            title: "Durum",
            dataIndex: "status",
            key: "status",
            width: 150
        },
        {
            title: "Açıklama 1",
            dataIndex: "description1",
            key: "description1",
            width: 250
        },
        {
            title: "Açıklama 2",
            dataIndex: "description2",
            key: "description2",
            width: 250
        },
        {
            title: "Açıklama 3",
            dataIndex: "description3",
            key: "description3",
            width: 250
        },
        {
            title: "Açıklama 4",
            dataIndex: "description4",
            key: "description4",
            width: 250
        },
        {
            title: "Bayi Alt Kodu",
            dataIndex: "dealerSubCode",
            key: "dealerSubCode",
            width: 120
        },
        {
            title: "Bölge Kodu",
            dataIndex: "regionCode",
            key: "regionCode",
            width: 120
        },
        {
            title: "Bölge Yöneticisi",
            dataIndex: "regionManager",
            key: "regionManager",
            width: 150
        },
        {
            title: "Saha Kodu",
            dataIndex: "fieldCode",
            key: "fieldCode",
            width: 120
        },
        {
            title: "Saha Yöneticisi",
            dataIndex: "fieldManager",
            key: "fieldManager",
            width: 150
        },
    ];

    //Hide order table column
    //Get Token and Token Decode
    const token = jwtDecode(localStorage.getItem("id_token"));
    if (token.urole === 'admin') { }
    else if (token.urole === 'fieldmanager') {
        const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Field;
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
        const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Region;
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
        const getHideColumns = ColumnOptionsConfig.OrderTableHideColumns.Dealer;
        if (getHideColumns.length > 0) {
            for (let index = 0; index < getHideColumns.length; index++) {
                columns = _.without(columns, _.findWhere(columns, {
                    key: getHideColumns[index].key
                }
                ))
            }
        }
    }

    //hide column Description 1 , Description 2 , Description 3 , Description 4
    let descriptionHide = true;
    for (let index = 1; index < 5; index++) {
        let descriptionTitle = 'description' + index;
        _.each(data, (item, i) => {
            switch (descriptionTitle) {
                case 'description1':
                    if (item.description1 !== '') { return descriptionHide = false }
                    break;
                case 'description2':
                    if (item.description2 !== '') { return descriptionHide = false }
                    break;
                case 'description3':
                    if (item.description3 !== '') { return descriptionHide = false }
                    break;
                case 'description4':
                    if (item.description4 !== '') { return descriptionHide = false }
                    break;
                default:
                    break;
            }
        });

        if (descriptionHide === true) {
            columns = _.without(columns, _.findWhere(columns, {
                dataIndex: descriptionTitle
            }));
        }
    }

    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.orderFollowUp.header" />}
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
                                    mode="multiple"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    placeholder="Durum Seçiniz"
                                    onChange={statusHandleChange}
                                    value={status}
                                >
                                    {statusChildren}
                                </Select>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Input size="small" placeholder="Sipariş No ... giriniz" style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }} value={searchKey} onKeyDown={keyPress} onChange={event => setSearchKey(event.target.value)} />

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
                    className="components-table-demo-nested"
                    columns={columns}
                    dataSource={data}
                    onChange={handleChange}
                    loading={loading}
                    expandable={{ 'expandedRowRender': expandedRowRender }}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    bordered={false}
                    summary={() => {
                        return renderFooter(columns, data, true, aggregatesOverall, true)
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

export default OrdersReport;