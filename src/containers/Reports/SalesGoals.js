

import Gauge from "../Gauges/SalesGoalsGauge";

//React
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';

//Components
import Form from "@iso/components/uielements/form";
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import IntlMessages from "@iso/components/utility/intlMessages";
import PageHeader from "@iso/components/utility/pageHeader";
import { Col, Row, Button, TreeSelect, Select, Collapse } from "antd";

//Fetch
import { useGetTreeData } from "@iso/lib/hooks/fetchData/useGetTreeData";
import { useGetSalesGoalsReport } from "@iso/lib/hooks/fetchData/useGetSalesGoals";
import { useFilterData } from "@iso/lib/hooks/fetchData/useFilterData";

//Configs
import siteConfig from "@iso/config/site.config";
import dateMonthList from "@iso/config/dateMonthList";
import viewType from '@iso/config/viewType';

//Other Library
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr';
import SalesGoalsGauge from "../Gauges/SalesGoalsGauge";
moment.locale('tr');
const { Panel } = Collapse;
const FormItem = Form.Item;
const { Option } = Select;

const SalesTarget = () => {
    document.title = "Satış Hedefleri - Seramiksan B2B";

    const yearsChildren = [];
    const queryString = require('query-string');
    const history = useHistory();
    const location = useLocation();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [regionCodes, setRegionCodes] = useState()
    const [fieldCodes, setFieldCodes] = useState();
    const [selectedFieldOrRegionCode, setSelectedFieldOrRegionCode] = useState();
    const [newUrlParams, setNewUrlParams] = useState('');
    let searchUrl = queryString.parse(location.search);
    let searchText = '';

    //Rapor
    const [salesData, loading, setOnChange] =
        useGetSalesGoalsReport(`${siteConfig.api.report.getSalesTarget}`, '', searchUrl, year, month, regionCodes, fieldCodes);

    if (salesData !== undefined) {
        let monthText = '';
        if (salesData.isSuccessful !== false) {
            let criteria
            if (salesData.year !== null) {
                if (salesData.month !== null) { monthText = ' ' + 'Ay: ' + salesData.month }
                criteria = 'Yıl: ' + salesData.year + monthText;
            }
            if (salesData.fieldCode !== null) { criteria += ' Saha kodu: ' + salesData.fieldCode }
            if (salesData.regionCode !== null) { criteria += ' Bölge kodu: ' + salesData.regionCode }
            searchText = criteria;
        }
    }
    //Bayi,Bölge ve Saha kodlarının getirilmesi
    const [treeData] = useGetTreeData(`${siteConfig.api.security.getAccountsTree}?excludeDealer=true`, searchUrl);

    //Years
    const [years] = useFilterData(`${siteConfig.api.lookup.getYears}`, searchUrl);
    for (let i = 0; i < years.length; i++) {
        yearsChildren.push(<Option key={years[i]}>{years[i]}</Option>);
    }

    //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
    useEffect(() => {
    }, []);

    const gaugeCount = ['KARO', 'YAPIKIMYASALI', 'VITRIFIYE', 'BANYOMOBILYASI', 'KAMPANYA', 'KAMPANYA2', 'TOPLAM'];
    const view = viewType('Reports');
    const filterView = viewType('Filter');

    //Search Button Event
    const searchButton = () => {
        const params = new URLSearchParams(location.search);

        params.delete('year');
        params.delete('month');
        params.delete('region');
        params.delete('field');


        if (year !== undefined) { params.append('year', year); }
        if (month !== undefined) { params.append('month', month); }
        if (regionCodes) { params.append('region', regionCodes); }
        if (fieldCodes) { params.append('field', fieldCodes) }
        let createUrl = null;
        if (newUrlParams.length > 0) { createUrl = newUrlParams + '&' + params; } else { createUrl = params }
        history.push(`${location.pathname}?${createUrl}`);

        return setOnChange(true);
    };

    //Change Year
    function handleChangeYear(value) {
        setYear(value);
    }

    //Change Month
    function handleChangeMonth(value) {
        setMonth(value);
    }

    //Change Field or Region code
    async function onChangeDealerCode(value) {
        let fieldArrObj = [];
        let regionArrObj = [];
        setFieldCodes([]);
        setRegionCodes([]);

        if (value.length === 0) { setFieldCodes(fieldArrObj); setRegionCodes(regionArrObj); setSelectedFieldOrRegionCode([]) }
        else {
            if (value.split("|").length === 1) { fieldArrObj.push(value); setFieldCodes(fieldArrObj); }
            else if (value.split("|").length === 2) {
                regionArrObj.push(value.split("|")[1]); setRegionCodes(regionArrObj);
            }
            setSelectedFieldOrRegionCode(value);
        }
    };
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.salesGoals.header" />}
            </PageHeader>
            <Box style={{ marginBottom: '15px' }}>
                <Collapse accordion defaultActiveKey={filterView !== 'MobileView' ? ['0'] : null}>
                    <Panel header={<IntlMessages id="page.filtered" />} key="0">
                        {view !== 'MobileView' ?
                            <Row>
                                <Col span={view !== 'MobileView' ? 6 : 0} >
                                    <FormItem label={<IntlMessages id="page.fieldAndRegionTitle" />}></FormItem>
                                </Col>
                                {/* <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24} >
                                    <FormItem label={<IntlMessages id="page.yearList" />}></FormItem>
                                </Col> */}
                                <Col span={view !== 'MobileView' ? 4 : 0} >
                                    <FormItem label={<IntlMessages id="page.monthList" />}></FormItem>
                                </Col>
                            </Row>
                            : null}
                        <Row>
                            <Col span={view !== 'MobileView' ? 6 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <TreeSelect
                                    treeData={treeData}
                                    onChange={onChangeDealerCode}
                                    value={selectedFieldOrRegionCode}
                                    dropdownStyle={{ maxHeight: 400, }}
                                    placeholder={"Saha veya Bölge Kodu Seçiniz"}
                                    showSearch={true}
                                    style={{ marginBottom: '8px', width: view !== 'MobileView' ? '250px' : '100%' }}
                                    dropdownMatchSelectWidth={350}
                                />
                            </Col>
                                {/* <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Select
                                    placeholder='Yıl seçiniz'
                                    style={{ width: view !== 'MobileView' ? '120px' : '100%' }}
                                    onChange={handleChangeYear}
                                    value={year}
                                    defaultValue={year}
                                >
                                    {yearsChildren}
                                </Select>
                            </Col> */}
                            <Col span={view !== 'MobileView' ? 4 : 0} md={view !== 'MobileView' ? null : 12} sm={view !== 'MobileView' ? null : 12} xs={view !== 'MobileView' ? null : 24}>
                                <Select
                                    placeholder='Ay seçiniz'
                                    style={{ width: view !== 'MobileView' ? '150px' : '100%' }}
                                    onChange={handleChangeMonth}
                                    value={month}
                                    defaultValue={month}
                                >
                                    {dateMonthList()}
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

            </Box>
            {/* Data list volume */}
            <Box >
                <Col span={8} align="left" style={{ marginBottom: '20px', fontWeight: 'bold' }}  >
                    {searchText.length > 0 && <span>{searchText}</span>}
                </Col>
                <Row gutter={[24, 16]}>
                    {salesData !== undefined ?
                        gaugeCount.map((item) => (
                            <Col xs={{ span: 12 }} sm={{ span: 12 }} lg={{ span: 8 }}  >
                                <SalesGoalsGauge
                                    value={salesData}
                                    item={item}
                                /></Col>
                        )) : null}
                </Row>
            </Box>
        </LayoutWrapper>
    );
}

export default SalesTarget;
