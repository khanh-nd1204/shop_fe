import {useEffect, useState} from "react";
import {getProductsAPI} from "../../services/product.service.js";
import {
    Button,
    Card,
    Col,
    Empty,
    Flex,
    notification,
    Rate,
    Row, Skeleton,
    Space, Spin,
    Tag,
} from "antd";
import {useNavigate, useOutletContext} from "react-router-dom";

const HomePage = () => {
    const [productNew, setProductNew] = useState([]);
    const [productSold, setProductSold] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [searchValue, setSearchValue] = useOutletContext();

    useEffect(() => {
        getProductList('createdAt');
        getProductList('sold');
    }, [])

    const getProductList = async (sort) => {
        let query = `?current=1&pageSize=8`;
        if (sort) query += `&sort=-${sort}`;
        setLoading(true);
        const res = await getProductsAPI(query);
        setLoading(false);
        if (res && res.data) {
            if (sort === 'createdAt') {
                setProductNew(res.data.data);
            }
            if (sort === 'sold') {
                setProductSold(res.data.data);
            }
            setTotal(res.data.meta.total);
        } else {
            setProductNew([]);
            setProductSold([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    return (
        <Skeleton loading={loading}>
            <Flex align='center' justify='space-between'
                  style={{padding: 16, marginBottom: 16, borderRadius: 8,
                      background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)'}}>
                <div style={{fontSize: 20, fontWeight: 600, textTransform: 'uppercase', color: '#fff'}}>Best new🆕</div>
                {total > productNew.length &&
                    <Button type='text' style={{color: '#fff', fontSize: 16}} onClick={() => {
                        navigate('/search');
                        setSearchValue('');
                    }}>
                        View All
                    </Button>
                }
            </Flex>
            <Flex gap={16} style={{marginBottom: 32}}>
                {productNew && productNew.length > 0 ?
                    <Row gutter={[16, 16]}>
                        {productNew.length > 0 && productNew.map(item => {
                            return (
                                <Col
                                    xs={24} md={12} xl={6}
                                    key={item._id}
                                    onClick={() => {
                                        navigate(`/product?id=${item._id}`);
                                        setSearchValue('');
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column' }}  // Make Col a flex container
                                >
                                    <Card
                                        hoverable
                                        bordered
                                        style={{ flex: 1, padding: 1}}
                                        cover={
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.images[0]}`}
                                                style={{ width: "100%", height: 280, objectFit: "contain" }}
                                            />
                                        }
                                    >
                                        <Space style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                                            {Intl.NumberFormat('vi-VN', {
                                                style: 'currency', currency: 'VND'
                                            }).format(item.amount)}
                                            <Tag color={'#ec3651'}>-{item.discount}%</Tag>
                                        </Space>
                                        <div style={{ fontSize: 15, color: "#9f9e9e", marginBottom: 4 }}>{item.brand.toUpperCase()}</div>
                                        <div style={{ fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ color: "#9f9e9e", marginBottom: 12 }}>
                                            <Space>
                                                <Rate disabled defaultValue={5} style={{ fontSize: 12 }} />
                                                <span style={{fontSize: 14}}>Sold {item.sold}</span>
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
                            );
                        })}
                    </Row>
                    :
                    <Empty style={{margin: '0 auto'}}/>
                }
            </Flex>

            <Flex align='center' justify='space-between'
                  style={{padding: 16, marginBottom: 16, borderRadius: 8,
                      background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(159,11,49,1) 100%)'}}>
                <div style={{fontSize: 20, fontWeight: 600, textTransform: 'uppercase', color: '#fff'}}>Best seller🔥</div>
                {total > productNew.length &&
                    <Button type='text' style={{color: '#fff', fontSize: 16}} onClick={() => {
                        navigate('/search');
                        setSearchValue('');
                    }}>
                        View All
                    </Button>
                }
            </Flex>
            <Flex gap={16}>
                {productNew && productNew.length > 0 ?
                    <Row gutter={[16, 16]}>
                        {productSold.length > 0 && productSold.map(item => {
                            return (
                                <Col
                                    xs={24} md={12} xl={6}
                                    key={item._id}
                                    onClick={() => {
                                        navigate(`/product?id=${item._id}`);
                                        setSearchValue('');
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column' }}  // Make Col a flex container
                                >
                                    <Card
                                        hoverable
                                        bordered
                                        style={{ flex: 1, padding: 1}}
                                        cover={
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.images[0]}`}
                                                style={{ width: "100%", height: 280, objectFit: "contain" }}
                                            />
                                        }
                                    >
                                        <Space style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                                            {Intl.NumberFormat('vi-VN', {
                                                style: 'currency', currency: 'VND'
                                            }).format(item.amount)}
                                            <Tag color={'#ec3651'}>-{item.discount}%</Tag>
                                        </Space>
                                        <div style={{ fontSize: 15, color: "#9f9e9e", marginBottom: 4 }}>{item.brand.toUpperCase()}</div>
                                        <div style={{ fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ color: "#9f9e9e", marginBottom: 12 }}>
                                            <Space>
                                                <Rate disabled defaultValue={5} style={{ fontSize: 12 }} />
                                                <span style={{fontSize: 14}}>Sold {item.sold}</span>
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
                            );
                        })}
                    </Row>
                    :
                    <Empty style={{margin: '0 auto'}}/>
                }
            </Flex>
        </Skeleton>
    );
}

export default HomePage;