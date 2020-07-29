import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Select, TreeSelect, Radio, Cascader, DatePicker, InputNumber, Switch } from 'antd';


export default function UserModel() {

    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(true);

    const [userName, setUserName] = useState();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [password, setPassword] = useState();
    const [email, setEmail] = useState();
    const [dealerCodes, setDealerCodes] = useState()
    const [regionCodes, setRegionCodes] = useState()
    const [fieldCodes, setFieldCodes] = useState();

    const [componentSize, setComponentSize] = useState('default');
    const onFormLayoutChange = ({ size }) => {
        setComponentSize(size);
    };

    function showModal() {
        setVisible(true);
    };
    function handleOk() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setVisible(false);
        }, 3000);
    };
    function handleCancel() {
        setVisible(false);
    };
    return (
        <>
            <Modal
                visible={visible}
                title="Yeni Kullanıcı"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        İptal
          </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleOk}
                    >
                        Kaydet
          </Button>
                ]}
            >
                <Form
                    labelCol={{
                        span: 4,
                    }}
                    wrapperCol={{
                        span: 14,
                    }}
                    layout="horizontal"
                    initialValues={{
                        size: componentSize,
                    }}
                    onValuesChange={onFormLayoutChange}
                    size={componentSize}
                >
                    <Form.Item label="Kullanıcı adı">
                        <Input value={userName} />
                    </Form.Item>
                    <Form.Item label="Ad">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Soyad">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Şifre">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Rol">
                        <Input />
                    </Form.Item>
                </Form>
                <Form.Item label=" Bayi Kodu">
                    <TreeSelect
                        //   treeData={treeData}
                        //   value={selectedDealerCode}
                        //   onChange={onChangeDealerCode}
                        treeCheckable={true}
                        //   showCheckedStrategy={TreeSelect.SHOW_PARENT}
                        placeholder={"Bayi Kodu Seçiniz"}
                        showSearch={true}
                        style={{ marginBottom: '8px', width: '250px' }}
                        dropdownMatchSelectWidth={500}
                    />
                </Form.Item>
                <Form.Item label="Bölge Kodu">
                    <TreeSelect
                        //   treeData={treeData}
                        //   value={selectedDealerCode}
                        //   onChange={onChangeDealerCode}
                        treeCheckable={true}
                        //   showCheckedStrategy={TreeSelect.SHOW_PARENT}
                        placeholder={"Bölge Kodu Seçiniz"}
                        showSearch={true}
                        style={{ marginBottom: '8px', width: '250px' }}
                        dropdownMatchSelectWidth={500}
                    />
                </Form.Item>
                <Form.Item label="  Saha Kodu">
                    <TreeSelect
                        //   treeData={treeData}
                        //   value={selectedDealerCode}
                        //   onChange={onChangeDealerCode}
                        treeCheckable={true}
                        //   showCheckedStrategy={TreeSelect.SHOW_PARENT}
                        placeholder={"Saha Kodu Seçiniz"}
                        showSearch={true}
                        style={{ marginBottom: '8px', width: '250px' }}
                        dropdownMatchSelectWidth={500}
                    />
                </Form.Item>
            </Modal>
        </>
    );
}