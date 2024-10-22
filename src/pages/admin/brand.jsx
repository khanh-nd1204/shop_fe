import {useEffect, useState} from "react";
import {Avatar, Button, Flex, Input, message, notification, Popconfirm, Select, Space, Table, Tag} from "antd";
import {deleteBrandAPI, getBrandsAPI} from "../../services/brand.service.js";
import {ExportOutlined, ImportOutlined, PlusOutlined} from "@ant-design/icons";
import CreateBrand from "../../components/brand/create-brand.jsx";
import UpdateBrand from "../../components/brand/update-brand.jsx";
import {getCountriesAPI} from "../../services/public.service.js";
import * as xlsx from "xlsx";

const BrandPage = () => {
    const [brandData, setBrandData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState('');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [brandSelected, setBrandSelected] = useState({});
    const [countries, setCountries] = useState([]);
    const { Search } = Input;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getBrandList();
    }, [current, pageSize, sort, search]);

    useEffect(() => {
        getCountryList();
    }, []);

    const getBrandList = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        if (sort) query += sort;
        if (search) query += search;
        setLoading(true);
        const res = await getBrandsAPI(query);
        setLoading(false);
        if (res && res.data) {
            setBrandData(res.data.data);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        } else {
            setBrandData([]);
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 2
            });
        }
    }

    const getCountryList = async () => {
        const res = await getCountriesAPI();
        if (res && res.data) {
            const filterData = res.data.data.map(item => {
                return {
                    label: item.name,
                    value: item.name
                }
            });
            setCountries(filterData);
        } else {
            setCountries([]);
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

    const deleteBrand = async (id) => {
        const res = await deleteBrandAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getBrandList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const exportData = () => {
        if (brandData.length > 0) {
            const filteredData = brandData.map(item => ({
                Name: item.name,
                Country: item.country,
                Update: item.updatedAt,
                Create: item.createdAt,
            }));
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            xlsx.writeFile(workbook, "brand-data.csv");
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
            title: 'Logo',
            align: 'center',
            render: (_, record, index) => {
                return (
                    <Avatar src={`${import.meta.env.VITE_BACKEND_URL}/images/brand/${record.logo}`} />
                );
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Country',
            dataIndex: 'country',
            sorter: true,
        },
        {
            title: 'Created at',
            dataIndex: 'createdAt',
            render: (_, record, index) => {
                return (
                    <>{new Date(record.createdAt).toLocaleString("en-GB").replace(',', '')}</>
                );
            },
            sorter: true,
        },
        {
            title: 'Updated at',
            dataIndex: 'updatedAt',
            render: (_, record, index) => {
                return (
                    <>{new Date(record.updatedAt).toLocaleString("en-GB").replace(',', '')}</>
                );
            },
            sorter: true,
        },
        {
            title: 'Action',
            render: (_, record, index) => (
                <Space size="middle">
                    <Button onClick={() => {
                        setOpenUpdate(true);
                        setBrandSelected(record);
                    }}>
                        Update
                    </Button>
                    <Popconfirm
                        title="Delete brand"
                        description="Are you sure to delete this brand?"
                        onConfirm={() => deleteBrand(record._id)}
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
            value: 'country',
            label: 'Country',
        },
    ];

    return (
        <div style={{background: '#fff', borderRadius: 8, padding: 16}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Brand Table</div>
            <Flex style={{marginBottom: 16}} justify='space-between'>
                <Space.Compact>
                    <Select value={searchType} options={options} onChange={(value) => setSearchType(value)}/>
                    <Search placeholder="Filter brand" onSearch={onSearch} style={{width: 300}} />
                </Space.Compact>

                <Flex gap={8}>
                    <Button type="primary" onClick={exportData}><ExportOutlined /> Export</Button>
                    <Button type="primary" onClick={() => setOpenCreate(true)}>
                        <PlusOutlined /> Create
                    </Button>
                </Flex>
            </Flex>
            <Table loading={loading} columns={columns} dataSource={brandData} rowKey={'_id'} onChange={onChange} pagination={{
                current: current,
                pageSize: pageSize,
                showSizeChanger: true,
                total: total,
                showTotal: (total, range) => { return (<div> {range[0]} - {range[1]} / {total} rows</div>) },
            }}/>
            <CreateBrand openCreate={openCreate} setOpenCreate={setOpenCreate} countries={countries} getBrandList={getBrandList}/>
            <UpdateBrand openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} countries={countries} getBrandList={getBrandList}
                         brandSelected={brandSelected} setBrandSelected={setBrandSelected}/>
        </div>
    );
}

export default BrandPage;