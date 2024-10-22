import {Button, Cascader, Col, Divider, Form, Input, message, notification, Row} from "antd";
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {registerUserAPI} from "../../services/auth.service.js";
import shopLogo from "../../../public/shop-logo.png";
import {useSelector} from "react-redux";

const RegisterPage = () => {
    const [registerForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const provinceList = JSON.parse(localStorage.getItem('province-list'));
    const user = useSelector(state => state.account.user);

    useEffect(() => {
        if (user && user._id) {
            navigate('/');
        }
    }, []);

    const onFinish = async (values) => {
        values.address = values.address.reverse().join(', ');
        setLoading(true);
        const res = await registerUserAPI(values);
        setLoading(false);
        if (res && res.data) {
            message.success(res.message);
            navigate("/login");
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    return (
        <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16}}>
            <Form onFinish={onFinish} autoComplete="off" layout={"vertical"} form={registerForm}
                  style={{minWidth: "50%", maxWidth: "100%", padding: "32px 16px", background: "#fff",
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px", borderRadius: "12px"}}
            >
                <Row justify={"center"} style={{marginBottom: 24}}>
                    <Col style={{textAlign: "center"}}>
                        <img src={shopLogo} style={{width: 40}}/>
                        <h2 style={{fontSize: 20, fontWeight: 500}}>Welcome to PShop</h2>
                    </Col>
                </Row>

                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
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
                    </Col>
                </Row>

                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
                        <Form.Item label="Email" name="email"
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
                                           max: 100,
                                           message: 'Email must be less than 100 characters',
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

                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
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
                    </Col>
                </Row>

                <Row justify={"center"}>
                    <Col xs={24} md={18} xl={16}>
                        <Form.Item label="Address" name="address"
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input your address!',
                                       },
                                   ]}>
                            <Cascader showSearch={{ filter }} options={provinceList} placeholder="Select address" changeOnSelect />
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify={"center"} style={{marginTop: 8}}>
                    <Col xs={24} md={18} xl={16} style={{textAlign: "center"}}>
                        <Form.Item>
                            <Button style={{width: "100%"}} type="primary"
                                    onClick={() => registerForm.submit()} loading={loading}>
                                Register
                            </Button>
                        </Form.Item>
                        <Divider/>
                        <div>Already have an account? <Link to={"/login"}>Login</Link></div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

export default RegisterPage;