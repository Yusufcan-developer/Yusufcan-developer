

import Gauge from "../Gauge/Gauge";

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
import { Table, Row, Col, TreeSelect, Tag, Select, BackTop, Radio } from "antd";

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

//Other Library
import ExcelExport from "./ExcelExport";
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr';
import enumerations from "../../config/enumerations";
import logMessage from '@iso/config/logMessage';
moment.locale('tr');
var jwtDecode = require('jwt-decode');

const SalesTarget = () => {
    document.title = "Satış Hedefleri - Seramiksan B2B";

    const queryString = require('query-string');
    const history = useHistory();

    const location = useLocation();

    //Burada ki useEffect'ler page index page size ve tarih değişimlerinde hook'ları tetikleyip yeni sorgu sonuçlarına göre veri getiriyor.
    useEffect(() => {
    }, []);

    let searchUrl = queryString.parse(location.search);
    //Rapor
    const [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, orderDetailData, aggregatesOverall] =
        usePostOrderReport(`${siteConfig.api.report.postOrders}`, { }, searchUrl);


    const view = viewType('Reports');
    const filterView = viewType('Filter');
    return (
        <LayoutWrapper>
            <PageHeader>
                {<IntlMessages id="page.salesTarget.header" />}
            </PageHeader>
           
            {/* Data list volume */}
            <Box >
                <Gauge
                    
                />
                
            </Box>
        </LayoutWrapper>
    );
}

export default SalesTarget;
