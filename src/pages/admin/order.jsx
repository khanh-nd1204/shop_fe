import {useEffect, useState} from "react";
import {Button, Flex, Input, message, notification, Popconfirm, Select, Space, Table, Tag} from "antd";
import * as xlsx from "xlsx";
import {cancelOrderAPI, getOrdersAPI} from "../../services/order.service.js";
import {ExportOutlined} from "@ant-design/icons";
import UpdateOrder from "../../components/order/update-order.jsx";
import ViewOrder from "../../components/order/view-order.jsx";

const OrderPage = () => {
    const [orderData, setOrderData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState('');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [orderSelected, setOrderSelected] = useState({});
    const { Search } = Input;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getOrderList();
    }, [current, pageSize, sort, search]);

    const getOrderList = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        if (sort) query += sort;
        if (search) query += search;
        setLoading(true);
        const res = await getOrdersAPI(query);
        setLoading(false);
        if (res && res.data) {
            setOrderData(res.data.data);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        } else {
            setOrderData([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    const onChange = (pagination, filters, sorter, extra) => {
        // setCurrent, setPageSize
        //nếu thay đổi trang : current
        if (pagination && pagination.current) {
            if (+pagination.current !== +current) {
                setCurrent(+pagination.current) //"5" => 5
            }
        }
        //nếu thay đổi tổng số phần tử : pageSize
        if (pagination && pagination.pageSize) {
            if (+pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize) //"5" => 5
            }
        }

        if (sorter && sorter.field && sorter.order) {
            const sortQuery = sorter.order === "descend" ? `&sort=-${sorter.field}` : `&sort=${sorter.field}`;
            setSort(sortQuery);
        } else {
            setSort('');
        }
    };

    const onSearch = (value) => {
        setCurrent(1);
        if (value) {
            const searchValue = `&${searchType}=/${value}/i`;
            setSearch(searchValue);
        } else {
            setSearch('');
        }
    }

    const exportData = () => {
        if (orderData.length > 0) {
            const filteredData = orderData.map(item => ({
                Name: item.name,
                Phone: item.phone,
                Address: `${item.addressDetail}, ${item.address}`,
                Price: item.totalPrice,
                Note: item.note,
                Payment: item.paymentMethod,
                Status: item.status,
                Date: item.createdAt
            }));
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            xlsx.writeFile(workbook, "order-data.csv");
        } else {
            message.error('No data!');
        }
    };

    const cancelOrder = async (id) => {
        const res = await cancelOrderAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getOrderList();
        } else {
            setOrderData([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    const columns = [
        {
            title: 'Index',
            align: 'center',
            render: (_, record, index) => {
                return (
                    <>{(index + 1) + (current - 1) * pageSize}</>
                );
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_, record) => {
                return (
                    <a onClick={() => {
                        {
                            setOrderSelected(record);
                            setOpenDetail(true);
                        }
                    }}
                    >
                        {record.name}
                    </a>
                );
            },
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            sorter: true,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            render: (_, record) => {
                return (
                    <>{record.addressDetail}, {record.address}</>
                );
            },
        },
        {
            title: 'Payment',
            dataIndex: 'totalPrice',
            render : (_, { totalPrice }) => {
                if (totalPrice) {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency', currency: 'VND'
                    }).format(totalPrice)
                }
            },
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (_, { status }) => {
                let color = '';
                switch (status) {
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
                    <Tag color={color}>{status}</Tag>
                );
            },
            sorter: true,
        },
        {
            title: 'Order at',
            dataIndex: 'createdAt',
            render: (_, {createdAt}) => {
                return new Date(createdAt).toLocaleString("en-GB").replace(',' ,'')
            },
            sorter: true,
        },
        {
            title: 'Action',
            render: (_, record, index) => {
                let status = record.status;
                return (
                    <Space size="middle">
                        {status !== 'Canceled' && status !== 'Delivered' ?
                            <>
                                <Button onClick={() => {
                                    setOrderSelected(record);
                                    setOpenUpdate(true);
                                }}>
                                    Update
                                </Button>
                                <Popconfirm
                                    title="Cancel order"
                                    description="Are you sure to cancel this order?"
                                    onConfirm={() => cancelOrder(record._id)}
                                    placement="left"
                                >
                                    <Button danger={true}>Cancel</Button>
                                </Popconfirm>
                            </>
                            :
                            <Button onClick={() => {
                                setOrderSelected(record);
                                setOpenDetail(true);
                            }}>
                                View
                            </Button>
                        }
                    </Space>
                );
            }
        }
    ];

    const expandedRowRender = (record) => {
        const detailColumns = [
            {
                title: 'Id',
                dataIndex: '_id',
            },
            {
                title: 'Product name',
                dataIndex: 'name',
            },
            {
                title: 'Price',
                dataIndex: 'amount',
                render : (_, { amount }) => {
                    if (amount) {
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency', currency: 'VND'
                        }).format(amount)
                    }
                },
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
            },
            {
                title: 'Total amount',
                dataIndex: 'quantity',
                render : (_, { amount, quantity }) => {
                    const totalPrice = amount * quantity;
                    if (totalPrice) {
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency', currency: 'VND'
                        }).format(totalPrice)
                    }
                },
            },
        ];

        return (
            <Table
                columns={detailColumns}
                dataSource={record.detail.map((item) => ({ ...item, key: item._id }))}
                pagination={false}
                rowKey={(item) => item._id} // Key for nested table rows
            />
        );

    };

    const options = [
        {
            value: 'name',
            label: 'Name',
        },
        {
            value: 'email',
            label: 'Email',
        },
        {
            value: 'phone',
            label: 'Phone',
        },
    ];

    return (
        <div style={{background: '#fff', borderRadius: 8, padding: 16}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Order Table</div>
            <Flex style={{marginBottom: 16}} justify='space-between'>
                <Space.Compact>
                    <Select value={searchType} options={options} onChange={(value) => setSearchType(value)}/>
                    <Search placeholder="Filter product" onSearch={onSearch} style={{width: 300}} />
                </Space.Compact>

                <Flex gap={8}>
                    <Button type="primary" onClick={exportData}><ExportOutlined /> Export</Button>
                </Flex>
            </Flex>
            <Table loading={loading} columns={columns} dataSource={orderData} rowKey={'_id'}  onChange={onChange}
                   expandable={{expandedRowRender}}
                   pagination={{
                        current: current,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        total: total,
                        showTotal: (total, range) => { return (<div> {range[0]} - {range[1]} / {total} rows</div>) },
                   }}
            />
            <UpdateOrder openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} getOrderList={getOrderList}
                         orderSelected={orderSelected} setOrderSelected={setOrderSelected}/>
            <ViewOrder openDetail={openDetail} setOpenDetail={setOpenDetail} orderSelected={orderSelected}
                       setOrderSelected={setOrderSelected}/>
        </div>
    );
}

export default OrderPage;