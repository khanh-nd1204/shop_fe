import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {cancelOrderAPI, getOrdersByUser} from "../../services/order.service.js";
import {useDispatch} from "react-redux";
import {
    Button,
    Card,
    Collapse,
    Divider,
    Empty,
    Flex,
    message,
    notification, Pagination,
    Popconfirm,
    Skeleton,
    Space,
    Tag
} from "antd";
import {doAddProductAction} from "../../redux/order/orderSlice.js";
import {LoadingOutlined} from "@ant-design/icons";

const HistoryPage = () => {
    const [orderData, setOrderData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        getOrderData();
    }, [current]);

    const getOrderData = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        setLoading(true);
        const res = await getOrdersByUser(query);
        setLoading(false);
        if (res && res.data) {
            setOrderData(res.data.data);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        } else {
            setOrderData([]);
            notification.error({
                message: "Error",
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const cancelOrder = async (id) => {
        const res = await cancelOrderAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getOrderData();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    const onChangeCurrent = (newCurrent) => {
        if (newCurrent && newCurrent !== current) {
            setCurrent(newCurrent);
        }
    };

    const handleBuyAgain = (order) => {
        if (order && order.detail) {
            order.detail.forEach(item => {
                dispatch(doAddProductAction({ _id: item._id, name: item.name, brand: item.brand,
                    amount: item.amount, remain: item.remain, quantity: item.quantity, image: item.image}));
            });
            navigate("/cart");
        }
    }

    return (
        <>
            {orderData && orderData.length > 0 ?
                <Flex vertical gap={16}>
                    {orderData.map(item => {
                        let color = '';
                        switch (item.status) {
                            case 'Processing':
                                color = 'blue';
                                break;
                            case 'Shipping':
                                color = 'gold';
                                break;
                            case 'Delivered':
                                color = 'green';
                                break;
                            case 'Canceled':
                                color = 'volcano';
                                break;
                            default:
                                color = 'gray';
                        }
                        return (
                            <Flex gap={24} justify='center' key={item._id}>
                                <Skeleton loading={loading}>
                                    <Card title={
                                        <Flex align={"center"} justify={"space-between"}>
                                            <div style={{fontSize: 16, fontWeight: 500, color: '#4096ff'}}>FShop</div>
                                            <div style={{fontSize: 14, fontWeight: 400}}>
                                                <Tag color={color}>{item.status}</Tag>
                                                <Divider type='vertical' />
                                                {new Date(item.updatedAt).toLocaleString("en-GB").replace(',' ,'')}
                                            </div>
                                        </Flex>
                                    }
                                          bordered={false} style={{width: "65%", background: "#fff", borderRadius: 8, height: 'max-content'}}
                                    >
                                        <Flex vertical gap={8}>
                                            {item.detail && item.detail.length > 0 && item.detail.map(product => {
                                                return (
                                                    <Flex justify={"space-between"} key={product._id}>
                                                        <Space align={"start"} style={{width: '40%'}}>
                                                            <img src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${product.image}`}
                                                                 style={{width: 60, height: 60, objectFit: "contain", border: '1px solid #e8e8e8', borderRadius: 8}}/>
                                                            <div>
                                                                <a style={{fontSize: 15, fontWeight: 500}} onClick={() => navigate(`/product?id=${product._id}`)}>
                                                                    {product.name}
                                                                </a>
                                                                <div>x{product.quantity}</div>
                                                            </div>
                                                        </Space>
                                                        <div style={{fontWeight: 500}}>
                                                            {Intl.NumberFormat('vi-VN', {
                                                                style: 'currency', currency: 'VND'}).format(product.quantity * product.amount)}
                                                        </div>
                                                    </Flex>
                                                );
                                            })}
                                        </Flex>
                                        <div style={{fontSize: 15, marginLeft: "auto", maxWidth: "max-content"}}>
                                            Total payment: <span style={{fontWeight: 500}}>
                                            {Intl.NumberFormat('vi-VN', {
                                                style: 'currency', currency: 'VND'}).format(item.totalPrice)}
                                        </span>
                                        </div>
                                        <Divider style={{margin: '12px 0'}}/>
                                        <Flex gap={8} justify='space-between'>
                                            <Collapse ghost size='small' items={[
                                                {
                                                    key: '1',
                                                    label: 'Order detail',
                                                    children: <Flex vertical gap={4}>
                                                        <div>Name: <span style={{fontWeight: 500}}>{item.name}</span></div>
                                                        <div>Phone: <span style={{fontWeight: 500}}>{item.phone}</span></div>
                                                        <div>Address: <span style={{fontWeight: 500}}>{item.addressDetail}, {item.address}</span></div>
                                                        <div>Payment method: <span style={{fontWeight: 500}}>{item.paymentMethod}</span></div>
                                                        <div>Order time: <span style={{fontWeight: 500}}>{new Date(item.createdAt).toLocaleString("en-GB").replace(',' ,'')}</span></div>
                                                    </Flex>
                                                },
                                            ]} />
                                            <div>
                                                {item.status !== 'Canceled' && item.status !== 'Delivered' ?
                                                    <Popconfirm
                                                        title="Cancel order"
                                                        description="Are you sure to cancel this order?"
                                                        onConfirm={() => cancelOrder(item._id)}
                                                    >
                                                        <Button danger type='primary'>Cancel</Button>
                                                    </Popconfirm>
                                                    :
                                                    <Button type='primary' onClick={() => handleBuyAgain(item)}>Buy again</Button>
                                                }
                                            </div>
                                        </Flex>
                                    </Card>
                                </Skeleton>

                            </Flex>
                        );
                    })}
                    {total > orderData.length &&
                        <Pagination current={current} pageSize={pageSize} total={total} onChange={onChangeCurrent}
                                    style={{ width: '65%', textAlign: 'right', padding: '0 16px', margin: '0 auto'}}
                                    showTotal={(total, range) => (<div> {range[0]} - {range[1]} / {total} records</div>) }/>
                    }
                </Flex>
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" onClick={() => navigate("/")}>Back Home</Button>
                </Empty>
            }
        </>
    );
}

export default HistoryPage;