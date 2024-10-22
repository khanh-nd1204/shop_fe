import {Cascader, Form, Input, message, Modal, notification, Tabs, Upload} from "antd";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {doUpdateAccountAction} from "../../redux/account/accountSlice.js";
import {changePasswordAPI, updateUserAPI} from "../../services/user.service.js";
import {uploadSingleImageAPI} from "../../services/file.service.js";

const UpdateAccount = (props) => {
    const {openChange, setOpenChange} = props;
    const [userForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [avatar, setAvatar] = useState("");
    const user = useSelector(state => state.account.user);
    const dispatch = useDispatch();
    const [current, setCurrent] = useState("info");
    const provinceList = JSON.parse(localStorage.getItem('province-list'));

    useEffect( () => {
        if (user) {
            userForm.setFieldsValue({
                name: user.name,
                phone: user.phone,
                address: user.address?.split(', ').reverse(),
            });
            setAvatar(user.avatar);
        }
    }, [user]);

    const dummyRequest = async ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 1000);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
            message.error('Image must smaller than 1MB!');
        }
        return isJpgOrPng && isLt1M;
    };

    const onChangeFile = async (info) => {
        if (info.file.status === 'uploading') {
            setLoadingImage(true);
            setAvatar("");
            return;
        }
        if (info.file.status === 'done') {
            const file = info.file.originFileObj;
            const res = await uploadSingleImageAPI(file, "user"); // Tải tệp lên
            setLoadingImage(false);
            if (res.data) {
                setAvatar(res.data); // Cập nhật URL avatar mới
                message.success(res.message);
            } else {
                notification.error({
                    message: res.error,
                    description: res.message,
                    duration: 2
                });
            }
        }
    };

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        const data = {_id: user._id, ...values, avatar};
        setLoading(true);
        const res = await updateUserAPI(data);
        setLoading(false);
        if (res && res.data) {
            dispatch(doUpdateAccountAction({avatar, name: values.name, phone: values.phone, address: values.address}));
            message.success(res.message);
            resetForm();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const changePassword = async (values) => {
        const data = {_id: user._id, ...values};
        setLoading(true);
        const res = await changePasswordAPI(data);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            resetForm();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const resetForm = () => {
        setOpenChange(false);
        userForm.resetFields();
        passwordForm.resetFields();
        setAvatar('');
    };

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            {loadingImage ? <LoadingOutlined /> : <PlusOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    );

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    const infoTab = (
        <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={userForm} style={{padding: "8px 0"}}>
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
                           },
                       ]}>
                <Cascader showSearch={{ filter }} options={provinceList} placeholder="Select address" changeOnSelect placement='topLeft'/>
            </Form.Item>

            <Form.Item label='Avatar' required>
                <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    multiple={false}
                    accept=".png, .jpeg, .jpg"
                    maxCount={1}
                    customRequest={dummyRequest}
                    beforeUpload={beforeUpload}
                    onChange={onChangeFile}
                >
                    {avatar ? (
                        <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/user/${avatar}`}
                            alt="avatar"
                            style={{
                                width: '100%',
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "8px"
                            }}
                        />
                    ) : (
                        uploadButton
                    )}
                </Upload>
            </Form.Item>
        </Form>
    );

    const passwordTab = (
        <Form onFinish={changePassword} autoComplete="off" layout={"vertical"} form={passwordForm} style={{padding: "8px 0"}}>
            <Form.Item
                name="oldPassword"
                label="Current password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your current password!',
                    },
                    {
                        max: 20,
                        min: 6,
                        message: "Password must be between 6 and 20 characters",
                    }
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="password"
                label="New password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your new password!',
                    },
                    {
                        max: 20,
                        min: 6,
                        message: "Password must be between 6 and 20 characters",
                    }
                ]}
            >
                <Input.Password />
            </Form.Item>
        </Form>
    );

    const items = [
        {
            key: 'info',
            label: 'Update info',
            children: infoTab,
        },
        {
            key: 'password',
            label: 'Change password',
            children: passwordTab,
        },
    ];

    return (
        <Modal title="Account Setting" open={openChange} width={600}
               onOk={() => {current === "info" ? userForm.submit() : passwordForm.submit();}}
               forceRender onCancel={() => setOpenChange(false)} maskClosable={false} confirmLoading={loading} okText="Update">
            <Tabs defaultActiveKey="info" items={items} onChange={(key) => setCurrent(key)} />
        </Modal>
    );
}

export default UpdateAccount;