import {Cascader, Form, Input, message, Modal, notification, Select, Upload} from "antd";
import {useEffect, useState} from "react";
import {updateOrderAPI} from "../../services/order.service.js";
import {useSelector} from "react-redux";

const UpdateOrder = (props) => {
    const {openUpdate, setOpenUpdate, getOrderList, orderSelected, setOrderSelected} = props;
    const [updateOrderForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const provinceList = JSON.parse(localStorage.getItem('province-list'));

    useEffect(() => {
        if (orderSelected) {
            updateOrderForm.setFieldsValue({
                name: orderSelected.name,
                phone: orderSelected.phone,
                address: orderSelected.address?.split(', ').reverse(),
                addressDetail: orderSelected.addressDetail,
                status: orderSelected.status,
            });
        }
    }, [orderSelected]);

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        const data = {_id: orderSelected._id, ...values};
        setLoading(true);
        const res = await updateOrderAPI(data);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            resetForm();
            await getOrderList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const resetForm = () => {
        setOpenUpdate(false);
        setOrderSelected({});
        updateOrderForm.resetFields();
    };

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    const options = [
        { value: 'Pending', label: 'Pending', disabled: true},
        { value: 'Processing', label: 'Processing', disabled: orderSelected.status === 'Shipping' || orderSelected.status === 'Delivered'},
        { value: 'Shipping', label: 'Shipping', disabled: orderSelected.status === 'Delivered'},
        { value: 'Delivered', label: 'Delivered' },
    ]

    return (
        <>
            <Modal title="Update Order" open={openUpdate} onOk={() => updateOrderForm.submit()} forceRender
                   onCancel={resetForm} maskClosable={false} confirmLoading={loading} okText="Update">
                <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={updateOrderForm} style={{padding: "8px 0"}}>
                    <Form.Item label="Name" name="name"
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input your name!',
                                   },
                                   {
                                       max: 100,
                                       message: 'Name must be less than 100 characters',
                                   },
                               ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Phone" name="phone"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your phone number!',
                            },
                            {
                                pattern: new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g),
                                message: "Invalid phone number!"
                            },
                            {
                                max: 10,
                                min: 10,
                                message: "Phone number should be 10 digits",
                            },
                        ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Address" name="address"
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input your address!',
                                   },
                               ]}>
                        <Cascader showSearch={{ filter }} options={provinceList} placeholder="Select address" changeOnSelect placement='topLeft' />
                    </Form.Item>

                    <Form.Item label="Address detail" name="addressDetail"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your address detail!',
                            },
                            {
                                max: 100,
                                message: 'Address detail must be less than 100 characters',
                            },
                        ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Satus" name="status"
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input order status!',
                                   },
                               ]}>
                        <Select options={options} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default UpdateOrder;