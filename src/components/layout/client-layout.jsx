import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {
    AutoComplete,
    Avatar,
    Badge,
    Button, Divider,
    Dropdown, Empty,
    Flex,
    Input,
    Layout,
    message,
    notification,
    Popover,
    Space,
    theme
} from "antd";
import React, {useEffect, useState} from "react";
import {logoutUserAPI} from "../../services/auth.service.js";
import {doLogoutAccountAction} from "../../redux/account/accountSlice.js";
import shopLogo from "../../../public/shop-logo.png";
import {ShoppingCartOutlined} from "@ant-design/icons";
import UpdateAccount from "../account/update-account.jsx";
import {doPlaceOrderAction} from "../../redux/order/orderSlice.js";
import {getProductNamesAPI} from "../../services/product.service.js";

const { Header, Content, Footer } = Layout;

const ClientLayout = (props) => {
    const user = useSelector(state => state.account.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {token: { colorBgContainer, borderRadiusLG },} = theme.useToken();
    const cart = useSelector(state => state.order.cart);
    const [hoverCart, setHoverCart] = useState(null);
    const [openChange, setOpenChange] = useState(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const productName = params.get("name");
    const [searchValue, setSearchValue] = useState('');
    const [productNames, setProductNames] = useState([]);

    useEffect(() => {
        if (productName && productName !== '') setSearchValue(productName);
        getProductNames();
    }, []);

    const getProductNames = async () => {
        const res = await getProductNamesAPI();
        if (res && res.data) {
            const filterData = res.data.map(item => ({value: item}));
            setProductNames(filterData);
        }
    }

    const logout = async () => {
        const res = await logoutUserAPI();
        if (res && res.data) {
            dispatch(doLogoutAccountAction());
            dispatch(doPlaceOrderAction())
            message.success(res.message);
            navigate("/");
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const onClick = ({ key }) => {
        switch(key) {
            case "logout":
                logout();
                break;
            case "history":
                setSearchValue('');
                navigate("/history");
                break;
            case "account":
                setOpenChange(true);
                break;
        }
    };

    const content = (
        <>
            {cart && cart.length > 0 ?
                <>
                    {cart.map((item, index) => {
                        if (index < 5) return (
                            <Flex gap={8} key={item._id} onClick={() => {
                                navigate(`/product?id=${item._id}`);
                                setSearchValue('');
                            }}
                                  onMouseEnter={() => setHoverCart(index)} onMouseLeave={() => setHoverCart(null)}
                                  style={{padding: 8, background: index === hoverCart ? "#f3f0f0" : "none", cursor: "pointer"}}
                            >
                                <img style={{width: 60, height: 60, objectFit: "cover"}}
                                     src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${item.image}`}/>

                                <div style={{maxWidth: 280}}>
                                    <div>{item.name}</div>
                                    <div style={{color: '#9f9e9e'}}>x{item.quantity}</div>
                                </div>

                                <div style={{marginLeft: "auto", fontWeight: 500}}>
                                    {Intl.NumberFormat('vi-VN', {
                                        style: 'currency', currency: 'VND'}).format(item.quantity * item.amount)}
                                </div>
                            </Flex>
                        );
                    })}
                    <Button style={{marginTop: 16, width: '100%'}} onClick={() => {
                        navigate("/cart");
                        setSearchValue('');
                    }}>View all</Button>
                </>
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
            }
        </>
    );

    const items = [
        (user && user.role === "ADMIN" && {
            label: <Link to={"/admin"}>Admin page</Link>,
            key: 'admin',
        }),
        {
            label: 'Account setting',
            key: 'account',
        },
        {
            label: 'Order history',
            key: 'history',
        },
        {
            label: 'Log out',
            key: 'logout',
        },
    ];

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: "#fff", padding: '0 120px', height: 'auto'}}>
                <Flex align='center' justify='center' gap={8} style={{cursor: "pointer"}} onClick={() => {
                    navigate('/');
                    setSearchValue('');
                }}>
                    <img src={shopLogo} style={{height: 36}}/>
                    <span className='logo-primary' style={{fontSize: 18, color: '#4096ff', fontWeight: 500}}>PShop</span>
                </Flex>

                {/*<Space.Compact style={{width: '50%'}} size='large'>*/}
                {/*    <Input placeholder="Search product name" value={searchValue} allowClear*/}
                {/*           onKeyDown={(e) => {*/}
                {/*               if (e.key === "Enter") {*/}
                {/*                   if (searchValue && searchValue !== '') navigate(`/search?name=${searchValue}`);*/}
                {/*                   else navigate(location.pathname);*/}
                {/*               }*/}
                {/*           }}*/}
                {/*           onChange={(e) => {setSearchValue(e.target.value)}} />*/}
                {/*    <Button type="primary" onClick={() => {*/}
                {/*        if (searchValue && searchValue !== '') navigate(`/search?name=${searchValue}`);*/}
                {/*        else navigate(location.pathname);*/}
                {/*    }}>*/}
                {/*        Search*/}
                {/*    </Button>*/}
                {/*</Space.Compact>*/}

                <AutoComplete
                    style={{width: '50%'}}
                    options={productNames}
                    onSelect={(value) => {
                        setSearchValue(value);
                        navigate(`/search?name=${value}`);
                    }}
                    filterOption={(inputValue, option) =>
                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    onChange={(value) => setSearchValue(value)}
                    value={searchValue}
                >
                    <Input.Search allowClear size="large" placeholder="Search product name" enterButton
                        onSearch={(value) => {
                            if (value && value !== '') {
                                navigate(`/search?name=${value}`);
                            } else {
                                navigate(location.pathname + location.search);
                            }
                        }}
                    />
                </AutoComplete>

                <Flex align='center' gap={8}>
                    <div>
                        {user && user._id ?
                            <Dropdown
                                menu={{
                                    items,
                                    onClick
                                }}
                                placement="bottom"
                                arrow={{
                                    pointAtCenter: true,
                                }}
                            >
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <Avatar src={`${import.meta.env.VITE_BACKEND_URL}/images/user/${user.avatar}`} />
                                        {user.name}
                                    </Space>
                                </a>
                            </Dropdown>
                            :
                            <Button>
                                <Link to={"/login"}>Login</Link>
                            </Button>
                        }
                    </div>
                    <Divider type='vertical' style={{ height: 32 }}/>
                    <Popover placement="bottomRight" title="New products added" content={content}>
                        <Badge count={cart ? cart.length : 0} showZero overflowCount={99} size='small'>
                            <ShoppingCartOutlined style={{fontSize: 32, position: "relative", right: 8, color: "#4096ff", cursor: "pointer"}}/>
                        </Badge>
                    </Popover>
                </Flex>
            </Header>
            <Content
                style={{
                    // background: colorBgContainer,
                    padding: '24px 120px',
                    // borderRadius: borderRadiusLG,
                }}
            >
                <Outlet context={[searchValue, setSearchValue]}/>
                {/*{props.children}*/}
            </Content>
            {/*<Footer*/}
            {/*    style={{*/}
            {/*        textAlign: 'center',*/}
            {/*        backgroundColor: "#fff",*/}
            {/*        padding: "12px 0",*/}
            {/*    }}*/}
            {/*>*/}
            {/*    PShop React By KhanhND ©{new Date().getFullYear()}*/}
            {/*</Footer>*/}
            <UpdateAccount openChange={openChange} setOpenChange={setOpenChange}/>
        </Layout>
    );
}

export default ClientLayout;