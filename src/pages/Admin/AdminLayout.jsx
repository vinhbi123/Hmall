import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";
import { House, Box, FileText, BoxArrowRight } from "react-bootstrap-icons";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "70px" : "220px",
          backgroundColor: "#84b4c8",
          color: "#fff",
          transition: "0.3s",
          zIndex: 99999,
        }}
        className="p-3 d-flex flex-column"
      >
        <h4
          className="text-white fw-bold mb-4"
          style={{ display: collapsed ? "none" : "block" }}
        >
          HMall
        </h4>
        <NavLink
          to="/admin"
          end
          className="mb-3 text-white text-decoration-none d-flex align-items-center"
        >
          <House className="me-2" /> {!collapsed && "Dashboard"}
        </NavLink>
        <NavLink
          to="/admin/products"
          className="mb-3 text-white text-decoration-none d-flex align-items-center"
        >
          <Box className="me-2" /> {!collapsed && "Products"}
        </NavLink>
        <NavLink
          to="/admin/posts"
          className="mb-3 text-white text-decoration-none d-flex align-items-center"
        >
          <FileText className="me-2" /> {!collapsed && "Posts"}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-sm btn-light mt-auto mb-2"
        >
          {collapsed ? "»" : "«"}
        </button>
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
            style={{ width: "100%" }}
            title="Đăng xuất"
          >
            <BoxArrowRight size={22} />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-danger"
            style={{ width: "100%" }}
          >
            Đăng xuất
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <Navbar bg="light" className="shadow-sm px-3 ">
          <Navbar.Brand className="fw-bold">Admin Panel</Navbar.Brand>
        </Navbar>

        {/* Content */}
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
