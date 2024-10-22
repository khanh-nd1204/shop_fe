import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {getProductAPI} from "../../services/product.service.js";
import {
    Avatar,
    Button,
    Col,
    Divider,
    Flex,
    InputNumber,
    message,
    notification,
    Rate,
    Row,
    Skeleton,
    Tag,
    Typography
} from "antd";
import {doAddProductAction} from "../../redux/order/orderSlice.js";
import { v4 as uuidv4 } from 'uuid';
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import {MinusOutlined, PlusOutlined, StarFilled} from "@ant-design/icons";
const { Text, Link } = Typography;
import shopLogo from "../../../public/shop-logo.png";

const ProductDetail = () => {
    const [productData, setProductData] = useState({});
    const [imageList, setImageList] = useState([]);
    const [primaryImage, setPrimaryImage] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const productId = params.get("id");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.account.user);
    const [productCount, setProductCount] = useState(1);

    useEffect(() => {
        if (!productId || productId === '') {
            navigate('/');
        } else {
            getProductDetail();
        }
    }, [productId]);

    const getProductDetail = async () => {
        setLoading(true);
        const res = await getProductAPI(productId);
        setLoading(false);
        if (res && res.data) {
            setProductData(res.data);
            setPrimaryImage(`${import.meta.env.VITE_BACKEND_URL}/images/product/${res.data.images[0]}`);
            setImageList(res.data.images.map(item => {
                return {
                    id: uuidv4(),
                    src: `${import.meta.env.VITE_BACKEND_URL}/images/product/${item}`,
                }
            }));
        } else {
            notification.error({
                message: "Error",
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const handleAddToCart = (quantity) => {
        if (user && user._id) {
            dispatch(doAddProductAction({ _id: productData._id, name: productData.name, brand: productData.brand,
                amount: productData.amount, remain: productData.remain, quantity, image: productData.images[0]}));
            message.success("The product has been added to the cart");
        } else {
            navigate("/login");
        }
    }

    const handleBuy = (quantity) => {
        if (user && user._id) {
            dispatch(doAddProductAction({ _id: productData._id, name: productData.name, brand: productData.brand,
                amount: productData.amount, remain: productData.remain, quantity, image: productData.images[0]}));
            navigate("/cart");
        } else {
            navigate("/login");
        }
    }

    return (
        <Skeleton loading={loading}>
            <Row justify='space-between'>
                <Col span={8}></Col>
                <Col span={8} style={{background: "#fff", padding: "16px 24px", position: 'fixed', width: '27%',
                    borderRadius: 8, maxHeight: "max-content"}}>
                    <Flex vertical gap={10}>
                        <img src={primaryImage}
                             style={{height: 420, objectFit: "contain", border: '1px solid #e8e8e8', borderRadius: 8}}/>
                        <LightGallery
                            speed={500}
                            mode="lg-fade"
                            plugins={[lgThumbnail, lgZoom]}
                            selector="a"
                            download={false}
                        >
                            <Flex style={{overflow: 'auto'}}>
                                {imageList.map(image => (
                                    <a
                                        key={image.id}
                                        href={image.src}
                                        data-src={image.src}
                                        data-sub-html={`<h4>${productData.name}</h4>`}
                                    >
                                        <img
                                            className="img-responsive"
                                            src={image.src}
                                            style={{padding: 4, width: 60, height: 60, borderRadius: 4, objectFit: "contain",
                                                border: image.src === primaryImage ? "2px solid #3795BD" : 'none'}}
                                            onMouseEnter={() => setPrimaryImage(image.src)}
                                        />
                                    </a>
                                ))}
                            </Flex>
                        </LightGallery>
                    </Flex>
                </Col>

                <Col span={10} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <Flex vertical gap={12} style={{background: "#fff", padding: "16px 24px", borderRadius: 8}}>
                        <div style={{fontSize: 20, fontWeight: 500}}>{productData.name}</div>
                        <div style={{fontSize: 15, color: "#4f4c4c"}}>
                            5.0 <Rate disabled defaultValue={5} style={{fontSize: 14}} />
                            <Divider type='vertical'/>
                            <span style={{color: "#9f9e9e"}}> Sold {productData.sold} </span>
                        </div>
                        <Flex align='center' gap={8}>
                            <div style={{fontSize: 20, fontWeight: 600}}>
                                {Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                                    .format(productData.amount)}
                            </div>
                            <Tag color={'#ec3651'}>-{productData.discount}%</Tag>
                            <Text delete style={{fontSize: 14, color: '#9f9e9e'}}>
                                {Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                                .format(productData.price)}
                            </Text>
                        </Flex>
                        <div style={{fontSize: 15, color: "#4f4c4c"}}>
                            Brand: <span style={{color: '#4096ff', fontWeight: 500}}>{productData.brand?.toUpperCase()}</span>
                        </div>
                        <div style={{fontSize: 15, color: "#4f4c4c"}}>
                            Remain: {productData.remain}
                        </div>
                        <div style={{fontSize: 15, color: "#4f4c4c"}}>
                            Sales date : {new Date(productData.createdAt).toLocaleDateString("en-GB").replace(',' ,'')}
                        </div>
                    </Flex>

                    <div style={{background: "#fff", padding: "16px 24px", borderRadius: 8}}>
                        <div style={{fontSize: 16, fontWeight: 500,  marginBottom: 8}}>Product description</div>
                        <div style={{color: "#4f4c4c"}}>{productData.description}</div>
                    </div>

                    <div style={{background: "#fff", padding: "16px 24px", borderRadius: 8}}>
                        <div style={{fontSize: 16, fontWeight: 500,  marginBottom: 8}}>Product detail</div>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>Battery</Col>
                            <Col span={12}>{productData.detail?.battery}</Col>
                        </Row>
                        <Divider style={{margin: '8px 0', width: '100%'}}/>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>Camera</Col>
                            <Col span={12}>{productData.detail?.camera}</Col>
                        </Row>
                        <Divider style={{margin: '8px 0', width: '100%'}}/>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>Graphics chip (GPU)</Col>
                            <Col span={12}>{productData.detail?.gpu}</Col>
                        </Row>
                        <Divider style={{margin: '8px 0', width: '100%'}}/>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>Chip set</Col>
                            <Col span={12}>{productData.detail?.chip}</Col>
                        </Row>
                        <Divider style={{margin: '8px 0', width: '100%'}}/>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>RAM</Col>
                            <Col span={12}>{productData.detail?.ram}</Col>
                        </Row>
                        <Divider style={{margin: '8px 0', width: '100%'}}/>
                        <Row>
                            <Col span={12} style={{color: '#676565'}}>ROM</Col>
                            <Col span={12}>{productData.detail?.rom}</Col>
                        </Row>
                    </div>
                </Col>

                <Col span={6}></Col>
                <Col span={6} style={{background: "#fff", padding: "24px 16px", borderRadius: 8, maxHeight: "max-content",
                position: 'fixed', right: 120, width: '20%'}}>
                    <Flex gap={16} align="center">
                        <Avatar src={shopLogo} size={40} style={{backgroundColor: '#f8efe9'}}/>
                        <div>
                            <div className='logo-primary' style={{fontSize: 16, fontWeight: 600, color: '#4096ff'}}>PShop</div>
                            5.0 <StarFilled style={{color: "#fced14"}}/>
                        </div>
                    </Flex>
                    <Divider style={{margin: '12px 0'}}/>
                    <p style={{fontSize: 16, fontWeight: 500, marginBottom: 8}}>Quantity</p>
                    <Flex gap={10}>
                        <Button disabled={productCount <= 1} onClick={() => setProductCount(productCount - 1)}>
                            <MinusOutlined/>
                        </Button>
                        <InputNumber value={productCount} onChange={(value) => value >= 1 && setProductCount(value)}
                                     min={1} max={productData.remain}/>
                        <Button disabled={productCount >= productData.remain}
                                onClick={() => setProductCount(productCount + 1)}>
                            <PlusOutlined/>
                        </Button>
                    </Flex>
                    <div style={{fontSize: 16, fontWeight: 500, margin: "16px 0 8px"}}>Total payment</div>
                    <div style={{fontSize: 20, fontWeight: 600, marginBottom: 24}}>
                        {Intl.NumberFormat('vi-VN', {
                            style: 'currency', currency: 'VND'}).format(productCount * productData.amount)}
                    </div>
                    <Flex vertical gap={16}>
                        <Button size="large" type="primary"
                                onClick={() => handleBuy(productCount)}>
                            Buy now
                        </Button>
                        <Button size="large" onClick={() => handleAddToCart(productCount)}>
                            Add to cart
                        </Button>
                    </Flex>
                </Col>
            </Row>
        </Skeleton>
    );
}

export default ProductDetail;