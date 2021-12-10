//React
import React, { useState, useEffect } from "react";

//Components
import Box from "@iso/components/utility/box";
import { Col, Card, Row, Button, Space, Image, Input, Alert } from "antd";
import Form from "@iso/components/uielements/form";

//Fetch
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";

//Configs
import siteConfig from "@iso/config/site.config";
import enumerations from "@iso/config/enumerations";
import numberFormat from "@iso/config/numberFormat";
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import { getSiteMode } from '@iso/lib/helpers/getSiteMode';
import basicStyle from '@iso/assets/styles/constants';
import Modal from "antd/lib/modal/Modal";
//Other Library
import _ from 'underscore';
import moment from 'moment';
import 'moment/locale/tr';
moment.locale('tr');
const CreateDemand = (props) => {
    const { hide, item, onComplete, checkOutPage, demandAmount, confirmLoading, unit, activePeriod, deleteProductBoxByCode } = props;
    const { rowStyle, colStyle, gutter } = basicStyle;
    const [salableBalanceFriendlyText, setSalableBalanceFriendlyText] = useState();
    const [searchSiteMode, setSearchSitemode] = useState();
    const [amountType, setAmountType] = useState();
    const [form] = Form.useForm();

    const [inputDemandAmount, setSelectedDemandAmount] = useState(demandAmount);
    var jwtDecode = require('jwt-decode');

    useEffect(() => {
        getWarehouseList(item.itemCode);
    }, []);

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
        onComplete(false)
    }

    //Talep oluşturma popup kaydetme işlemi seçimlere göre hareket ediyor.
    async function handleSave() {
        onComplete(true, item, inputDemandAmount);
    }
    
    async function deleteBoxProductCode() {
        deleteProductBoxByCode(item.itemCode);
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
                    setSalableBalanceFriendlyText(data.salableBalanceFriendlyText);
                }
            })
            .catch();
        return productInfo;
    }

    //RadioButton değişiklikleri
    function onChangeAmountEntered(e) {
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
                    confirmLoading={confirmLoading}
                    footer={[
                        <Button key="back" onClick={() => deleteBoxProductCode()}>
                            Ürünü Sepetten Çıkar
                        </Button>,
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
                                </div>
                            </Box>

                        </Col>                        
                        <Col md={12} sm={12} xs={24} style={colStyle} >
                        {/* <Alert message={<span style={{color: 'black' }}>Bu talebi {moment(activePeriod.deadline).format(siteConfig.dateFormat)} 23:59 tarihine kadar düzenleyebilirsiniz.</span>} type="warning" showIcon />                             */}
                            <br /><br />
                            <span style={{color: 'red' }}>Seçilmiş olan ürün miktarı fabrika toplam üretim miktarından fazladır. Bu yüzden dolayı talep oluşturabilirsiniz.</span>
                            <br /><br />
                            <Form
                                form={form}
                                layout="vertical"
                                name="form_in_modal"
                                initialValues={{
                                    modifier: 'public',
                                }}
                            >
                                <Form.Item
                                    label="Talep Miktarı">
                                    <Input style={{ width: 100, marginRight:'5px' }} value={inputDemandAmount} onChange={event => onChangeAmountEntered(event)} onClick={event => onSelectAll(event)} />
                                    {unit}

                                    {/* {(item.canBeSoldPartially && searchSiteMode !== enumerations.SiteMode.DeliverysPoint ? 'Toplam Tutar: ' : '') + numberFormat(inputDemandAmount * item.listPrice) + " TL"} */}


                                </Form.Item>
                            </Form>
                            <div className="isoCardContent">
                               
                            </div>
                        </Col>
                    </Row>

                </Modal>
            </Box>
        </React.Fragment>
    );
}
export default CreateDemand;
