
import React from 'react';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import turkishLocale from '@uppy/locales/lib/tr_TR';
import * as _ from 'underscore';
import { ReactSortable } from "react-sortablejs";
import { Form } from 'antd';
import { Card, Button, Row, Col, Select, message, Popconfirm, Tag, Tabs, Radio } from 'antd';
import { DeleteFilled, DragOutlined } from '@ant-design/icons';
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import PageHeader from "@iso/components/utility/pageHeader";
import IntlMessages from "@iso/components/utility/intlMessages";
import siteConfig from "@iso/config/site.config";
import { postSaveLog } from "@iso/lib/hooks/fetchData/postSaveLog";
import enumerations from "../../config/enumerations";
import '../User/Image.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

class ImageUpload extends React.Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();

        this.state = {
            productList: [],
            productImages: [],
            uploadFormModel: [],
            categoricalImageList: [],
            list: [],
            productCode: null,
            otherProductCode: null,
            otherProductDetail: null,
            productType: null,
            isDialogOpen: false,
            btnUpdateOrder: false,
            dialogImageId: 0,
            draggedItem: {},
            productTypeTitle: 'Bağlı Ürün',
            productRelatedTypeTab: enumerations.ProductRelationTypestring.Dependent,
            ProductRelationType: enumerations.ProductRelationTypestring.None,
            dependentProducts: [],
            relatedProducts: [],
        }
        this.sendImagesThrottled = _.throttle(this.onFinishSaveForm, 5000);
        this.updateImageThrottled = _.throttle(this.onFinishUpdateForm, 5000);
        this.updateSortedImagesThrottled = _.throttle(this.updateSortedImages, 5000);

    }

    componentWillUnmount() {
        this.sendImagesThrottled.cancel();
        this.updateImageThrottled.cancel();
        this.updateSortedImagesThrottled.cancel();
    }

    componentDidMount() {
        this.getProducts();
        document.title = "Bağlı ve İlgili Ürün Ekleme - Seramiksan B2B";
    }

    getProducts = () => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        fetch(siteConfig.api.image.getProductsOfImages, requestOptions)
            .then(response => response.json())
            .then(products => {
                this.setState({ productList: products })
            }).catch(error => console.log(error));
    }

    getProductImages = async productCode => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(`${siteConfig.api.products.getProductDetail}${productCode}?includeDependentAndRelatedProductDetails=true`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                this.setState({
                    productImages: data,
                    dependentProducts:data.dependentProducts || [] ,
                    relatedProducts: data.relatedProducts || [] ,
                    productCode: productCode
                });
            }).catch(error => console.log(error));
    }

    getProductRelationType = type => {
        this.setState({ ProductRelationType: type.target.value });
    };

    //Ürün detayı getirme
    getProductDetail = async otherProductCode => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(`${siteConfig.api.product.productDetail}${otherProductCode}`, requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(data => {
                this.setState({
                    otherProductDetail: data,
                    otherProductCode: otherProductCode,
                });
            }).catch(error => console.log(error));
    }

    //Diğer Ürünü getirme işlemi
    getOtherProductImages = async otherProductCode => {
        const { imageTypes } = this.state;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(siteConfig.api.image.getProductImages.replace('{otherProductCode}', otherProductCode), requestOptions)
            .then(response => {
                const status = apiStatusManagement(response);
                return status;
            })
            .then(images => {
                var categoricalImages = [];
                _.each(imageTypes, function (imageType) {
                    let list = _.filter(images, (image) => image.imageType.includes(imageType.imageTypeName));
                    list = _.map(list, (image) => _.extend({ 'canBeMainImage': imageType.isMainImageAllowed }, image))
                    categoricalImages.push(list);
                });
                this.setState({
                    productImages: images,
                    categoricalImageList: categoricalImages,
                    otherProductCode: otherProductCode
                });
            }).catch(error => console.log(error));
    }

    //ilişkili ürün kaydetme
    saveProductRelation = async e => {
        const { otherProductCode, productCode, ProductRelationType } = this.state;
        if ((otherProductCode) && (productCode) && (ProductRelationType !== enumerations.ProductRelationTypestring.None)) {
            const reqBody = { "subsidiaryProductCode": otherProductCode, "mainProductCode": productCode, "relationType": ProductRelationType };

            await fetch(siteConfig.api.product.postProductRelation,
                {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
                    },
                    body: JSON.stringify(reqBody)
                }).then(response => {
                    const status = apiStatusManagement(response);
                    return status;
                })
                .then((data) => setTimeout(() => {
                    if (data.isSuccessful === false) {
                        const getMessage = data.message;
                        message.warning({ content: 'kaydetme işlemi başarısızdır. ' + data.message, getMessage, duration: 2 })
                        this.setState({
                            otherProductDetail: [],
                            ProductRelationType: enumerations.ProductRelationTypestring.None
                        });
                    } else {
                        message.success({ content: 'başarıyla kaydedildi', otherProductCode, duration: 2 })
                        this.setState({
                            dependentProducts: data.dependentProducts|| [] ,
                            relatedProducts: data.relatedProducts|| [] ,
                            otherProductDetail: [],
                            ProductRelationType: enumerations.ProductRelationTypestring.None
                        });
                    }
                })

                ).catch((err) => setTimeout(() => {
                    message.error({ content: 'İşlem başarısız ', otherProductCode, duration: 2 })
                }));

            this.onReset();
        }
    }

    //İlişkili ürün silme
    deleteProductRelation = async value => {
        const { productCode } = this.state;

        const key = 'delete';
        let newSaveOrderUrl = siteConfig.api.product.deleteProductRelation.replace('{mainProductCode}', productCode);
        newSaveOrderUrl = newSaveOrderUrl.replace('{subsidiaryProductCode}', value);
        await fetch(newSaveOrderUrl, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
            }
        }).then(response => {
            const status = apiStatusManagement(response);
            return status;
        })
            .then(data => setTimeout(() => {
                if (data.isSuccessful === false) {
                    const getMessage = data.message;
                    message.warning({ content: 'silme işlemi başarısızdır. ' + data.message, getMessage, duration: 2 })
                } else {
                    message.success({ content: 'silme başarıyla gerçekleştirildi.', value, duration: 2 })
                }

            }, 250))
            .catch((err) => setTimeout(() => {
                message.error({ content: 'ürün silinemedi', key, duration: 2 })
            }, 250));

        this.getProducts()
        this.getProductImages(this.state.productCode)
    }

    onFinishSaveForm = values => {
        var model = {
            Description: values.description,
            ProductCode: values.product,
            ImageTypeId: values.imageType
        }
        this.setState({ uploadFormModel: model })
    };

    onReset = () => {
        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({ product: this.state.productCode });
        this.setState({ otherProductDetail: [] })
    };

    handleShowDialog = (e) => {
        this.setState({
            isDialogOpen: !this.state.isDialogOpen,
            dialogImageId: e
        });
    }

    updateSortedImages = async e => {
        const { categoricalImageList } = this.state
        const key = "update"
        message.loading({ content: 'Güncelleniyor...', key })
        var count = 0

        for (var item in categoricalImageList) {
            for (var i in categoricalImageList[item]) {
                var imagePriorityModel = {
                    ImageId: categoricalImageList[item][i].imageId,
                    ImageOrder: ++count
                }
                await fetch(siteConfig.api.image.updateOrder,
                    {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
                        },
                        body: JSON.stringify(imagePriorityModel)
                    })
                    .then((data) => setTimeout(() => {
                        message.success({ content: 'Fotoğrafların srası başarıyla güncellendi', key, duration: 2 })
                    }, 250)

                    ).catch((err) => setTimeout(() => {
                        message.error({ content: 'İşlem başarısız ', key, duration: 2 })
                    }, 250));
            }
        }
        this.setState({ btnUpdateOrder: false });
        this.getProductImages(this.state.productCode)
    }

    //SORTABLE DRAG - DROP
    handleDragStart = (e) => {
        e.stopPropagation();
        let target = e.target
        this.setState({ draggedItem: target })

        setTimeout(() => {
            target.style.opacity = 0;
        }, 0)
    }

    handleDrop = (e) => {
        e.preventDefault();
        const { draggedItem } = this.state;
        draggedItem.style.opacity = 1;
        this.setState({ btnUpdateOrder: true });
        console.log(this.state.list)
        return false;
    };

    updateState = (e) => {
        const { categoricalImageList } = this.state;
        var tmp = categoricalImageList.slice();

        for (var i in tmp) {
            if (tmp[i].length > 0 && e.length > 0) {
                if (tmp[i][0].imageType === e[0].imageType) {
                    tmp[i] = e;
                    break;
                }
            }
        }
        this.setState({ categoricalImageList: tmp })
    }

    callback = (key) => {
        if (key === enumerations.ProductRelationTypestring.Dependent) { this.setState({ productRelatedTypeTab: enumerations.ProductRelationTypestring.Dependent, productTypeTitle: 'Bağlı Ürün' }); }
        else { this.setState({ productRelatedTypeTab: enumerations.ProductRelationTypestring.Related, productTypeTitle: 'İlgili Ürün' }); }
        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({ product: this.state.productCode })
    }

    render() {
        const { productList, productCode, productTypeTitle, otherProductCode, otherProductDetail, dependentProducts, relatedProducts, productRelatedTypeTab } = this.state;
        let selectedData = [];
        if (productRelatedTypeTab === enumerations.ProductRelationTypestring.Dependent) { selectedData = dependentProducts; }
        else {selectedData = relatedProducts;}
        let relatedProductsCount=0;
        let dependentProductsCount=0;
        
        if(relatedProducts && relatedProducts!==null){relatedProductsCount=relatedProducts.length;}
        if(dependentProducts && dependentProducts!==null){dependentProductsCount=dependentProducts.length}
        
        const tabTitleRelation='İlgili Ürün ('+relatedProductsCount+')';
        const tabTitleDepent='Bağlı Ürün ('+dependentProductsCount+')';

        return (
            <LayoutWrapper>
                <PageHeader>
                    {<IntlMessages id="Bağlı Ve İlgili Ürün Ekleme" />}
                </PageHeader>
                <Box>
                    <Row>
                        {/* select product, search */}
                        <Col style={{ padding: '25px' }} md={12} sm={12} xs={24}>
                            <Form initialValues={{ remember: true }} ref={this.formRef} onFinish={this.sendImagesThrottled}>
                                <h4>Ana Ürün</h4>
                                <Form.Item name="product" rules={[{ required: true, message: 'Lütfen bir ürün seçiniz!' }]}>
                                    <Select showSearch
                                        ref="productCode"
                                        placeholder="Ana Ürün Seçiniz"
                                        optionFilterProp="children"
                                        onChange={this.getProductImages}
                                        value={productCode}
                                        filterOption={(input, option) =>
                                            option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {productList.map(list =>
                                            <Option key={list.productCode} value={list.productCode}>{list.productCode} - {list.productName} - {list.productDescription}</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                                {/*Bağlı veya ilgili ürün seçimi */}
                                <h4>Diğer Ürün</h4>
                                <Form.Item name="other" rules={[{ required: true, message: 'Lütfen bir ürün seçiniz!' }]}>
                                    <Select showSearch
                                        ref="otherProductCode"
                                        placeholder={productTypeTitle + " Seçiniz"}
                                        optionFilterProp="children"
                                        onChange={this.getProductDetail}
                                        value={otherProductCode}
                                        filterOption={(input, option) =>
                                            option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {productList.map(list =>
                                            <Option key={list.productCode} value={list.productCode}>{list.productCode} - {list.productName} - {list.productDescription}</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                                {otherProductDetail !== null ?
                                    <Card key={'image.imageId'}
                                        className="imageCard"
                                        hoverable
                                        style={{ width: '100%', height: '100%', marginTop: '10px' }}
                                        cover={
                                            <div className="divWrapper" >
                                                <div className="image">
                                                    <img style={{ width: '170px' }} alt="" draggable="false" src={otherProductDetail.imageMediumBaseUrl + otherProductDetail.imageMainFileName}
                                                        onClick={() => this.handleShowDialog('image.imageId')}
                                                    />
                                                </div>
                                            </div>
                                        }>
                                        <Meta
                                            title={otherProductDetail.itemCode}
                                            description={otherProductDetail.description}
                                        />
                                        <div className="imageType" >
                                            <Tag color="volcano">{otherProductDetail.category}</Tag>
                                        </div>
                                    </Card> : null}
                                <Form.Item name="productRelationType" rules={[{ required: true, message: 'Lütfen bir ürün ilişki tipi seçiniz!' }]}>
                                    <Radio.Group onChange={this.getProductRelationType} defaultValue={enumerations.ProductRelationTypestring.None}>
                                        <Radio value={enumerations.ProductRelationTypestring.Dependent}>Bağlı Ürün</Radio>
                                        <Radio value={enumerations.ProductRelationTypestring.Related}>İlgili Ürün</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Row >
                                    <Col style={{ textAlign: 'left' }} span={12}>
                                    <Form.Item >
                                            <Button style={{ width: '75%' }} onClick={this.onReset}>TEMİZLE</Button>
                                        </Form.Item>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }} span={12}>                                       
                                        <Form.Item>
                                            <Button style={{ width: '75%' }} type="primary" htmlType="submit" onClick={this.saveProductRelation}>KAYDET</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                        <Col md={12} sm={12} xs={24}>
                            <div style={{ margin: '35px' }}>

                                {/* Bağıl ve İlgili ürün tab sekmeleri */}
                                <Tabs defaultActiveKey="dependentProducts" onChange={this.callback} >
                                    <TabPane tab={tabTitleDepent} key={enumerations.ProductRelationTypestring.Dependent}>
                                    </TabPane>
                                    <TabPane tab={tabTitleRelation} key={enumerations.ProductRelationTypestring.Related}>
                                    </TabPane>
                                </Tabs>
                                {selectedData !== null ?
                                    <div>
                                        <div key={'index'}>
                                            <ReactSortable className="ant-row cardRow" list={selectedData}
                                                setList={newState => this.updateState(newState)} handle=".handle" animation={150}>
                                                {
                                                    selectedData.map(item =>
                                                        <Col md={12} sm={12} xs={24}
                                                            key={item.itemCode}
                                                            style={{ padding: '10px' }}
                                                            onDrop={this.handleDrop}
                                                            onDragStart={this.handleDragStart}>
                                                            <Card
                                                                key={item.itemCode}
                                                                className="imageCard"
                                                                hoverable
                                                                style={{ width: '100%', height: '100%', margin: '10px' }}
                                                                cover={
                                                                    <div className="divWrapper" >
                                                                        <DragOutlined className="handle dragIcon" />
                                                                        <div className="image">
                                                                            <img style={{ width: '170px' }} alt="Fotoğraf Bulunamadı" draggable="false" src={item.imageMediumBaseUrl + item.imageMainFileName}
                                                                                onClick={() => this.handleShowDialog(item.itemCode)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                }
                                                                actions={[
                                                                    <div>
                                                                        <Row >
                                                                            <Col span={8}>
                                                                                <Popconfirm
                                                                                    title="Bu ürünü kaldırmak istediğinizden emin misiniz?"
                                                                                    onConfirm={() => this.deleteProductRelation(item.itemCode)}
                                                                                    okText="Evet"
                                                                                    cancelText="Hayır"
                                                                                >
                                                                                    <Button danger className="buttonDelete" ><DeleteFilled /></Button>
                                                                                </Popconfirm>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                ]}>
                                                                <Meta
                                                                    title={item.itemCode}
                                                                    description={item.description}
                                                                />
                                                                <div className="imageType" >
                                                                    <Tag color="volcano">{item.category}</Tag>
                                                                </div>
                                                            </Card>
                                                        </Col>)
                                                }
                                            </ReactSortable>
                                        </div>
                                    </div> : (<div className="message"><h3 >Gösterilecek {productTypeTitle} Yok...</h3></div>)}

                            </div>
                        </Col>
                    </Row>
                </Box>
            </LayoutWrapper >

        )
    }
}
export default ImageUpload;