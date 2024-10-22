import {Descriptions, Drawer, Image, Tag} from "antd";
import React from "react";
import { v4 as uuidv4 } from 'uuid';

const ViewProduct = (props) => {
    const {openDetail, setOpenDetail, productSelected, setProductSelected} = props;

    const items = [
        {
            key: 'id',
            label: 'Id',
            children: productSelected._id,
            span: 3
        },
        {
            key: 'name',
            label: 'Name',
            children: productSelected.name,
            span: 1.5
        },
        {
            key: 'brand',
            label: 'Brand',
            children: productSelected.brand,
            span: 1.5
        },
        {
            key: 'price',
            label: 'Price',
            children: new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                .format(productSelected.price),
            span: 1.5
        },
        {
            key: 'discount',
            label: 'Discount',
            children:  <Tag color={'#ec3651'}>-{productSelected.discount}%</Tag>,
            span: 1.5,
        },
        {
            key: 'quantity',
            label: 'Quantity',
            children: new Intl.NumberFormat('vi-VN').format(productSelected.quantity),
            span: 1.5
        },
        {
            key: 'sold',
            label: 'Sold',
            children: new Intl.NumberFormat('vi-VN').format(productSelected.sold),
            span: 1.5
        },
        {
            key: 'battery',
            label: 'Battery',
            children: productSelected.detail?.battery,
            span: 1.5
        },
        {
            key: 'camera',
            label: 'Camera',
            children: productSelected.detail?.camera,
            span: 1.5
        },
        {
            key: 'gpu',
            label: 'GPU',
            children: productSelected.detail?.gpu,
            span: 1.5
        },
        {
            key: 'chip',
            label: 'Chip',
            children: productSelected.detail?.chip,
            span: 1.5
        },
        {
            key: 'ram',
            label: 'RAM',
            children: productSelected.detail?.ram,
            span: 1.5
        },
        {
            key: 'rom',
            label: 'ROM',
            children: productSelected.detail?.rom,
            span: 1.5
        },
        {
            key: 'create',
            label: 'Created at',
            children: new Date(productSelected.createdAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
        {
            key: 'update',
            label: 'Updated at',
            children: new Date(productSelected.updatedAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
    ];

    return (
        <>
            <Drawer size={"large"} title="Product Detail" open={openDetail} onClose={() => {
                {
                    setOpenDetail(false);
                    setProductSelected({});
                }
            }}>
                <Descriptions title="Product Info" bordered items={items} />
                <Image.PreviewGroup>
                    {productSelected.images &&
                        <>
                            <div style={{margin: "20px 0", fontSize: 16, fontWeight: 600}}>Product Images</div>
                            {productSelected.images.map(image => {
                                return (
                                    <Image key={uuidv4()} src={`${import.meta.env.VITE_BACKEND_URL}/images/product/${image}`}
                                           style={{width: 120, height: 120, objectFit: "contain"}}/>
                                );
                            })}
                        </>
                    }
                </Image.PreviewGroup>

            </Drawer>
        </>
    );
}

export default ViewProduct;