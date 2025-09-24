import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import ShopLayout from "./components/ShopLayout";

// Import pages
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Contact from "./pages/Contact/Contact";
import AboutUs from "./pages/AboutUs/AboutUs";
import Blog from "./pages/Blog/Blog";
import ProductDetail from "./pages/ProductsDetail/ProductDetail";
import BlogDetail from "./pages/Blog/BlogDetail";
import Login from "./pages/Login/Login";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import ShopProducts from "./pages/ProductsShop/ShopProducts";
import Register from "./pages/Register/Register";
import AdminLayout from "./pages/Admin/AdminLayout";
import DashboardHome from "./pages/Admin/DashboardHome";
import ProductsManager from "./pages/Admin/ProductsManager";
import PostsManager from "./pages/Admin/PostsManager";

// Dummy shop pages
const ShopDashboard = () => <div style={{ padding: 40 }}>Shop Dashboard</div>;
const ShopOrders = () => <div style={{ padding: 40 }}>Shop Orders</div>;
const ShopProfile = () => <div style={{ padding: 40 }}>Shop Profile</div>;

// RoleEnum mapping
const RoleEnum = {
  Admin: 1,
  Shop: 2,
  User: 3,
};

function getRole() {
  const role = localStorage.getItem("role");
  if (!role) return null;
  if (role === "Admin") return RoleEnum.Admin;
  if (role === "Shop") return RoleEnum.Shop;
  if (role === "User") return RoleEnum.User;
  return null;
}

// Component để kiểm tra vai trò và render layout
const AppContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isProfile = location.pathname === "/settings";
  const role = getRole();

  // Nếu là Admin, dùng AdminLayout với các route
  if (role === RoleEnum.Admin && location.pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="posts" element={<PostsManager />} />
        </Route>
      </Routes>
    );
  }

  // Nếu là Shop, dùng ShopLayout với các route
  if (role === RoleEnum.Shop && location.pathname.startsWith("/shop")) {
    return (
      <ShopLayout>
        <Routes>
          <Route path="/shop" element={<Navigate to="/shop/dashboard" replace />} />
          <Route path="/shop/dashboard" element={<ShopDashboard />} />
          <Route path="/shop/orders" element={<ShopOrders />} />
          <Route path="/shop/products" element={<ShopProducts />} />
          <Route path="/shop/profile" element={<ShopProfile />} />
        </Routes>
      </ShopLayout>
    );
  }

  // Mặc định là User
  return (
    <div className="App">
      {!isLogin && !isRegister && <Navbar />}
      <main>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/products"
            element={
              <PageTransition>
                <Products />
              </PageTransition>
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutUs />
              </PageTransition>
            }
          />
          <Route
            path="/cart"
            element={
              <PageTransition>
                <Cart />
              </PageTransition>
            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <Blog />
              </PageTransition>
            }
          />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="posts" element={<PostsManager />} />
          </Route>
        </Routes>
      </main>
      {/* Không hiện Footer và ScrollToTop khi ở trang login hoặc register */}
      {!isLogin && !isRegister && !isProfile && <Footer />}
      {!isLogin && !isRegister && <ScrollToTop />}

    </div>
  );
};


export default function AppWithRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}