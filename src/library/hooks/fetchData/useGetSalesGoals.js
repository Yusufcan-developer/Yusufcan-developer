// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';

function useGetSalesGoalsReport(url, reqBody, searchUrl, year, month, regionCode, fieldCode) {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changePageSize, setChangePageSize] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [onChange, setOnChange] = useState(false);
    const [lastReqBody, setLastReqBody] = useState();

    let salesGoalsParams = '';
    async function fetchUrl() {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        let newUrl = url.replace('{year}', year);
        newUrl = newUrl.replace('{month}', month);
        if (regionCode && regionCode.length > 0) {
            salesGoalsParams += ('regionCode=' + regionCode);
        }
        if (fieldCode && fieldCode.length > 0) {
            salesGoalsParams += ('fieldCode=' + fieldCode);
        }

        return fetch(`${newUrl}/?${salesGoalsParams}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                setOnChange(false);
                setData(data);
            })
            .catch(
                setData(),
                setOnChange(false)
            );
    }
    useEffect(() => {
        // if ((reqBody.DealerCodes === undefined) & (reqBody.regionCodes === undefined) & (reqBody.fieldCodes === undefined)) {
        //     setLoading(false);
        //     setOnChange(false);
        // }
        // else {
        //     if (!_.isEqual(lastReqBody, searchUrl)) {
        //         setLoading(true);
        //         fetchUrl();
        //     } else { setOnChange(false); }
        // }
        fetchUrl();
    }, [currentPage, changePageSize, onChange]);
    return [data, loading, setOnChange];
}
export { useGetSalesGoalsReport };
