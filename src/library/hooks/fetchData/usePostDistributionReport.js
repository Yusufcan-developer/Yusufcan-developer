// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';

function usePostDistributionReport(url, reqBody, searchUrl) {

    const [data, setData] = useState([]);
    const [distributionDetailData, setDistributionDetailData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changePageSize, setChangePageSize] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [totalDataCount, setTotalDataCount] = useState();
    const [onChange, setOnChange] = useState(false);
    const [lastReqBody, setLastReqBody] = useState();
    const [aggregates, setAggregatesOverall] = useState();
    let distributionIdgetUrlItems = '';
    async function fetchUrl() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        const requestDistributionDetailOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };

        await fetch(url, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                if (data.data !== undefined) {
                    const distributionIdArrayH = [];
                    const value = data.data.slice();
                    value.forEach((item, index) => {
                        item.key = index;
                        distributionIdArrayH.push(item.distributionNo);
                    });
                    const dataCount = data.totalDataCount;
                    const aggregatesOverall = data.aggregatesOverall;

                    setTotalDataCount(dataCount);
                    setData(value);
                    setAggregatesOverall(aggregatesOverall);

                    setLoading(false);
                    setOnChange(false);
                    setLastReqBody(searchUrl);
                    _.each(distributionIdArrayH, (distributionDetailItems, index) => {
                        distributionIdgetUrlItems += ('distributionNo=' + distributionDetailItems + '&&')
                    });

                    let distributionDetailUrl = siteConfig.api.report.getDistributionLineItems;
                    
                    return fetch(`${distributionDetailUrl}/?${distributionIdgetUrlItems}`, requestDistributionDetailOptions) //Delivery Detail Fetch
                        .then(response => {
                            const status = apiStatusManagement(response);
                            return status;
                        })
                        .then(data => {
                            setDistributionDetailData(data);
                        })
                        .catch();
                }
                else {
                    setLoading(false);
                    setOnChange(false);
                }
            })
            .catch(setOnChange(false));
    }
    useEffect(() => {
            if (!_.isEqual(lastReqBody, searchUrl)) {
                setLoading(true);
                fetchUrl();
            } else { setOnChange(false); }
    }, [currentPage, changePageSize, onChange]);
    return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, distributionDetailData, aggregates];
}
export { usePostDistributionReport };
