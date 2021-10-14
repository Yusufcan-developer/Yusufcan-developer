//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import PageHeader from "@iso/components/utility/pageHeader";
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import DatePicker from "@iso/components/uielements/datePicker";
import { Table, Col, Tag, Modal, Input, message, Layout, Button } from "antd";
import Select, { SelectOption } from '@iso/components/uielements/select';

//Fetch
import { useFetch } from "@iso/lib/hooks/fetchData/usePostApi";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Style
import { EditOutlined, DownloadOutlined } from '@ant-design/icons';

//Configs
import siteConfig from "@iso/config/site.config";
import ColumnOptionsConfig from "../../config/ColumnOptions.config";
import ReportPagination from "./ReportPagination";
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
import Item from "antd/lib/list/Item";
moment.locale('tr');
var jwtDecode = require('jwt-decode');
const { RangePicker } = DatePicker;
const { TextArea } = Input;

let sortingField;
let sortingOrder;
export default function () {
    document.title = "Dönemler - Seramiksan B2B";
    const { Content } = Layout;
    const [form] = Form.useForm();
    const Option = SelectOption;
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
    const [deadlineDate, setDeadlineDate] = useState(null);
    const [toDate, setToDate] = useState(moment(new Date()));
    const [regionCodes, setRegionCodes] = useState();
    const [fieldCodes, setFieldCodes] = useState();
    const [newUrlParams, setNewUrlParams] = useState('');
    const [selectedRadioItem, setSelectedRadioItem] = useState(1);
    const [privateDate, setPrivateDate] = useState('Bugun');
    const [address, setAddress] = useState();
    const [status, setStatus] = useState();
    const [selectedDimensions, setSelectedDimensions] = useState();
    const [searchSiteMode, setSearchSitemode] = useState(getSiteMode());

    const [demandDatePeriod, setDemandDatePeriod] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState();
    const [dateValidation, setDateValidation] = useState(true);
    const [deletePeriodVisible, setDeletePeriodVisible] = useState(false);

    const location = useLocation();
    const queryString = require('query-string');
    const history = useHistory();

    //Burada ki useEffect'ler page index page size
    useEffect(() => {
        setCurrentPage(pageIndex);
        getVariablesFromUrl();
        setOnRefreshMode(true);
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
        setStatus(getStatus);

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
        return setOnChange(true);
    }

    //Get Search Data
    function dataSearch(selectedPageIndex, selectedPageSize) {
        const params = new URLSearchParams(location.search);
        const siteMode = getSiteMode();

        params.delete('smode');
        params.delete('keyword');
        params.delete('pgsize');
        params.delete('pgindex');
        params.delete('sortingField');
        params.delete('sortingOrder');
        params.delete('status');

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

    //Change from and To date
    function changeDatePickerFromAndTo(value, dateString) {
        if (value !== null) {
            setFromDate(moment(dateString[0] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
            setToDate(moment(dateString[1] + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        }
        else {
            setToDate(null);
            setFromDate(null);
        }
    }
    //Change deadline
    function changeDatePicker(value, dateString) {
        if (value !== null) {
            setDeadlineDate(moment(dateString + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        }
        else {
            setDeadlineDate(null);
        }
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

    //Talep kaydetme işlemi
    async function postSavePeriod() {
        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const dealerCode = token.dcode;
        // setDemandConfirmLoading(true);
        const reqBody = { "id": selectedPeriodId, "startDate": fromDate.format('YYYY-MM-DD'), "endDate": toDate.format('YYYY-MM-DD'), "deadline": deadlineDate.format('YYYY-MM-DD') }
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        await fetch(siteConfig.api.report.postPeriods, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (typeof data !== 'undefined') {
                    if (data.isSuccessful === false) {
                        const getMessage = data.message;
                        message.warning({ content: 'kaydetme işlemi başarısızdır. ' + getMessage, duration: 2 });
                    } else {
                        message.success({ content: 'başarıyla kaydedildi', duration: 2 });
                        setDemandDatePeriod(false);
                        setFromDate(null);
                        setToDate(null);
                        setDeadlineDate(null);
                        setSelectedPeriodId();
                        setOnRefreshMode(true);
                    }
                }
            })
            .catch();
    }

    //Periyod seçme ve düzenleme işlemi
    function selectedPeriod(item) {
        if (item) {
            setToDate(moment(item.endDate));
            setFromDate(moment(item.startDate));
            setDeadlineDate(moment(item.deadline));
            setSelectedPeriodId(item.id)
            setDemandDatePeriod(true);
        }
    }
    //Periyod Silme işlemi
    function deletePeriodShowPopup(item) {
        setSelectedPeriodId(item.id);
        setFromDate(moment(item.startDate + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        setToDate(moment(item.endDate + 'T00:00:00-00:00', 'DD-MM-YYYY' + 'THH:mm:ss', null));
        setDeletePeriodVisible(true);
    }
    //Period Columns
    let columns = [
        {
            title: "Durumu",
            dataIndex: "isActive",
            key: "isActive",
            width: 50,
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
            dataIndex: "startDate",
            key: "startDate",
            width: 100,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'startDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (startDate, record) => moment(startDate).format(siteConfig.dateFormat),
        },
        {
            title: "Bitiş Tarihi",
            dataIndex: "endDate",
            key: "endDate",
            width: 100,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'endDate' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (endDate, record) => moment(endDate).format(siteConfig.dateFormat),
        },
        {
            title: "Son Teslim Tarihi",
            dataIndex: "deadline",
            key: "deadline",
            width: 100,
            sorter: (a, b) => (''),
            sortOrder: tableOptions.sortedInfo.columnKey === 'deadline' && tableOptions.sortedInfo.order,
            sortDirections: ['descend', 'ascend'],
            render: (deadline, record) => moment(deadline).format(siteConfig.dateFormat),
        },
        {
            dataIndex: 'operation',
            width: 100,
            render: (_, record, rowIndex) => {
                return (
                    <React.Fragment>

                        <a onClick={() => selectedPeriod(record)}>
                            <i className="ion-android-create" />
                        </a>
                        <a onClick={() => deletePeriodShowPopup(record)} style={{ marginLeft: '15px' }}>
                            <i className="ion-android-close" />
                        </a>
                    </React.Fragment>
                )
            },
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
    const showCreatePeriodPopup = () => {
        setDemandDatePeriod(true);
    }
    //Excel Oluşturma
    const exportExcelButton = () => {
        postSaveLog(enumerations.LogSource.ReportAccountTransactions, enumerations.LogTypes.Export, logMessage.Reports.TransactionAccount.exportExcel);
        ExcelExport(columns, data, 'Dönemler');
    }

    //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
    function handleCancel() {
        setDemandDatePeriod(false);
        setDeletePeriodVisible(false);
        setDeadlineDate(null);
        setFromDate(null);
        setToDate(null);
        setSelectedPeriodId();
    };

    //Talep tarih periyodu oluşturma işlemi
    async function handleCreatePeriod() {
        if ((fromDate === null) || (toDate === null) || (deadlineDate === null)) {
            message.warning('Lütfen tarih giriniz...');
        }
        else {
            postSavePeriod();
        }
    }

    //Kural silme fetch işlemi
    async function deletePeriod() {
        //Get User Info
        let productInfo;
        const requestOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",

                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(`${siteConfig.api.report.deletePeriods}${selectedPeriodId}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (data.isSuccessful === true) {
                    message.info('Dönem Silme işlemi başarılıdır.'); postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Delete, selectedPeriodId + logMessage.Period.successDelete); handleCancel(); setOnRefreshMode(true);

                }
                else if (data.isSuccessful === false) { message.error('Dönem Silme işlemi başarısızdır. ' + data.message); postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Delete, selectedPeriodId + logMessage.Period.delete); }
                else { message.error('Dönem Silme işlemi başarısızdır. ' + data.message); postSaveLog(enumerations.LogSource.General, enumerations.LogTypes.Delete, selectedPeriodId + logMessage.Period.delete); }
            })
            .catch();
        return productInfo;
    }
    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.period.header" />}
            </PageHeader>
            {/* <Box>
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
                                    placeholder="Aktiflik durumu seçiniz"
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    onChange={statusHandleChange}
                                    optionFilterProp="children"
                                    value={status}
                                >
                                    <Option value={true}>Aktif</Option>
                                    <Option value={false}>Pasif</Option>
                                </Select>
                            </Col>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Button style={{ marginBottom: '8px', width: view !== 'MobileView' ? '125px' : '100%' }} type="primary" onClick={searchButton}>
                                    {<IntlMessages id="forms.button.label_Search" />}
                                </Button>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>
            </Box> */}
            {/* Data list volume */}
            <Box>
                <ReportPagination
                    onShowSizeChange={onShowSizeChange}
                    onChange={currentPageChange}
                    pageSize={pageSize}
                    total={totalDataCount}
                    current={pageIndex}
                    position="top"
                />

                <Col span={8} offset={16} align="right"  >
                    <Button type="primary" size="small" style={{ marginBottom: '5px' }}
                        icon={<EditOutlined />} onClick={showCreatePeriodPopup}>
                        {<IntlMessages id="forms.button.createPeriod" />}
                    </Button>
                    <Button type="primary" size="small" style={{ marginBottom: '5px', margin: '2px' }}
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
                    scroll={{ x: 'max-content' }}
                    size="medium"
                    bordered={false}
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
            <Modal
                visible={demandDatePeriod}
                title="Talep Oluşturma Dönemi Belirleme"
                okText="Kaydet"
                cancelText="İptal"
                maskClosable={false}
                onCancel={handleCancel}
                onOk={() => {
                    form
                        .validateFields()
                        .then(values => {
                            form.resetFields();
                            handleCreatePeriod(values);
                        })
                        .catch(info => {
                            console.log('Validate Failed:', info);
                        });
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{
                        modifier: 'public',
                    }}
                >
                    <Form.Item
                        label={dateValidation === true ? 'Başlangıç - Bitiş Tarihi *' : 'Tarih Giriniz!'} style={{
                            color: dateValidation === true ? 'black' : 'red'
                        }}

                    >
                        <RangePicker
                            format={siteConfig.dateFormat}
                            onChange={changeDatePickerFromAndTo}
                            value={fromDate !== null ? [moment(fromDate, siteConfig.dateFormat), moment(toDate, siteConfig.dateFormat)] : null}
                        />
                    </Form.Item>
                    <Form.Item
                        label={dateValidation === true ? 'Son Teslim Tarihi *' : 'Tarih Giriniz!'} style={{
                            color: dateValidation === true ? 'black' : 'red'
                        }}

                    >
                        <DatePicker
                            format={siteConfig.dateFormat}
                            onChange={changeDatePicker}
                            value={deadlineDate}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                visible={deletePeriodVisible}
                title={fromDate === null ? null : fromDate.format('DD-MM-YYYY') + ' / ' + toDate.format('DD-MM-YYYY') + " tarih aralığını kapsayan periyod silinecektir"}
                okText="Sil"
                cancelText="İptal"
                maskClosable={false}
                onCancel={handleCancel}
                onOk={deletePeriod}
            >
                <p>{fromDate === null ? null : fromDate.format('DD-MM-YYYY') + ' / ' + (toDate.format('DD-MM-YYYY')) + ' periyodu silme işlemi gerçekleştirilecektir. Devam etmek istiyor musunuz?'}</p>

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
        </LayoutWrapper>
    );
}
