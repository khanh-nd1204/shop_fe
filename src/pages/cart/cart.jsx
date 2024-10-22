import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    Avatar,
    Badge,
    Button,
    Cascader,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    notification,
    Result, Select,
    Space,
    Steps
} from "antd";
import {doChangeQuantityAction, doDeleteProductAction, doPlaceOrderAction} from "../../redux/order/orderSlice.js";
import {createOrderAPI} from "../../services/order.service.js";
import shopLogo from "../../../public/shop-logo.png";
import {StarFilled} from "@ant-design/icons";

const CartPage = () => {
    const cart = useSelector(state => state.order.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const user = useSelector(state => state.account.user);
    const [userForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const provinceList = JSON.parse(localStorage.getItem('province-list'));
    const { TextArea } = Input;
    const totalAmount = cart.map(item => item.quantity * item.amount).reduce(function (x, y) {
        return x + y;
    }, 0);


    useEffect(() => {
        if (user) {
            userForm.setFieldsValue({
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address?.split(', ').reverse(),
                paymentMethod: 'Payment upon receipt',
                note: ''
            });
        }
        if (cart.length > 0 ) setCurrent(1);
    }, [user]);

    const handleChangeQuantity = (id, value) => {
        if (value && value >= 1) {
            dispatch(doChangeQuantityAction({_id: id, quantity: value}));
        }
    }

    const deleteProduct = (id) => {
        dispatch(doDeleteProductAction(id));
        if (cart.length <= 1) setCurrent(0);
    }

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        const data = {...values, totalPrice: totalAmount, detail: cart};
        setLoading(true);
        const res = await createOrderAPI(data);
        setLoading(false);
        if (res && res.data) {
            dispatch(doPlaceOrderAction());
            setCurrent(3);
        } else {
            notification.error({
                message: "Error",
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <>
            {cart.length > 0 || current > 0 ?
                <>
                    <Steps current={current} style={{padding: 16, background: "#fff", marginBottom: 16, borderRadius: 8}}
                           items={[
                               {
                                   title: 'Order',
                               },
                               {
                                   title: 'Place',
                               },
                               {
                                   title: 'Payment',
                               },
                           ]}
                    />

                    {current !== 3 ?
                        <Flex gap={24} justify={"space-between"}>
                            <Flex vertical gap={16} style={{width: "70%"}}>
                                {cart.map(item => {
                                    return (
                                        <Flex align={"center"} justify={"space-between"} style={{background: "#fff", padding: 16, borderRadius: 8}} key={item._id}>
                                            <Space align={"start"} style={{width: "40%"}}>
                                                <Space>
                                                    <img style={{width: 80, height: 80, objectFit: "contain", border: '1px solid #e8e8e8', borderRadius: 8}}
                                                         src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.image}`}/>
                                                </Space>
                                                <div>
                                                    <a style={{fontSize: 16, fontWeight: 500}} onClick={() => navigate(`/product?id=${item._id}`)}>{item.name}</a>
                                                    <div style={{fontSize: 15, color: "#4f4c4c"}}>{item.brand}</div>
                                                </div>
                                            </Space>

                                            <div style={{fontSize: 15, fontWeight: 500}}>
                                                {Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                                                    .format(item.amount)}
                                            </div>

                                            <InputNumber value={item.quantity} min={1} max={item.remain}
                                                         onChange={(value) => handleChangeQuantity(item._id, value)}/>
                                            <div style={{fontSize: 15, fontWeight: 500}}>
                                                {Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                                                    .format(item.quantity * item.amount)}
                                            </div>
                                            <Button type='primary' danger onClick={() => deleteProduct(item._id)}>Delete</Button>
                                        </Flex>
                                    );
                                })}
                            </Flex>

                            {current === 1 &&
                                <Flex vertical style={{background: "#fff", padding: "24px 16px", borderRadius: 8, width: "30%", height: 'max-content'}}>
                                    <Flex gap={16} align="center">
                                        <Avatar src={shopLogo} size={40} style={{backgroundColor: '#f8efe9'}} />
                                        <div>
                                            <div style={{fontSize: 16, fontWeight: 600}} className='logo-primary'>PShop</div>
                                            5.0 <StarFilled style={{color: "#fced14"}}/>
                                        </div>
                                    </Flex>
                                    <Divider style={{margin: '12px 0'}}/>
                                    <div style={{fontSize: 16, fontWeight: 500, marginBottom: 8}}>Total payment</div>
                                    <div style={{fontSize: 20, fontWeight: 600, marginBottom: 24}}>
                                        {Intl.NumberFormat('vi-VN', {
                                            style: 'currency', currency: 'VND'}).format(totalAmount ? totalAmount : 0)}
                                    </div>
                                    <Button size="large" type="primary" onClick={() => setCurrent(2)}>
                                        Buy ({cart.length})
                                    </Button>
                                </Flex>
                            }

                            {current === 2 &&
                                <Flex vertical style={{background: "#fff", padding: "24px 16px", borderRadius: "8px", width: "30%", height: 'max-content'}}>
                                    <Form onFinish={onFinish} autoComplete="off" layout='vertical' form={userForm}>
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

                                        <Form.Item label="Payment method" name="paymentMethod"
                                                   rules={[
                                                       {
                                                           required: true,
                                                           message: 'Please input your payment method!',
                                                       },
                                                       {
                                                           max: 100,
                                                           message: 'Payment method must be less than 100 characters',
                                                       },
                                                   ]}>
                                            <Select
                                                options={[
                                                    {
                                                        value: 'Payment upon receipt',
                                                        label: 'Payment upon receipt',
                                                    },
                                                ]}
                                            />
                                        </Form.Item>

                                        <Form.Item label="Note" name="note"
                                                   rules={[
                                                       {
                                                           max: 1000,
                                                           message: 'Note must be less than 1000 characters',
                                                       },
                                                   ]}>
                                            <TextArea rows={3} />
                                        </Form.Item>
                                    </Form>
                                    <div style={{fontSize: 16, fontWeight: 500, marginBottom: 8}}>Total payment</div>
                                    <div style={{fontSize: 20, fontWeight: 600, marginBottom: 24}}>
                                        {Intl.NumberFormat('vi-VN', {
                                            style: 'currency', currency: 'VND'}).format(totalAmount ? totalAmount : 0)}
                                    </div>
                                    <Button size="large" type="primary" onClick={() => userForm.submit()} loading={loading}>
                                        Confirm
                                    </Button>
                                    <Button size="large" onClick={() => setCurrent(1)} style={{marginTop: 8}}>
                                        Back
                                    </Button>
                                </Flex>
                            }
                        </Flex>
                        :
                        <Result
                            status="success"
                            title="Order placed successfully!"
                            extra={[
                                <Button type="primary" key="home" onClick={() => navigate("/")}>
                                    Back Home
                                </Button>,
                                <Button key="history" onClick={() => navigate("/history")}>
                                    View history
                                </Button>,
                            ]}
                        />
                    }
                </>
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" onClick={() => navigate("/")}>Back Home</Button>
                </Empty>
            }
        </>
    );
}

export default CartPage;