import {Cascader, Form, Input, message, Modal, notification} from "antd";
import {useState} from "react";
import {createUserAPI} from "../../services/user.service.js";
import {useSelector} from "react-redux";

const CreateUser = (props) => {
    const {openCreate, setOpenCreate, getUserList} = props;
    const [createUserForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const provinceList = JSON.parse(localStorage.getItem('province-list'));

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        setLoading(true);
        const res = await createUserAPI(values);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            resetForm();
            await getUserList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const resetForm = () => {
        setOpenCreate(false);
        createUserForm.resetFields();
    }

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <Modal title="Create User" open={openCreate} onOk={() => createUserForm.submit()} width={650}
               onCancel={resetForm} maskClosable={false} confirmLoading={loading} okText="Create">
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={createUserForm} style={{padding: "8px 0"}}>
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

                <Form.Item label="Email" name="email"
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input your email!',
                               },
                               {
                                   type: 'email',
                                   message: 'Invalid email!'
                               },
                               {
                                   max: 100,
                                   message: 'Email must be less than 100 characters',
                               },
                           ]}>
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password" name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                        {
                            max: 20,
                            min: 6,
                            message: "Password must be between 6 and 20 characters",
                        }
                    ]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label="Phone" name="phone"
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
                               }
                           ]}>
                    <Cascader showSearch={{ filter }} options={provinceList} placeholder="Select address" changeOnSelect />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CreateUser;