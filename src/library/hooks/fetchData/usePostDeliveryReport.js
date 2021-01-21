// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';

function usePostDeliveryReport(url, reqBody, searchUrl) {

    const [data, setData] = useState([]);
    const [deliveryDetailData, setDeliveryDetailData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changePageSize, setChangePageSize] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [totalDataCount, setTotalDataCount] = useState();
    const [onChange, setOnChange] = useState(false);
    const [lastReqBody, setLastReqBody] = useState();
    const [aggregates, setAggregatesOverall] = useState();
    let deliveryIdgetUrlItems = '';
    async function fetchUrl() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        const requestDeliveryDetailOptions = {
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
                    const deliveryIdArrayH = [];
                    const value = data.data.slice();
                    value.forEach((item, index) => {
                        item.key = index;
                        deliveryIdArrayH.push(item.waybillId);
                    });
                    const dataCount = data.totalDataCount;
                    const aggregatesOverall = data.aggregatesOverall;

                    setTotalDataCount(dataCount);
                    setData(value);
                    setAggregatesOverall(aggregatesOverall);

                    setLoading(false);
                    setOnChange(false);
                    setLastReqBody(searchUrl);
                    _.each(deliveryIdArrayH, (deliveryDetailItems, index) => {
                        deliveryIdgetUrlItems += ('waybillId=' + deliveryDetailItems + '&&')
                    });

                    let deliveryDetailUrl = siteConfig.api.report.getDeliveryLineItems;
                    
                    return fetch(`${deliveryDetailUrl}/?${deliveryIdgetUrlItems}`, requestDeliveryDetailOptions) //Delivery Detail Fetch
                        .then(response => {
                            const status = apiStatusManagement(response);
                            return status;
                        })
                        .then(data => {
                            console.log('xxxx d',data);
                            setDeliveryDetailData(data);
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
        if ((reqBody.DealerCodes === undefined) & (reqBody.regionCodes === undefined) & (reqBody.fieldCodes === undefined)) {
            setLoading(false);
            setOnChange(false);
        }
        else {
            if (!_.isEqual(lastReqBody, searchUrl)) {
                setLoading(true);
                fetchUrl();
            } else { setOnChange(false); }
        }
    }, [currentPage, changePageSize, onChange]);
    return [data, loading, currentPage, setCurrentPage, changePageSize, setChangePageSize, totalDataCount, setOnChange, deliveryDetailData, aggregates];
}
export { usePostDeliveryReport };
