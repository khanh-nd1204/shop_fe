import React, {useEffect, useState} from "react";
import {getProductsAPI} from "../../services/product.service.js";
import {
    Button,
    Card,
    Col,
    Empty,
    Flex,
    notification,
    Rate,
    Row,
    Select,
    Slider,
    Space,
    Tag,
    Pagination,
    Skeleton,
    Checkbox
} from "antd";
import {useLocation, useNavigate} from "react-router-dom";

const SearchPage = () => {
    const [productData, setProductData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(16);
    const [total, setTotal] = useState(0);
    const [slider, setSlider] = useState([0, 50000000]);
    const [price, setPrice] = useState(`&price>=${slider[0]}&price<=${slider[1]}`);
    const [sort, setSort] = useState("&sort=-sold");
    const [brand, setBrand] = useState('');
    const [change, setChange] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const productName = params.get("name");
    const brandData = JSON.parse(localStorage.getItem('brand-list'));

    useEffect (() => {
        getProductList();
    }, [current, sort, price, brand, productName]);

    const getProductList = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        if (sort) query += sort;
        if (price) query += price;
        if (brand) query += brand;
        if (productName) query += `&name=/${productName}/i`;
        setLoading(true);
        const res = await getProductsAPI(query);
        setLoading(false);
        if (res && res.data) {
            setProductData(res.data.data);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        } else {
            setProductData([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    const options = [
        {
            value: '&sort=-sold',
            label: 'Popular',
        },
        {
            value: '&sort=-createdAt',
            label: 'New',
        },
        {
            value: '&sort=amount',
            label: 'Price low to high',
        },
        {
            value: '&sort=-amount',
            label: 'Price high to low',
        },
    ];

    const onChangeSort = (value) => {
        setCurrent(1);
        setSort(value);
    };

    const applyPrice = () => {
        setCurrent(1);
        setPrice(`&amount>=${slider[0]}&amount<=${slider[1]}`);
        setChange(false);
    }

    const formatter = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND'
        }).format(value)
    }

    const onChangeBrand = (value) => {
        setCurrent(1);
        setBrand(`&brand=${value.toString()}`);
    };

    const onChangeCurrent = (newCurrent) => {
        if (newCurrent && newCurrent !== current) {
            setCurrent(newCurrent);
        }
    };

    return (
        <Flex gap={16}>
            <Flex vertical gap={16} style={{width: '20%', background: "#fff", padding: 16, borderRadius: 8,
                maxHeight: 'max-content', boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                <Flex vertical gap={8}>
                    <span style={{color: '#9f9e9e'}}>Sort</span>
                    <Select
                        defaultValue={'&sort=-sold'}
                        style={{
                            width: '100%',
                        }}
                        onChange={onChangeSort}
                        options={options}
                    />
                </Flex>
                <Flex vertical gap={8}>
                    <span style={{color: '#9f9e9e'}}>Brand</span>
                    <Checkbox.Group options={brandData} onChange={onChangeBrand} style={{flexDirection: 'column', gap: 12}}/>
                </Flex>
                <Flex vertical>
                    <span style={{color: '#9f9e9e'}}>Price</span>
                    <Slider range value={slider} tooltip={{formatter}} min={0} max={100000000} style={{width: '100%'}}
                            onChange={(value) => {
                                setSlider(value);
                                setChange(true);
                            }}/>
                    <Button type="primary" onClick={applyPrice} disabled={!change} width={'100%'}>Apply</Button>
                </Flex>
            </Flex>
            {productData && productData.length > 0 ?
                <Row gutter={[16, 16]} style={{width: '80%'}}>
                    {productData.length > 0 && productData.map(item => {
                        return (
                            <Skeleton loading={loading}>
                                <Col
                                    xs={24} md={12} xl={6}
                                    key={item._id}
                                    onClick={() => navigate(`/product?id=${item._id}`)}
                                    style={{ display: 'flex', flexDirection: 'column' }}  // Make Col a flex container
                                >

                                    <Card
                                        hoverable
                                        bordered
                                        style={{ flex: 1, padding: 1, maxHeight: 'max-content'}}
                                        cover={
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.images[0]}`}
                                                style={{ width: "100%", height: 240, objectFit: "contain" }}
                                            />
                                        }
                                    >
                                        <Space style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                                            {Intl.NumberFormat('vi-VN', {
                                                style: 'currency', currency: 'VND'
                                            }).format(item.amount)}
                                            <Tag color={'#ec3651'}>-{item.discount}%</Tag>
                                        </Space>
                                        <div style={{ fontSize: 14, color: "#9f9e9e", marginBottom: 4 }}>{item.brand.toUpperCase()}</div>
                                        <div style={{ fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ color: "#9f9e9e", marginBottom: 12 }}>
                                            <Space>
                                                <Rate disabled defaultValue={5} style={{ fontSize: 12 }} />
                                                <span style={{fontSize: 13}}>Sold {item.sold}</span>
                                            </Space>
                                        </div>
                                        <Space style={{ color: "#9f9e9e" }}>
                                            <span style={{padding: '4px 8px', border: '1px solid #DADADA', borderRadius: 4}}>
                                                {item.detail.ram}
                                            </span>
                                            <span style={{padding: '4px 8px', border: '1px solid #DADADA', borderRadius: 4}}>
                                                {item.detail.rom}
                                            </span>
                                        </Space>
                                    </Card>
                                </Col>
                            </Skeleton>
                        );
                    })}
                    {total > productData.length &&
                        <Pagination current={current} pageSize={pageSize} total={total} onChange={onChangeCurrent}
                                    style={{ width: '100%', textAlign: 'right', padding: '0 16px'}}
                                    showTotal={(total, range) => (<div> {range[0]} - {range[1]} / {total} records</div>) }/>
                    }
                </Row>
                :
                <Empty style={{margin: '0 auto'}}/>
            }
        </Flex>
    );
}

export default SearchPage;