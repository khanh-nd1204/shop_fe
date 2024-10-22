import {Avatar, Card, Col, Flex, notification, Row, Spin, Statistic} from "antd";
import CountUp from "react-countup";
import {useEffect, useState} from "react";
import {getDashboardAPI} from "../../services/dashboard.service.js";
import {Line, Pie} from "@ant-design/charts";
import {
    ProductFilled,
    ShopFilled,
    ShoppingFilled,
    UserOutlined
} from "@ant-design/icons";

const DashboardPage = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDashboard();
    }, []);

    const getDashboard = async () => {
        setLoading(true);
        const res = await getDashboardAPI();
        setLoading(false);
        if (res && res.data) {
            setData(res.data);
        } else {
            setData([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const configLine = {
        data: data.reports,
        xField: 'month',
        yField: 'orderCount',
        height: 400,
        point: {
            shapeField: 'circle',
            sizeField: 4,
        },
        interaction: {
            tooltip: {
                marker: false,
            },
        },
        tooltip: {
            title: '',
            items: [{ channel: 'x', name: 'Date' }, { channel: 'y', name: 'Order' }],
        },
        style: {
            lineWidth: 2,
        },
        loading: loading,
    };

    const configPie = {
        data: data.analytics || [],
        angleField: 'orderCount',
        colorField: 'status',
        innerRadius: 0.6,
        height: 400,
        legend: false,
        label: {
            text: 'orderCount',
            style: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: (d) => {
            let color = '';
            switch (d.status) {
                case 'Pending':
                    color = '#DBD3D3';
                    break;
                case 'Processing':
                    color = '#4379F2';
                    break;
                case 'Shipping':
                    color = '#FFF0D1';
                    break;
                case 'Delivered':
                    color = '#6EC207';
                    break;
                case 'Canceled':
                    color = '#C96868';
                    break;
            }
            let percent = Math.floor(d.orderCount / data.orderTotal * 100);
            return {name: d.status, value: `${percent}%`, color: color}
        },
        style: {
            radius: 12,
            inset: 1,
            fill: ({ status }) => {
                let color = '';
                switch (status) {
                    case 'Pending':
                        color = '#DBD3D3';
                        break;
                    case 'Processing':
                        color = '#4379F2';
                        break;
                    case 'Shipping':
                        color = '#FFF0D1';
                        break;
                    case 'Delivered':
                        color = '#6EC207';
                        break;
                    case 'Canceled':
                        color = '#C96868';
                        break;
                }
                return color;
            },
        },
        loading: loading,
        annotations: [
            {
                type: 'text',
                tooltip: false,
                style: {
                    text: `Total\n${data.orderTotal}`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 36,
                    fontStyle: 'bold',
                },
            },
        ],
    };

    const formatter = (value) => <CountUp end={value} separator="," />;

    return (
        <>
            <Flex vertical gap={16} style={{marginBottom: 24}}>
                <Row gutter={24}>
                    <Col span={6}>
                        <Card bordered={false} style={{padding: 8, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                            <Flex gap={16} align='center'>
                                <Avatar
                                    style={{
                                        backgroundColor: 'rgba(13,146,244,0.2)',
                                        color: '#0D92F4',
                                        width: 60,
                                        height: 60
                                    }}
                                >
                                    <UserOutlined style={{fontSize: 24}}/>
                                </Avatar>
                                <Flex vertical>
                                    <Statistic style={{fontWeight: 500}} value={data.userTotal} formatter={formatter} />
                                    <div>Users</div>
                                </Flex>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} style={{padding: 8, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                            <Flex gap={16} align='center'>
                                <Avatar
                                    style={{
                                        backgroundColor: 'rgba(255,173,96,0.2)',
                                        color: '#FFAD60',
                                        width: 60,
                                        height: 60
                                    }}
                                >
                                    <ShopFilled style={{fontSize: 24}}/>
                                </Avatar>
                                <Flex vertical>
                                    <Statistic style={{fontWeight: 500}} value={data.brandTotal} formatter={formatter} />
                                    <div>Brands</div>
                                </Flex>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} style={{padding: 8, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                            <Flex gap={16} align='center'>
                                <Avatar
                                    style={{
                                        backgroundColor: 'rgba(114,191,120,0.2)',
                                        color: '#72BF78',
                                        width: 60,
                                        height: 60
                                    }}
                                >
                                    <ProductFilled style={{fontSize: 24}}/>
                                </Avatar>
                                <Flex vertical>
                                    <Statistic style={{fontWeight: 500}} value={data.productTotal} formatter={formatter} />
                                    <div>Products</div>
                                </Flex>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} style={{padding: 8, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                            <Flex gap={16} align='center'>
                                <Avatar
                                    style={{
                                        backgroundColor: 'rgba(203,96,64,0.2)',
                                        color: '#CB6040',
                                        width: 60,
                                        height: 60
                                    }}
                                >
                                    <ShoppingFilled style={{fontSize: 24}}/>
                                </Avatar>
                                <Flex vertical>
                                    <Statistic style={{fontWeight: 500}} value={data.orderTotal} formatter={formatter} />
                                    <div>Orders</div>
                                </Flex>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </Flex>

            {data.reports && data.analytics &&
                <Row gutter={24} justify='space-between'>
                    <Col span={16}>
                        <Flex vertical style={{background: '#fff', borderRadius: 8, padding: 16}}>
                            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Reports</div>
                            <Line {...configLine} />
                        </Flex>
                    </Col>

                    <Col span={8}>
                        <Flex vertical style={{background: '#fff', borderRadius: 8, padding: 16}}>
                            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Analytics</div>
                            <Pie {...configPie} />
                        </Flex>
                    </Col>
                </Row>
            }
        </>
    );
}

export default DashboardPage;