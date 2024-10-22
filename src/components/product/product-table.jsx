import {useEffect, useState} from "react";
import {Button, Flex, Input, message, notification, Popconfirm, Select, Space, Table, Tag} from "antd";
import * as xlsx from "xlsx";
import {ExportOutlined, PlusOutlined} from "@ant-design/icons";
import {deleteProductAPI, getProductsAPI} from "../../services/product.service.js";
import ViewProduct from "./view-product.jsx";
import {useNavigate} from "react-router-dom";

const ProductTable = () => {
    const [productData, setProductData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState('');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [productSelected, setProductSelected] = useState({});
    const [openDetail, setOpenDetail] = useState(false);
    const { Search } = Input;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getProductList();
    }, [current, pageSize, sort, search]);

    const getProductList = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        if (sort) query += sort;
        if (search) query += search;
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

    const deleteProduct = async (id) => {
        const res = await deleteProductAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getProductList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

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
        if (productData.length > 0) {
            const filteredData = productData.map(item => ({
                Name: item.name,
                Brand: item.brand,
                Price: item.price,
                Quantity: item.quantity,
                Sold: item.sold,
                Discount: item.discount,
            }));
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            xlsx.writeFile(workbook, "product-data.csv");
        } else {
            message.error('No data!');
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
                            setProductSelected(record);
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
            title: 'Brand',
            dataIndex: 'brand',
            sorter: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render : (_, {price}) => {
                if (price) {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency', currency: 'VND'
                    }).format(price)
                }
            },
            sorter: true,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            render: (_, { discount }) => {
                return (
                    <Tag color={'#ec3651'}>-{discount}%</Tag>
                );
            },
            sorter: true,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render : (_, {amount}) => {
                if (amount) {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency', currency: 'VND'
                    }).format(amount)
                }
            },
            sorter: true,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            render : (_, {quantity}) => {
                if (quantity) {
                    return new Intl.NumberFormat('vi-VN').format(quantity)
                }
            },
            sorter: true,
        },
        {
            title: 'Sold',
            dataIndex: 'sold',
            render : (_, {sold}) => {
                if (sold) {
                    return new Intl.NumberFormat('vi-VN').format(sold)
                }
            },
            sorter: true,
        },
        {
            title: 'Remain',
            dataIndex: 'remain',
            render : (_, {remain}) => {
                if (remain) {
                    return new Intl.NumberFormat('vi-VN').format(remain)
                }
            },
            sorter: true,
        },
        {
            title: 'Action',
            render: (_, record, index) => (
                <Space size="middle">
                    <Button onClick={() => {
                        navigate('/admin/product/update', {
                            state: record
                        })
                    }}>
                        Update
                    </Button>
                    <Popconfirm
                        title="Delete product"
                        description="Are you sure to delete this product?"
                        onConfirm={() => deleteProduct(record._id)}
                        placement="left"
                    >
                        <Button danger={true}>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    const options = [
        {
            value: 'name',
            label: 'Name',
        },
        {
            value: 'brand',
            label: 'Brand',
        },
    ];

    return (
        <>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Product Table</div>
            <Flex style={{marginBottom: 16}} justify='space-between'>
                <Space.Compact>
                    <Select value={searchType} options={options} onChange={(value) => setSearchType(value)}/>
                    <Search placeholder="Filter product" onSearch={onSearch} style={{width: 300}} />
                </Space.Compact>

                <Flex gap={8}>
                    <Button type="primary" onClick={exportData}><ExportOutlined /> Export</Button>
                    <Button type="primary" onClick={() => navigate('/admin/product/create')}>
                        <PlusOutlined /> Create
                    </Button>
                </Flex>
            </Flex>
            <Table loading={loading} columns={columns} dataSource={productData} rowKey={'_id'} onChange={onChange} pagination={{
                current: current,
                pageSize: pageSize,
                showSizeChanger: true,
                total: total,
                showTotal: (total, range) => { return (<div> {range[0]} - {range[1]} / {total} rows</div>) },
            }}/>
            <ViewProduct openDetail={openDetail} setOpenDetail={setOpenDetail} productSelected={productSelected}
                         setProductSelected={setProductSelected}/>
        </>
    );
}

export default ProductTable;