import {Button, Col, Form, Image, Input, InputNumber, message, notification, Row, Select, Upload} from "antd";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {getAllBrandAPI} from "../../services/brand.service.js";
import {uploadSingleImageAPI} from "../../services/file.service.js";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import {updateProductAPI} from "../../services/product.service.js";

const UpdateProduct = () => {
    const [updateProductForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { TextArea } = Input;
    const [images, setImages] = useState([]);
    const [imagesTemp, setImagesTemp] = useState([]);
    const [loadingImage, setLoadingImage] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const location = useLocation();
    const brandData = JSON.parse(localStorage.getItem('brand-list'));


    useEffect(() => {
        if (location.state) {
            updateProductForm.setFieldsValue({
                name: location.state.name,
                brand: location.state.brand,
                price: location.state.price,
                quantity: location.state.quantity,
                sold: location.state.sold,
                discount: location.state.discount,
                battery: parseInt(location.state.detail?.battery),
                camera: parseInt(location.state.detail?.camera),
                gpu: location.state.detail?.gpu,
                chip: location.state.detail?.chip,
                ram: parseInt(location.state.detail?.ram),
                rom: parseInt(location.state.detail?.rom),
                description: location.state.description
            });
            setImages(location.state.images);
            const arrImages = location.state.images?.map(item => {
                return {
                    uid: uuidv4(),
                    name: item,
                    status: "done",
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/product/${item}`
                }
            })
            setImagesTemp(arrImages);
        }
    }, [])


    const onFinish = async (values) => {
        const filteredImages = images
            .filter(item1 => {
                if (item1.uid) {
                    return imagesTemp.some(item2 => item2.status === "done" && item2.uid === item1.uid);
                } else {
                    return imagesTemp.some(item2 => item2.status === "done" && item2.name === item1);
                }
            })
            .map(item => {
                return item.name ? item.name : item;
            });
        if (filteredImages.length === 0) {
            message.error('Please upload product images!');
        }
        const {battery, camera, gpu, chip, ram, rom, ...others} = values;
        const data = {
            _id: location.state._id,
            ...others,
            detail: {
                battery: `${battery} mAh`,
                camera: `${camera} MP`,
                gpu,
                chip,
                ram: `${ram}GB`,
                rom: `${rom}GB`
            },
            images: filteredImages
        }
        setLoading(true);
        const res = await updateProductAPI(data);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            resetForm();
            navigate('/admin/product');
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const dummyRequest = async ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 1000);
    };

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
            file.status = "error";
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
            message.error('Image must smaller than 1MB!');
            file.status = "error";
        }
        return isJpgOrPng && isLt1M;
    };

    const handleChange = (info) => {
        setImagesTemp(info.fileList);
        if (info.file.status === 'uploading') {
            setLoadingImage(true);
            return;
        }
        if (info.file.status === 'done') {
            uploadImage(info.file.originFileObj);
            setLoadingImage(false);
        }
    };

    const uploadImage = async (file) => {
        const res = await uploadSingleImageAPI(file, "product");
        if (res.data) {
            setImages((image) => [...image, {
                name: res.data,
                uid: file.uid
            }])
            // message.success(res.message);
        } else {
            notification.error({
                message: "Error",
                description: res.message,
                duration: 2
            });
        }
    }

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const resetForm = () => {
        updateProductForm.resetFields();
        window.history.replaceState({}, '');
    }

    return (
        <>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Update Product</div>
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={updateProductForm} style={{padding: "8px 0"}}>
                <Row gutter={48}>
                    <Col span={8}>
                        <Form.Item label="Name" name="name"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product name!',
                                       },
                                       {
                                           max: 100,
                                           message: 'Product name must be less than 100 characters',
                                       },
                                   ]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Brand" name="brand"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product brand!',
                                       },
                                   ]}>
                            <Select
                                showSearch
                                placeholder="Select a brand"
                                optionFilterProp="label"
                                options={brandData}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Price" name="price"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product price!',
                                       },
                                   ]}>
                            <InputNumber min={0} style={{width: '100%'}} stringMode formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="đ"
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={48}>
                    <Col span={8}>
                        <Form.Item label="Quantity" name="quantity"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product quantity!',
                                       }
                                   ]}>
                            <InputNumber min={1} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Sold" name="sold"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product sold!',
                                       },
                                   ]}>
                            <InputNumber min={0} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Discount" name="discount"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product discount!',
                                       }
                                   ]}>
                            <InputNumber min={0} max={100} style={{width: '100%'}} addonAfter="%" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={48}>
                    <Col span={8}>
                        <Form.Item label="Battery" name="battery"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product battery!',
                                       },
                                   ]}>
                            <InputNumber min={1} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="mAh"
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Camera" name="camera"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product camera!',
                                       },
                                   ]}>
                            <InputNumber min={1} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="MP"
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="GPU" name="gpu"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product gpu!',
                                       },
                                   ]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={48}>
                    <Col span={8}>
                        <Form.Item label="Chip" name="chip"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product chip!',
                                       },
                                   ]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="RAM" name="ram"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product ram!',
                                       },
                                   ]}>
                            <InputNumber min={1} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="GB"
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="ROM" name="rom"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product rom!',
                                       },
                                   ]}>
                            <InputNumber min={1} style={{width: '100%'}} formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="GB"
                                         parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={48}>
                    <Col span={12}>
                        <Form.Item label="Description" name="description"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input product description!',
                                       },
                                       {
                                           max: 1000,
                                           message: 'Product description must be less than 1000 characters',
                                       },
                                   ]}>
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Images" required>
                            <div>
                                <Upload
                                    multiple
                                    name="images"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    accept=".png, .jpeg, .jpg"
                                    maxCount={10}
                                    customRequest={dummyRequest}
                                    beforeUpload={beforeUpload}
                                    onChange={(info) => handleChange(info)}
                                    onPreview={handlePreview}
                                    fileList={imagesTemp}
                                >
                                    {imagesTemp && imagesTemp.length >= 10 ? null :
                                        <div>
                                            {loadingImage ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    }
                                </Upload>
                                {previewImage &&
                                    <Image wrapperStyle={{display: 'none',}}
                                           preview={{
                                               visible: previewOpen,
                                               onVisibleChange: (visible) => setPreviewOpen(visible),
                                               afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                           }}
                                           src={previewImage}
                                    />
                                }
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify='center' gutter={16} style={{marginTop: 16}}>
                    <Col span={4}>
                        <Button style={{width: "100%"}}
                                onClick={() => navigate('/admin/product')}>
                            Cancel
                        </Button>
                    </Col>
                    <Col span={4}>
                        <Button style={{width: "100%"}} type="primary"
                                onClick={() => updateProductForm.submit()} loading={loading}>
                            Update
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    );
}

export default UpdateProduct;