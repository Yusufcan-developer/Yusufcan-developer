import enumerations from "../../config/enumerations";

export const getSiteMode = () => {
    const siteMode = localStorage.getItem('siteMode');
    if (typeof siteMode === 'undefined' || siteMode === null) { return enumerations.SiteMode.Admin; }
    return siteMode;
};