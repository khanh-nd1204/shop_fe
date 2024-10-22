import {Cascader, Form, Input, message, Modal, notification, Upload} from "antd";
import {useEffect, useState} from "react";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {updateUserAPI} from "../../services/user.service.js";
import {uploadSingleImageAPI} from "../../services/file.service.js";
import {useDispatch, useSelector} from "react-redux";
import {doUpdateAccountAction} from "../../redux/account/accountSlice.js";

const UpdateUser = (props) => {
    const {openUpdate, setOpenUpdate, getUserList, userSelected, setUserSelected} = props;
    const [updateUserForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [_id, setId] = useState("");
    const [avatar, setAvatar] = useState("");
    const [loadingImage, setLoadingImage] = useState(false);
    const user = useSelector(state => state.account.user);
    const dispatch = useDispatch();
    const provinceList = JSON.parse(localStorage.getItem('province-list'));

    useEffect(() => {
        if (userSelected) {
            updateUserForm.setFieldsValue({
                name: userSelected.name,
                email: userSelected.email,
                phone: userSelected.phone,
                address: userSelected.address?.split(', ').reverse()
            });
            setId(userSelected._id);
            setAvatar(userSelected.avatar);
        }
    }, [userSelected]);

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        const data = {_id, ...values, avatar};
        setLoading(true);
        const res = await updateUserAPI(data);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            if (_id === user._id) {
                dispatch(doUpdateAccountAction({avatar, name: values.name, phone: values.phone, address: values.address}));
            } else {
                await getUserList();
            }
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
        setOpenUpdate(false);
        setUserSelected({});
        updateUserForm.resetFields();
        setAvatar("");
        setId("");
    };

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

    return (
        <Modal title="Update User" open={openUpdate} onOk={() => updateUserForm.submit()} forceRender width={650}
               onCancel={resetForm} maskClosable={false} confirmLoading={loading} okText="Update">
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={updateUserForm} style={{padding: "8px 0"}}>
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

                <Form.Item label="Email" name="email">
                    <Input disabled={true}/>
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
                    <Cascader showSearch={{ filter }} options={provinceList} placeholder="Select address" changeOnSelect placement='topLeft' />
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
        </Modal>
    );
}

export default UpdateUser;