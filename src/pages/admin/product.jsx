import {Outlet} from "react-router-dom";

const ProductPage = () => {

    return (
        <div style={{background: '#fff', borderRadius: 8, padding: 16}}>
            <Outlet/>
        </div>
    );
}

export default ProductPage;