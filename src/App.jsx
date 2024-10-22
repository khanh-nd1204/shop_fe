import './App.css'
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import LoginPage from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import {useDispatch, useSelector} from "react-redux";
import AdminLayout from "./components/layout/admin-layout.jsx";
import NotPermitted from "./components/error/not-permitted.jsx";
import NotFound from "./components/error/not-found.jsx";
import DashboardPage from "./pages/admin/dashboard.jsx";
import UserPage from "./pages/admin/user.jsx";
import {useEffect, useState} from "react";
import {fetchAccountAPI} from "./services/auth.service.js";
import {doGetAccountAction} from "./redux/account/accountSlice.js";
import HomePage from "./pages/home/home.jsx";
import {Flex, Spin} from "antd";
import BrandPage from "./pages/admin/brand.jsx";
import {getProvincesAPI} from "./services/public.service.js";
import CreateProduct from "./components/product/create-product.jsx";
import ProductTable from "./components/product/product-table.jsx";
import ProductPage from "./pages/admin/product.jsx";
import UpdateProduct from "./components/product/update-product.jsx";
import OrderPage from "./pages/admin/order.jsx";
import ClientLayout from "./components/layout/client-layout.jsx";
import ProductDetail from "./components/product/product-detail.jsx";
import CartPage from "./pages/cart/cart.jsx";
import HistoryPage from "./pages/history/history.jsx";
import {LoadingOutlined} from "@ant-design/icons";
import SearchPage from "./pages/search/search.jsx";
import {getAllBrandAPI} from "./services/brand.service.js";

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.account.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAccount();
    getProvinceList();
    getBrandList();
  }, []);

  const getAccount = async () => {
    setLoading(true);
    const res = await fetchAccountAPI();
    setLoading(false);
    if (res && res.data) {
      dispatch(doGetAccountAction(res.data));
    }
  }

  const getProvinceList = async () => {
    const res = await getProvincesAPI();
    if (res && res.data) {
      const treeData = res.data.map(province => {
        const provinceNode = {
          value: province.name,
          label: province.name,
        };
        if (province.districts && province.districts.length > 0) {
          provinceNode.children = province.districts.map(district => {
            const districtNode = {
              value: district.name,
              label: district.name,
            };
            if (district.wards && district.wards.length > 0) {
              districtNode.children = district.wards.map(ward => ({
                value: ward.name,
                label: ward.name,
              }));
            }
            return districtNode;
          });
        }
        return provinceNode;
      });
      localStorage.setItem('province-list', JSON.stringify(treeData));
    }
  }

  const getBrandList = async () => {
    const res = await getAllBrandAPI();
    if (res && res.data) {
      const filteredData = res.data.map(item => {
        return {
          label: item.name,
          value: item.name
        }
      });
      localStorage.setItem('brand-list', JSON.stringify(filteredData));
    }
  }

  const Admin = () => {
    if (user && user.role === "ADMIN") {
      return (
          <AdminLayout>
            <Outlet/>
          </AdminLayout>
      );
    }
    return <NotPermitted/>
  }

  const Client = () => {
    return (
        <ClientLayout>
          <Outlet/>
        </ClientLayout>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Client/>,
      errorElement: <NotFound/>,
      children: [
        {
          index: true,
          element: <HomePage/>
        },
        {
          path: "product",
          element: <ProductDetail/>,
        },
        {
          path: "search",
          element: <SearchPage/>,
        },
        {
          path: "cart",
          element: <CartPage/>,
        },
        {
          path: "history",
          element: <HistoryPage/>,
        },
      ],
    },
    {
      path: "/admin",
      element: <Admin/>,
      errorElement: <NotFound/>,
      children: [
        {
          index: true,
          element: <DashboardPage/>
        },
        {
          path: "user",
          element: <UserPage/>,
        },
        {
          path: "brand",
          element: <BrandPage/>,
        },
        {
          path: "product",
          element: <ProductPage><Outlet/></ProductPage>,
          children: [
            {
              index: true,
              element: <ProductTable/>
            },
            {
              path: "create",
              element: <CreateProduct/>,
            },
            {
              path: "update",
              element: <UpdateProduct/>,
            },
          ]
        },
        {
          path: "order",
          element: <OrderPage/>,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage/>,
    },
    {
      path: "/register",
      element: <Register/>,
    },
  ]);

  return (
      <>
        {loading ?
            <Flex justify='center' align='center' style={{height: '100vh'}}>
              <Spin indicator={<LoadingOutlined spin style={{fontSize: 48}} />} size="large" />
            </Flex>
            :
            <RouterProvider router={router} />
        }
      </>
  );
}

export default App;
