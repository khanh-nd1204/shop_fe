import React, {useEffect, useState} from 'react';
import {
    AppstoreOutlined, ArrowRightOutlined,
    BookOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProductOutlined, RightOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {Avatar, Button, Dropdown, Flex, Layout, Menu, message, notification, Space, theme, Breadcrumb} from 'antd';
import {Link, useLocation, useNavigate} from "react-router-dom";
import shopLogo from "../../../public/shop-logo.png";
import {useDispatch, useSelector} from "react-redux";
import {doLogoutAccountAction} from "../../redux/account/accountSlice.js";
import {logoutUserAPI} from "../../services/auth.service.js";
import UpdateAccount from "../account/update-account.jsx";
import {doPlaceOrderAction} from "../../redux/order/orderSlice.js";

const { Header, Sider, Content } = Layout;

const AdminLayout = (props) => {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector(state => state.account.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [current, setCurrent] = useState("");
    const {token: { colorBgContainer, borderRadiusLG},} = theme.useToken();
    const [openChange, setOpenChange] = useState(false);
    const location = useLocation();
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);

    useEffect(() => {
        if (location && location.pathname) {
            const allRoutes = ["user", "brand", "product", "order"];
            const currentRoute = allRoutes.find(item => location.pathname.includes(`/admin/${item}`));
            if (currentRoute) {
                setCurrent(currentRoute);
            } else {
                setCurrent("dashboard");
            }
            const arr = location.pathname.split('/');
            arr.shift();

            let result = [];
            arr.reduce((path, current) => {
                path += (path ? '/' : '') + current;
                result.push({ name: current, path: path });
                return path;
            }, '');

            setBreadcrumbItems(
                result.map((item, index) => {
                    let name = item.name;
                    if (index === 0) name = 'dashboard';
                    return {title: <Link to={`/${item.path}`}>{name.charAt(0).toUpperCase() + name.slice(1)}</Link>}
                })
            );
        }

    }, [location]);

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
        if (key === "logout") {
            logout();
        } else if (key === "account") {
            setOpenChange(true);
        }
    };

    const items = [
        {
            label: <Link to={"/"}>Home page</Link>,
            key: 'home',
        },
        {
            label: 'Account setting',
            key: 'account',
        },
        {
            label: 'Log out',
            key: 'logout',
        },
    ];

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark"
                   style={{position: "fixed", top: 0, bottom: 0, zIndex: 1}}>
                <Flex align='center' justify='center' gap={8} style={{width: "100%", height: 60}}>
                    <img src={shopLogo} style={{height: "32px"}}/>
                    {!collapsed && <span style={{color: '#fff', opacity: 0.65, fontWeight: 500}}>Admin Page</span>}
                </Flex>
                <Menu
                    theme="dark"
                    mode="inline"
                    style={{borderInlineEndStyle: "none"}}
                    selectedKeys={[current]}
                    items={[
                        {
                            key: 'dashboard',
                            icon: <AppstoreOutlined />,
                            label: <Link to={"/admin"}>Dashboard</Link>,
                        },
                        {
                            key: 'user',
                            icon: <UserOutlined />,
                            label: <Link to={"/admin/user"}>User</Link>,
                        },
                        {
                            key: 'brand',
                            icon: <BookOutlined />,
                            label: <Link to={"/admin/brand"}>Brand</Link>,
                        },
                        {
                            key: 'product',
                            icon: <ProductOutlined />,
                            label: <Link to={"/admin/product"}>Product</Link>,
                        },
                        {
                            key: 'order',
                            icon: <ShoppingCartOutlined />,
                            label: <Link to={"/admin/order"}>Order</Link>,
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: 16,
                            width: 64,
                            height: 64,
                            marginLeft: collapsed ? "80px" : "200px"
                        }}
                    />
                    <div style={{marginRight: 32}}>
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
                    </div>
                </Header>
                <Content style={{marginLeft: collapsed ? "96px" : "200px"}}>
                    <Breadcrumb separator={<RightOutlined/>} style={{margin: 16}} items={breadcrumbItems}/>
                    <div style={{
                        // margin: '24px 16px',
                        padding: '0 16px 24px',
                        // background: colorBgContainer,
                        // borderRadius: borderRadiusLG,
                    }}>
                        {props.children}
                    </div>
                </Content>
            </Layout>
            <UpdateAccount openChange={openChange} setOpenChange={setOpenChange}/>
        </Layout>
    );
};
export default AdminLayout;