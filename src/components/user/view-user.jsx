import React  from 'react';
import {Badge, Descriptions, Drawer, Image} from 'antd';

const ViewUser = (props) => {
    const {openDetail, setOpenDetail, userSelected, setUserSelected} = props;
    const items = [
        {
            key: 'id',
            label: 'Id',
            children: userSelected._id,
            span: 3
        },
        {
            key: 'name',
            label: 'Name',
            children: userSelected.name,
            span: 1.5
        },
        {
            key: 'email',
            label: 'Email',
            children: userSelected.email,
            span: 1.5
        },
        {
            key: 'phone',
            label: 'Phone',
            children: userSelected.phone,
            span: 1.5
        },
        {
            key: 'address',
            label: 'Address',
            children: userSelected.address,
            span: 1.5
        },
        {
            key: 'role',
            label: 'Role',
            children: userSelected.role,
            span: 1.5
        },
        {
            key: 'status',
            label: 'Status',
            children: <Badge status={userSelected.isActive ? "processing" : "error"}
                             text={userSelected.isActive ? "Active" : "Inactive"} />,
            span: 3,
        },
        {
            key: 'create',
            label: 'Created at',
            children: new Date(userSelected.createdAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
        {
            key: 'update',
            label: userSelected.isActive ? 'Updated at' : 'Deleted at',
            children: new Date(userSelected.updatedAt).toLocaleString("en-GB").replace(',' ,''),
            span: 1.5
        },
    ];

    return (
        <Drawer size={"large"} title="User Detail" open={openDetail} onClose={() => {
            {
                setOpenDetail(false);
                setUserSelected({});
            }
        }}>
            <Descriptions title="User Info" bordered items={items} />
            {userSelected.avatar &&
                <>
                    <div style={{margin: "20px 0", fontSize: 16, fontWeight: 600}}>User Thumbnail</div>
                    <Image key={userSelected._id} src={`${import.meta.env.VITE_BACKEND_URL}/images/user/${userSelected.avatar}`}
                           style={{width: 120, height: 120, objectFit: "contain"}}/>
                </>
            }
        </Drawer>
    );
};
export default ViewUser;