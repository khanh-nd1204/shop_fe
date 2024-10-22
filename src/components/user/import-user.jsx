import React, {useState} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import {message, Modal, notification, Table, Upload} from 'antd';
import * as xlsx from "xlsx";
import sampleFile from "./template.xlsx?url"
import {createBulkUserAPI} from "../../services/user.service.js";

const ImportUser = (props) => {
    const {openImport, setOpenImport, getUserList} = props;
    const [loading, setLoading] = useState(false);
    const { Dragger } = Upload;
    const [tableData, setTableData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const dummyRequest = async ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 1000);
    }

    const uploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        customRequest: dummyRequest,
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
                if (info.file && info.file.originFileObj) {
                    const file = info.file.originFileObj;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = e.target.result;
                        const workbook = xlsx.read(data, {type: "array"});
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json = xlsx.utils.sheet_to_json(worksheet, {
                            header: ["name", "email", "phone", "address"],
                            range: 1
                        });
                        if (json && json.length > 0) {
                            const data = json.map(item => item = {...item, password: "123456"}); // password default
                            setTableData(data);
                        }
                    }
                    reader.readAsArrayBuffer(file);
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove() {
            setTableData([]);
        },
        beforeUpload(file) {
            const isExcelOrCSV = ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".includes(file.type);
            if (!isExcelOrCSV) {
                message.error(`${file.name} file upload failed.`);
            }
            return isExcelOrCSV;
        }
    };

    const handleImport = async () => {
        setLoading(true);
        const res = await createBulkUserAPI(tableData);
        setLoading(false);
        if (res && res.data) {
            notification.success({
                message: "Uploaded successfully",
                description: `File success: ${res.data.success}, file error: ${res.data.fail}`,
                duration: 3
            });
            resetUpload();
            await getUserList();
        } else {
            notification.error({
                message: res.error,
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 3
            });
        }
    };

    const onChange = (pagination, filters, sorter, extra) => {
        //nếu thay đổi trang : current
        if (pagination && pagination.current) {
            if (+pagination.current !== +current) {
                setCurrent(+pagination.current) //"5" => 5
            }
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
        },
        {
            title: 'Address',
            dataIndex: 'address',
        }
    ];

    const resetUpload = () => {
        setTableData([]);
        setOpenImport(false);
    }

    return (
        <Modal title="Import Data User" open={openImport} onOk={handleImport} onCancel={resetUpload}
               maskClosable={false} confirmLoading={loading} okText="Import" width={1000}
               okButtonProps={{disabled: tableData.length === 0}} destroyOnClose={true}>
            <Dragger {...uploadProps} >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Only accept .csv, .xls, .xlsx.&nbsp;
                    <a onClick={(e) => e.stopPropagation()}
                       href={sampleFile} download>Download sample file</a>
                </p>
            </Dragger>

            <Table columns={columns} dataSource={tableData} rowKey={'email'} onChange={onChange} style={{marginTop: 16}}
                   pagination={{
                        current: current,
                        pageSize: pageSize,
                        showSizeChanger: false,
                        total: total,
                        showTotal: (total, range) => { return (<div> {range[0]} - {range[1]} / {total} rows</div>) },
                   }}
            />
        </Modal>
    );
}

export default ImportUser;