import {Badge, Descriptions, Drawer, Image, Table, Tag} from "antd";
import React from "react";

const ViewOrder = (props) => {
    const {openDetail, setOpenDetail, orderSelected, setOrderSelected} = props;
    const items = [
        {
            key: 'id',
            label: 'Id',
            children: orderSelected._id,
            span: 3
        },
        {
            key: 'name',
            label: 'Name',
            children: orderSelected.name,
            span: 1.5
        },
        {
            key: 'email',
            label: 'Email',
            children: orderSelected.email,
            span: 1.5
        },
        {
            key: 'phone',
            label: 'Phone',
            children: orderSelected.phone,
            span: 1.5
        },
        {
            key: 'address',
            label: 'Address',
            children: orderSelected.addressDetail + ', ' + orderSelected.address,
            span: 1.5
        },
        {
            key: 'note',
            label: 'Note',
            children: orderSelected.note,
            span: 1.5
        },
        {
            key: 'method',
            label: 'Method',
            children: orderSelected.paymentMethod,
            span: 1.5
        },
        {
            key: 'totalPrice',
            label: 'Payment',
            children: new Intl.NumberFormat('vi-VN', {
                style: 'currency', currency: 'VND'
            }).format(orderSelected.totalPrice),
            span: 1.5
        },
        {
            key: 'status',
            label: 'Status',
            children: (() => {
                let color = '';
                switch (orderSelected.status) {
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
                return <Badge key={color} color={color} text={orderSelected.status} />
            })(),  // Notice the extra parentheses to immediately invoke the function
            span: 1.5,
        },
        {
            key: 'create',
            label: 'Order at',
            children: new Date(orderSelected.createdAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
        {
            key: 'update',
            label: orderSelected.status + ' at',
            children: new Date(orderSelected.updatedAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
    ];

    const detailColumns = [
        {
            title: 'Id',
            dataIndex: '_id',
        },
        {
            title: 'Image',
            align: 'center',
            render: (_, record, index) => {
                return (
                    <Image src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${record.image}`}
                            style={{width: 80, height: 80, objectFit: 'contain', border: '1px solid #e8e8e8'}}
                    />
                );
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        // {
        //     title: 'Brand',
        //     dataIndex: 'brand',
        // },
        {
            title: 'Amout',
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
                const total = amount * quantity;
                if (total) {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency', currency: 'VND'
                    }).format(total)
                }
            },
        },
    ];

    return (
        <Drawer width={900} title="Order Detail" open={openDetail} onClose={() => {
            {
                setOpenDetail(false);
                setOrderSelected({});
            }
        }}>
            <Descriptions title="Order Info" bordered items={items} />
            <div style={{margin: "20px 0", fontSize: 16, fontWeight: 600}}>Order Products</div>
            <Table
                columns={detailColumns}
                dataSource={orderSelected.detail}
                pagination={false}
                rowKey={(item) => item._id} // Key for nested table rows
            />
        </Drawer>
    );
}

export default ViewOrder;