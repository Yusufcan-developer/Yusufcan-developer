//React
import React, { useState, useEffect } from "react";

//Components
import Box from "@iso/components/utility/box";
import { Col, Card, Row, Button, Badge, notification, Typography, Tooltip, Space, Image, Input, message, Radio } from "antd";
import Scrollbar from '@iso/components/utility/customScrollBar';

//Redux
import { useDispatch, useSelector } from 'react-redux';

//Fetch
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import basicStyle from '@iso/assets/styles/constants';

//Other Library
import _ from 'underscore';
import logMessage from '@iso/config/logMessage';

//Desing style
import { SingleCardWrapper } from '../Products/Shuffle.styles';
import {
    InfoCircleOutlined
} from '@ant-design/icons';
import Modal from "antd/lib/modal/Modal";
const CreateDemand = (props) => {
    const { hide, item, onComplete, checkOutPage, demandAmount } = props;

    const { rowStyle, colStyle, gutter } = basicStyle;
    const [partialAmount, setPartialAmount] = useState(0);
    const [palletAmount, setPalletAmount] = useState(0);
    const [salableBalanceFriendlyText, setSalableBalanceFriendlyText] = useState();
    const [partialQuantity, setPartialQuantity] = useState(false);
    const [searchSiteMode, setSearchSitemode] = useState();
    const [warningQuantity, setWarningQuantity] = useState(0);
    const [changeQuantity, setChangeQuantity] = useState(true);
    const [selectedDemand, setSelectedDemand] = useState();
    const [inputDemandAmount, setSelectedDemandAmount] = useState(demandAmount);
    var jwtDecode = require('jwt-decode');

    useEffect(() => {
        if (changeQuantity === true) {
            const token = jwtDecode(localStorage.getItem("id_token"));
            getCartList();
        }
        getWarehouseList(item.itemCode);
    }, [changeQuantity]);

    const siteMode = getSiteMode();

    async function getCartList() {
        let productInfo;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        const siteMode = getSiteMode();
        const token = jwtDecode(localStorage.getItem("id_token"));
        const activeUser = localStorage.getItem("activeUser")
        let apiUrl = '';
        if (activeUser !== null) { apiUrl = `${siteConfig.api.carts.getGetByAccountNo}${activeUser}?includeUpdateDetails=true&siteMode=${siteMode}`; }
        else { apiUrl = `${siteConfig.api.carts.cartGetDefault}?includeUpdateDetails=true&siteMode=${siteMode}` }
        if (!token.uname) { return 'Unauthorized' }

        await fetch(apiUrl, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response, true);
                return status;
            })
            .then(data => {
            })
            .catch();
        return productInfo;
    }

    //Modallardan iptal işlemine tıklanıldığı zaman temizleme işlemi ve modalların kapatılması.
    async function handleCancel(item) {
        const token = jwtDecode(localStorage.getItem("id_token"));
        if ((typeof item.dependentProductCodes === 'undefined' || item.dependentProductCodes.length === 0) || (warningQuantity <= 0)) {
            setPartialQuantity(false);
            onComplete();
        }
        else {
            message.warning(warningQuantity <= 0 ? null : <span style={{ color: 'red' }}>{warningQuantity} {searchSiteMode !== enumerations.SiteMode.DeliverysPoint && item.unit === 'M2' ? 'M2' : item.unit !== 'TOR' ? 'Adet' : 'Torba'} Bağlı ürün eklemeniz gerekmektedir.</span>);
        }

    }

    //Talep oluşturma popup kaydetme işlemi seçimlere göre hareket ediyor.
    async function handleSave(params) {
        switch (selectedDemand) {
            case 1:
                onComplete(false)
                break;
            case 2:
                onComplete(true,item,inputDemandAmount)
                break;
            case 3:
                onComplete(true,item,inputDemandAmount)
                break;
            case 4:
                onComplete(true,item,inputDemandAmount)
                break;
            default:
                break;
        }
    }
    //Miktar girilen text alanında tüm değerleri seçiyor
    function onSelectAll(event) {
        event.target.select();
    }

    //Get Warehouse Amount Data
    async function getWarehouseList(itemCode) {
        let productInfo;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };

        await fetch(`${siteConfig.api.warehouse}${itemCode}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                let palletQuantity = 0;
                let partialQuantity = 0;
                if (data.balances.length > 0) {
                    _.each(data.balances, (item) => {
                        if (item.warehouseName === 'PALETLİ SATIŞ AMBARI') { palletQuantity += item.balance } else {
                            partialQuantity += item.balance;
                        }
                    });
                    setPalletAmount(palletQuantity);
                    setPartialAmount(partialQuantity);
                    setSalableBalanceFriendlyText(data.salableBalanceFriendlyText);
                }
            })
            .catch();
        return productInfo;
    }

    //Talep oluşturma durumları seçimi
    const onChangeRadioButton = e => {
        setSelectedDemand(e.target.value);
        switch (e.target.value) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                setSelectedDemandAmount(demandAmount);
                break;
            default:
                break;
        }
    }

    //RadioButton değişiklikleri
    function onChangeDemandAmount(e) {
        if (!isNaN(e.target.value)) {
            setSelectedDemandAmount(parseInt(e.target.value));
        }
    }
    
        return (
        <React.Fragment>
            <Box>
                <Modal
                    title={item.itemCode + ' - ' + item.description}
                    visible={hide}
                    width={750}
                    onCancel={event => handleCancel(item)}
                    maskClosable={false}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            İptal
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleSave}
                        >
                            Kaydet
                        </Button>
                    ]}>
                    {/* { Eklenmesi gereken ürün sayısı bilgisi } */}
                    {<Col style={{ width: '100%' }} align="center">
                        {warningQuantity <= 0 ? null : <span style={{ color: 'red' }}>{warningQuantity} {searchSiteMode !== enumerations.SiteMode.DeliverysPoint && item.unit === 'M2' ? 'M2' : item.unit !== 'TOR' ? 'Adet' : 'Torba'} Bağlı ürün eklemeniz gerekmektedir.</span>}
                    </Col>}
                    <Row style={rowStyle} gutter={gutter} justify="start">
                        <Col md={12} sm={12} xs={24} style={colStyle} >
                            <Box>
                                <Card bodyStyle={{ textAlign: 'center' }}>
                                    {<Image
                                        key={`customnav-slider--key${item.imageUrl}`}
                                        src={item.imageMediumBaseUrl + item.imageMainFileName}
                                    />}
                                </Card>
                                <div className="isoCardContent">
                                    <span className="isoCardDate" style={{ minHeight: '70px', color: 'black' }}>
                                        <Col className="isoCardTitle" align="center" >
                                            {item.descriptionExtra}
                                        </Col>
                                    </span>
                                    <div className="isoCardTitle" style={{ textAlign: 'center' }}>{(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Palet: ' : '') + numberFormat(item.listPrice)} {"TL"} {'/'} {item.unit}
                                        {item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? (<React.Fragment><br /> {'Parçalı: ' + numberFormat(item.partialPrice)} {"TL"} {'/'} {item.unit}</React.Fragment>) : null}<br />

                                    </div>
                                </div>
                            </Box>

                        </Col>
                        <Col md={12} sm={12} xs={24} style={colStyle} >
                            <span style={{ fontWeight: 'bold', color: 'red' }}>Seçilmiş olan ürün miktarı fabrika toplam üretim miktarından fazladır. Bu yüzden dolayı talep oluşturabilirsiniz.</span>
                            <br /><br />
                           
                            <Radio.Group onChange={onChangeRadioButton} value={selectedDemand} style={{paddingBottom:'25px'}} >
                                <Space direction="vertical">
                                    <Radio value={1}>Talep Oluşturma</Radio>
                                    <Radio value={2}>Fazla Miktarı Kadar</Radio>
                                    <Radio value={3}>Tamamını Oluştur</Radio>
                                    <Radio value={4}>
                                        Kendim Girmek İstiyorum...
                                        {selectedDemand === 4 ? <Input style={{ width: 100, marginLeft: 10 }} value={inputDemandAmount} onChange={event => onChangeDemandAmount(event)} onClick={event => onSelectAll(event)} /> : null}
                                    </Radio>
                                </Space>
                            </Radio.Group>
                            <div className="isoCardContent">
                                <div className="isoCardTitle">{(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Talep Miktarı: ' : '') + inputDemandAmount} {item.unit}
                                </div>
                            </div>
                            <div className="isoCardContent">
                                <div className="isoCardTitle">{(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Toplam Tutar: ' : '') +numberFormat(inputDemandAmount * item.listPrice) + " TL" }
                                </div>
                            </div>
                        </Col>
                    </Row>

                </Modal>
            </Box>
        </React.Fragment>
    );
}
export default CreateDemand;
