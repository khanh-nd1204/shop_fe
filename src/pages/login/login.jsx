import {Button, Col, Divider, Form, Input, message, notification, Row} from "antd";
import shopLogo from "../../../public/shop-logo.png";
import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {doLoginAccountAction} from "../../redux/account/accountSlice.js";
import {loginUserAPI} from "../../services/auth.service.js";

const LoginPage = () => {
    const [loginForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);

    useEffect(() => {
        if (user && user._id) {
            navigate('/');
        }
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        const res = await loginUserAPI(values);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            dispatch(doLoginAccountAction(res.data));
            navigate("/");
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };
    return (
        <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16}}>
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={loginForm}
                  style={{minWidth: "50%", maxWidth: "100%", padding: "32px 16px", background: "#fff",
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px", borderRadius: "12px"}}
            >
                <Row justify={"center"} style={{marginBottom: 24}}>
                    <Col style={{textAlign: "center"}}>
                        <img src={shopLogo} style={{width: 40}}/>
                        <h2 style={{fontSize: 20, fontWeight: 500}}>Welcome back</h2>
                    </Col>
                </Row>
                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
                        <Form.Item label="Email" name="username"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input your email!',
                                       },
                                       {
                                           type: 'email',
                                           message: 'Invalid email!'
                                       },
                                       {
                                           max: 50,
                                           message: 'Email must be less than 50 characters',
                                       },
                                   ]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
                        <Form.Item
                            label="Password" name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                                {
                                    max: 20,
                                    min: 6,
                                    message: "Password must be between 6 and 20 characters",
                                }
                            ]}>
                            <Input.Password />
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify={"center"} style={{marginTop: 8}}>
                    <Col xs={24} md={18} xl={16} style={{textAlign: "center"}}>
                        <Form.Item>
                            <Button style={{width: "100%"}} type="primary"
                                    onClick={() => loginForm.submit()} loading={loading}>
                                Login
                            </Button>
                        </Form.Item>
                        <Divider/>
                        <div>Don't have an account? <Link to={"/register"}>Create account</Link></div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

export default LoginPage