
import React from 'react';
import queryString from 'query-string';
import {
    BrowserRouter as Router,
    Switch,
    useLocation
  } from "react-router-dom";
  
import Uppy from '@uppy/core';
import { Dashboard, ProgressBar } from '@uppy/react';
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import turkishLocale from '@uppy/locales/lib/tr_TR';
import * as _ from 'underscore';
import { ReactSortable } from "react-sortablejs";
import { Form } from 'antd';
import { Input, Card, Modal, Button, Row, Col, Select, message, Divider, Popconfirm, Tag, Badge, Alert } from 'antd';
import { DeleteFilled, DragOutlined, CloseOutlined } from '@ant-design/icons';
import Box from "@iso/components/utility/box";
import LayoutWrapper from "@iso/components/utility/layoutWrapper.js";
import PageHeader from "@iso/components/utility/pageHeader";
import IntlMessages from "@iso/components/utility/intlMessages";
import siteConfig from "@iso/config/site.config";
import './Image.css';

const { TextArea } = Input;
const { Option } = Select;

class ImageUpload extends React.Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();

        this.state = {
            productList: [],
            imageTypes: [],
            productImages: [],
            filesUppy: [],
            filesToSend: [],
            uploadFormModel: [],
            base64Str: [],
            categoricalImageList: [],
            list: [],
            productCode: null,
            isDialogOpen: false,
            btnUpdateOrder: false,
            dialogImageId: 0,
            draggedItem: {}
        }
        this.sendImagesThrottled = _.throttle(this.onFinishSaveForm, 5000);
        this.updateImageThrottled = _.throttle(this.onFinishUpdateForm, 5000);
        this.updateSortedImagesThrottled = _.throttle(this.updateSortedImages, 5000);

        this.setUppy()
    }

    setUppy = () => {
        this.uppy = new Uppy({
            meta: { type: 'image' },
            restrictions: {
                maxNumberOfFiles: 10,
                maxFileSize: 1000000000,
                minNumberOfFiles: 1,
                allowedFileTypes: ['image/*'],
            },
            locale: turkishLocale,
            id: 'uppy',
            autoProceed: false,
            debug: true
        })
            .on("upload-error", (file, error) => {
                message.error(error)
            })
            .on("complete", async result => {
                this.setState({ filesUppy: [], base64Str: [] })
                const countFile = (result.successful).length;
                if (countFile > 0) {
                    for (let count = 0; count < countFile; count++) {
                        const file = result.successful[count].data;
                        const { filesUppy } = this.state;
                        const tmp = filesUppy.slice();
                        tmp.push(file);

                        this.setState({ filesUppy: tmp });
                        await this.getBase64(file)
                    }
                    this.setImageModel()
                }
            })
    }

    async getBase64(file) {
        let result = await this.getBase64Async(file);

        const { base64Str } = this.state;
        const tmp = base64Str.slice();
        tmp.push({ "str": result });
        this.setState({ base64Str: tmp })
    }

    getBase64Async(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
                resolve(reader.result)
            }
            reader.onerror = reject;
        })
    }

    componentWillUnmount() {
        this.uppy.close()
        this.sendImagesThrottled.cancel();
        this.updateImageThrottled.cancel();
        this.updateSortedImagesThrottled.cancel();
    }

    componentDidMount() {
        this.getProducts();
        this.getImageTypes();
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

    getImageTypes = () => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        fetch(siteConfig.api.image.getTypes, requestOptions)
            .then(response => response.json())
            .then(imageTypes => {
                this.setState({ imageTypes: imageTypes })
                this.getVariablesFromUrl();
            }).catch(error => console.log(error));
    }

    getProductImages = async productCode => {
        const { imageTypes } = this.state;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            }
        };
        await fetch(siteConfig.api.image.getProductImages.replace('{productCode}', productCode), requestOptions)
            .then(response => response.json())
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
                    productCode: productCode
                });
            }).catch(error => console.log(error));
    }

    getVariablesFromUrl() {
        let query = window.location.search.substring(1);
        if(query!==''){let productItemCode = query.split("&"); this.setState({productCode:productItemCode[0]}); this.getProductImages(productItemCode[0]);}        
    }

    //api' ye dosya gönderme
    sendImageModel = async e => {
        const { filesToSend } = this.state;

        const key = 'upload';
        message.loading({ content: 'Kaydediliyor...', key })

        if (filesToSend.length > 0) {
            for (var i in filesToSend) {
                var ImageUploadModel = filesToSend[i];
                await fetch(siteConfig.api.image.uploadImage,
                    {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
                        },
                        body: JSON.stringify(ImageUploadModel)
                    })
                    .then((data) => setTimeout(() => {
                        message.success({ content: 'Dosya başarıyla kaydedildi', key, duration: 2 })
                    }, 250)

                    ).catch((err) => setTimeout(() => {
                        message.error({ content: 'İşlem başarısız ', key, duration: 2 })
                    }, 250));
                this.getProductImages(this.state.productCode)
            }
        }
        this.setState({
            filesUppy: [],
            filesToSend: [],
            base64Str: [],
            uploadFormModel: []
        });
        this.onReset();
        this.setUppy();
    }

    setImageModel = () => {
        const { filesUppy, base64Str, filesToSend, uploadFormModel } = this.state;

        for (var i in filesUppy) {

            let imageInfo = {
                FileName: filesUppy[i].name,
                Base64Str: base64Str[i].str,
                Size: filesUppy[i].size,
                Description: uploadFormModel.Description,
                ProductCode: uploadFormModel.ProductCode,
                ImageTypeId: uploadFormModel.ImageTypeId
            };

            filesToSend.push(imageInfo);
            this.setState({
                filesToSend: filesToSend
            })
        }
        this.sendImageModel();

    }

    deleteImage = async value => {
        const key = 'delete';
        message.loading({ content: 'Siliniyor...', key })

        await fetch(siteConfig.api.image.deleteImage + value, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
            }
        })
            .then(data => setTimeout(() => {
                message.success({ content: 'Fotoğraf başarıyla silindi', key, duration: 2 })
            }, 250))
            .catch((err) => setTimeout(() => {
                message.error({ content: 'Fotoğraf silinemedi', key, duration: 2 })
            }, 250));

        this.getProducts()
        this.getProductImages(this.state.productCode)
    }

    onFinishSaveForm = values => {
        this.uppy.upload();
        var model = {
            Description: values.description,
            ProductCode: values.product,
            ImageTypeId: values.imageType
        }
        this.setState({ uploadFormModel: model })
    };

    onReset = () => {
        this.formRef.current.resetFields();
        this.formRef.current.setFieldsValue({ product: this.state.productCode })
    };

    setAsMainImage = async imageId => {
        const { productList, productCode } = this.state;
        var productObject = productList.find(item => item.productCode === productCode);
        productObject.mainImageId = imageId;

        const key = 'update';
        message.loading({ content: 'Kaydediliyor...', key })
        await fetch(siteConfig.api.image.updateProduct,
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
                },
                body: JSON.stringify(productObject)
            })
            .then((data) => setTimeout(() => {
                message.success({ content: 'Ana Fotoğraf Olarak Ayarlandı', key, duration: 2 })
            }, 250)

            ).catch((err) => setTimeout(() => {
                message.error({ content: 'İşlem başarısız ', key, duration: 2 })
            }, 250));

        this.getProducts()
        this.getProductImages(this.state.productCode)
    }

    handleShowDialog = (e) => {
        this.setState({
            isDialogOpen: !this.state.isDialogOpen,
            dialogImageId: e
        });
    }

    onFinishUpdateForm = async values => {
        const { dialogImageId } = this.state;
        var productImagesModel = {
            ImageId: dialogImageId,
            Description: values.imageDescription,
            ImageTypeId: values.imageTypeId
        }

        const key = 'update';
        message.loading({ content: 'Güncelleniyor...', key })

        await fetch(siteConfig.api.image.updateImageInfo,
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("id_token") || undefined
                },
                body: JSON.stringify(productImagesModel)
            })
            .then((data) => setTimeout(() => {
                message.success({ content: 'Fotoğraf bilgileri güncellendi', key, duration: 2 })
            }, 250)

            ).catch((err) => setTimeout(() => {
                message.error({ content: 'İşlem başarısız ', key, duration: 2 })
            }, 250));

        this.getProducts();
        this.getProductImages(this.state.productCode)
        this.setState({ isDialogOpen: false })
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

    render() {
        const { productList, productImages, imageTypes, btnUpdateOrder, isDialogOpen, dialogImageId, categoricalImageList, productCode } = this.state;
        return (
            <LayoutWrapper>
                <PageHeader>
                    {<IntlMessages id="Ürün Fotoğrafları" />}
                </PageHeader>
                <Box>
                    <Row>
                        <Col span={24} style={{ padding: '0 25px' }}>
                            <Alert
                                message="Fotoğraf Yükleme Yardım"
                                description="Sol bölümdeki ürün listesinden kod ya da adla arama yaparak ürün seçiniz. 'Gözat' ile yüklemek istediğiniz görseli seçiniz. Fotoğraf tipini seçerek Kaydet'e tıklayınız. Eğer mevcut görsellerde silme işlemi yapmak istiyorsanız, sağ bölümde listenen görsel üzerindeki Çöp Tenekesi ikonuna basarak silme yapabilirsiniz. Düzenleme yapmak için, görsel üzerine tıklayınız ve açılan pencerede fotoğraf tipini/açıklamasını değiştirebilirsiniz."
                                type="info"
                                showIcon closable
                            />
                        </Col>
                    </Row>
                    <Row>
                        {/* select product, search */}
                        <Col style={{ padding: '25px' }} span={10}>
                            <Form initialValues={{ remember: true }} ref={this.formRef} onFinish={this.sendImagesThrottled}>
                                <Form.Item name="product" rules={[{ required: true, message: 'Lütfen bir ürün seçiniz!' }]}>
                                    <Select showSearch
                                        ref="productCode"
                                        placeholder="Ürün Seçiniz"
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
                                {/* image upload */}
                                <Form.Item  >
                                    <Dashboard height={400} uppy={this.uppy} plugins={['Dahsboard']} inline={true} />
                                </Form.Item>
                                {/* image type */}
                                <Form.Item name="imageType" rules={[{ required: true, message: 'Lütfen bir fotoğraf tipi seçiniz!' }]}>
                                    <Select placeholder="Fotoğraf Tipi Seçiniz" >
                                        {imageTypes.map(list =>
                                            <Option key={list.imageTypeId} value={list.imageTypeId}>{list.imageTypeName}</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                                {/* description */}
                                <Form.Item name="description" rules={[{ required: false, message: 'Lütfen bir açıklama giriniz!' }]}>
                                    <TextArea placeholder="Fotoğraflar için bir açıklama giriniz..." allowClear />
                                </Form.Item>
                                <Row >
                                    <Col style={{ textAlign: 'left' }} span={12}>
                                        <Form.Item>
                                            <Button style={{ width: '75%' }} type="primary" htmlType="submit">KAYDET</Button>
                                        </Form.Item>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }} span={12}>
                                        <Form.Item >
                                            <Button style={{ width: '75%' }} onClick={this.onReset}>İPTAL</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>

                        {/* image display , delete, update, sort*/}
                        <Col span={14}>
                            <div style={{ margin: '35px' }}>
                                {productImages.length > 0 ?
                                    <div>
                                        <Row className="topRow" style={{ height: 40 }} >
                                            <Col span={18}>
                                                <h4>Bu ürüne ait toplam {productImages.length} fotoğraf vardır.</h4>
                                            </Col>
                                            <Col span={6}>
                                                {btnUpdateOrder ?
                                                    <Button style={{ float: 'right', zIndex: 3 }} type="primary" onClick={this.updateSortedImagesThrottled}>Güncel Sıralamayı Kaydet</Button>
                                                    : ''
                                                }
                                            </Col>
                                        </Row>
                                        {categoricalImageList.map((imageList, index) =>
                                            <div key={index}>
                                                {imageList.length > 0 ?
                                                    <Divider style={{ paddingLeft: '25px', marginTop: '35px' }} orientation="right" plain>{imageList[0].imageType}</Divider>
                                                    : null}
                                                <ReactSortable className="ant-row cardRow" list={imageList}
                                                    setList={newState => this.updateState(newState)} handle=".handle" animation={150}>
                                                    {
                                                        imageList.map(image =>
                                                            <Col span={6}
                                                                key={image.imageId}
                                                                style={{ padding: '10px', order: productList.some(item => item.mainImageId === image.imageId) ? -1 : 1 }}
                                                                onDrop={this.handleDrop}
                                                                onDragStart={this.handleDragStart}>
                                                                <Card key={image.imageId}
                                                                    className="imageCard"
                                                                    hoverable
                                                                    style={{ width: '100%', height: '100%', margin: '10px' }}
                                                                    cover={
                                                                        <div className="divWrapper" >
                                                                            {productList.some(item => item.mainImageId === image.imageId) ?
                                                                                <div className="imageBadge">
                                                                                    <Badge count={'Ana Foto'} />
                                                                                </div>
                                                                                : null
                                                                            }
                                                                            <DragOutlined className="handle dragIcon" />
                                                                            <div className="image">
                                                                                <img style={{ width: '170px' }} alt="Fotoğraf Bulunamadı" draggable="false" src={image.imagePath}
                                                                                    onClick={() => this.handleShowDialog(image.imageId)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    actions={[
                                                                        <div>
                                                                            <Row >
                                                                                <Col span={8}>
                                                                                    <Popconfirm
                                                                                        title="Bu fotoğrafı silmek istediğinizden emin misiniz?"
                                                                                        onConfirm={() => this.deleteImage(image.imageId)}
                                                                                        okText="Evet"
                                                                                        cancelText="Hayır"
                                                                                    >
                                                                                        <Button danger className="buttonDelete" ><DeleteFilled /></Button>
                                                                                    </Popconfirm>
                                                                                </Col>
                                                                                <Col span={16}>
                                                                                    {_.any(imageList, (item) => item.canBeMainImage) ?
                                                                                        _.any(productList, (item) => item.mainImageId === image.imageId) ?
                                                                                            <Button className="buttonMainImage" disabled>Ana Foto. Yap</Button>
                                                                                            :
                                                                                            <Button className="buttonMainImage" draggable="false" onClick={() => this.setAsMainImage(image.imageId)} >Ana Foto. Yap</Button>
                                                                                        : null}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    ]}>
                                                                    <div className="imageType" >
                                                                        <Tag color="volcano">{image.imageType}</Tag>
                                                                    </div>
                                                                    <div style={{ marginTop: '10px' }}>
                                                                        <p className="imageDescription">{image.description || '-'}</p>
                                                                    </div>
                                                                    <div className="imageDate">
                                                                        <i>{image.imageUploadDateStr}</i>
                                                                    </div>
                                                                </Card>
                                                                {isDialogOpen && image.imageId == dialogImageId ?
                                                                    <Modal visible={isDialogOpen} title="Fotoğraf Güncelleme" okText="Güncelle" cancelText="İptal" closable footer={null} onCancel={this.handleShowDialog}>
                                                                        <img
                                                                            draggable="false"
                                                                            className="imageDialog"
                                                                            src={image.imagePath}
                                                                            alt="Fotoğraf Bulunamadı"
                                                                            style={{ width: '99%' }}
                                                                        />
                                                                        <Form onFinish={this.updateImageThrottled} style={{ marginTop: '15px' }} >
                                                                            <Form.Item name="imageDescription" initialValue={image.description} rules={[{ required: false, message: 'Lütfen bir açıklama giriniz!' }]}>
                                                                                <TextArea onChange={this.onChangeDescription} allowClear />
                                                                            </Form.Item>
                                                                            <Form.Item name="imageTypeId" >
                                                                                <Select placeholder={image.imageType}>
                                                                                    {imageTypes.map(item =>
                                                                                        <Option key={item.imageTypeId} value={item.imageTypeId}>{item.imageTypeName}</Option>
                                                                                    )}
                                                                                </Select>
                                                                            </Form.Item>
                                                                            <Button style={{ width: '100%' }} type="primary" htmlType="submit">Güncelle</Button>
                                                                        </Form>
                                                                    </Modal>
                                                                    : null}
                                                            </Col>)
                                                    }
                                                </ReactSortable>
                                            </div>)}
                                    </div> : (<div className="message"><h3 >Gösterilecek fotoğraf yok...</h3></div>)}

                            </div>
                        </Col>
                    </Row>
                </Box>
            </LayoutWrapper >

        )
    }
}
export default ImageUpload;