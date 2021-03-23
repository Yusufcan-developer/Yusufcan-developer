import enumerations from "../../config/enumerations";

export const getSiteMode = () => {
    const siteMode = localStorage.getItem('siteMode');    
    if(siteMode ===null){return enumerations.SiteMode.Normal;}
    return siteMode;
};