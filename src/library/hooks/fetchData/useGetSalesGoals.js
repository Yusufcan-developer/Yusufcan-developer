// hooks.js
import { useState, useEffect } from "react";
import siteConfig from "@iso/config/site.config";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import _ from 'underscore';
import { message } from "antd";

function useGetSalesGoalsReport(url, reqBody, searchUrl, year, month, regionCode, fieldCode) {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [changePageSize, setChangePageSize] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [onChange, setOnChange] = useState(false);
    const [lastReqBody, setLastReqBody] = useState();

    let salesGoalsParams = '';
    async function fetchUrl() {
        setLastReqBody(searchUrl);
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
                if (data !== undefined) {
                    if (data.isSuccessful === false) {
                        message.warning(data.message)
                    }}
            })
            .catch(
                setOnChange(false)
            );
    }
    useEffect(() => {
        if (!_.isEqual(lastReqBody, searchUrl)) {
            setLoading(true);
            fetchUrl();
        } else { setOnChange(false); }
    
}, [currentPage, changePageSize, onChange]);
    return [data, loading, setOnChange];
}
export { useGetSalesGoalsReport };
