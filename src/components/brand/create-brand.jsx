import {Form, Input, message, Modal, notification, Select, Upload} from "antd";
import {useState} from "react";
import {createBrandAPI} from "../../services/brand.service.js";
import {uploadSingleImageAPI} from "../../services/file.service.js";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";

const CreateBrand = (props) => {
    const {openCreate, setOpenCreate, getBrandList, countries} = props;
    const [createBrandForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState("");
    const [loadingLogo, setLoadingLogo] = useState(false);

    const onFinish = async (values) => {
        const data = {...values, logo};
        setLoading(true);
        const res = await createBrandAPI(data);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            resetForm();
            await getBrandList();
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
        setLogo('');
        createBrandForm.resetFields();
    }

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
            setLoadingLogo(true);
            setLogo("");
            return;
        }
        if (info.file.status === 'done') {
            const file = info.file.originFileObj;
            const res = await uploadSingleImageAPI(file, "brand"); // Tải tệp lên
            setLoadingLogo(false);
            if (res.data) {
                setLogo(res.data); // Cập nhật URL avatar mới
                message.success(res.message);
            } else {
                notification.error({
                    message: res.error,
                    description: res.message,
                    duration: 2
                });
            }
        }
    }

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            {loadingLogo ? <LoadingOutlined /> : <PlusOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    )

    return (
        <Modal title="Create Brand" open={openCreate} onOk={() => createBrandForm.submit()}
               onCancel={resetForm} maskClosable={false} confirmLoading={loading} okText="Create">
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={createBrandForm} style={{padding: "8px 0"}}>
                <Form.Item label="Name" name="name"
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input brand name!',
                               },
                               {
                                   max: 100,
                                   message: 'Brand name must be less than 100 characters',
                               },
                           ]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Country" name="country"
                    rules={[
                        {
                            required: true,
                            message: 'Please input country name!',
                        },
                        {
                            max: 100,
                            message: 'Country name must be less than 100 characters',
                        },
                    ]}>
                    <Select
                        showSearch
                        placeholder="Select a country"
                        optionFilterProp="label"
                        options={countries}
                    />
                </Form.Item>

                <Form.Item label='Logo' required>
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
                        {logo ? (
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/images/brand/${logo}`}
                                alt="logo"
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

export default CreateBrand;