import {Button, Flex, Input, message, notification, Popconfirm, Select, Skeleton, Space, Table, Tag} from "antd";
import {useEffect, useState} from "react";
import {deleteUserAPI, getUsersAPI, activateUserAPI} from "../../services/user.service.js";
import {ExportOutlined, ImportOutlined, PlusOutlined} from "@ant-design/icons";
import CreateUser from "../../components/user/create-user.jsx";
import ViewUser from "../../components/user/view-user.jsx";
import UpdateUser from "../../components/user/update-user.jsx";
import * as xlsx from "xlsx";
import ImportUser from "../../components/user/import-user.jsx";

const UserPage = () => {
    const [userData, setUserData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState('');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [openCreate, setOpenCreate] = useState(false);
    const [userSelected, setUserSelected] = useState({});
    const [openDetail, setOpenDetail] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const { Search } = Input;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUserList();
    }, [current, pageSize, sort, search]);


    const getUserList = async () => {
        let query = `?current=${current}&pageSize=${pageSize}`;
        if (sort) query += sort;
        if (search) query += search;
        setLoading(true);
        const res = await getUsersAPI(query);
        setLoading(false);
        if (res && res.data) {
            setUserData(res.data.data);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        } else {
            setUserData([]);
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

    const deleteUser = async (id) => {
        const res = await deleteUserAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getUserList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    }

    const activateUser = async (id) => {
        const res = await activateUserAPI(id);
        if (res && res.data) {
            message.success(res.message);
            await getUserList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const exportData = () => {
        if (userData.length > 0) {
            const filteredData = userData.map(item => ({
                Name: item.name,
                Email: item.email,
                Phone: item.phone,
                Address: item.address,
                Role: item.role,
                Active: item.isActive
            }));
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            xlsx.writeFile(workbook, "user-data.csv");
        } else {
            message.error('No data!');
        }
    };

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
                            setUserSelected(record);
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
            sorter: true,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (_, { isActive }) => {
                let status = isActive ? "Active" : "Inactive"
                let color = isActive ? 'green' : 'volcano';
                return (
                    <Tag color={color}>{status}</Tag>
                );
            },
            sorter: true,
        },
        {
            title: 'Action',
            render: (_, record, index) => {
                let isActive = record.isActive;
                return (
                    <Space size="middle">
                        <Button onClick={() => {
                            setOpenUpdate(true);
                            setUserSelected(record);
                        }}>
                            Update
                        </Button>
                        {isActive ?
                            <Popconfirm
                                title="Delete user"
                                description="Are you sure to delete this user?"
                                onConfirm={() => deleteUser(record._id)}
                                placement="left"
                            >
                                <Button danger={true}>Delete</Button>
                            </Popconfirm>
                            :
                            <Popconfirm
                                title="Activate user"
                                description="Are you sure to activate this user?"
                                onConfirm={() => activateUser(record._id)}
                                placement="left"
                            >
                                <Button>Activate</Button>
                            </Popconfirm>
                        }
                    </Space>
                );
            },
        }
    ];

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
        {
            value: 'address',
            label: 'Address',
        },
    ];

    return (
        <div style={{background: '#fff', borderRadius: 8, padding: 16}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>User Table</div>
            <Flex style={{marginBottom: 16}} justify='space-between'>
                <Space.Compact>
                    <Select value={searchType} options={options} onChange={(value) => setSearchType(value)}/>
                    <Search placeholder="Filter user" onSearch={onSearch} style={{width: 300}} />
                </Space.Compact>

                <Flex gap={8}>
                    <Button type="primary" onClick={exportData}><ExportOutlined /> Export</Button>
                    <Button type="primary" onClick={() => setOpenImport(true)}>
                        <ImportOutlined /> Import
                    </Button>
                    <Button type="primary" onClick={() => setOpenCreate(true)}>
                        <PlusOutlined /> Create
                    </Button>
                </Flex>
            </Flex>

            <Table loading={loading} columns={columns} dataSource={userData} rowKey={'_id'} onChange={onChange} pagination={{
                current: current,
                pageSize: pageSize,
                showSizeChanger: true,
                total: total,
                showTotal: (total, range) => { return (<div> {range[0]} - {range[1]} / {total} rows</div>) },
            }}/>

            <CreateUser openCreate={openCreate} setOpenCreate={setOpenCreate} getUserList={getUserList}/>
            <ViewUser openDetail={openDetail} setOpenDetail={setOpenDetail} userSelected={userSelected}
                      setUserSelected={setUserSelected}/>
            <UpdateUser openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} getUserList={getUserList}
                        userSelected={userSelected} setUserSelected={setUserSelected}/>
            <ImportUser openImport={openImport} setOpenImport={setOpenImport} getUserList={getUserList}/>
        </div>
    );
}

export default UserPage;