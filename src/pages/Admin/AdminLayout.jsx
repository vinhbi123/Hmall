import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container, Row, Col, Navbar } from "react-bootstrap";
import { House, Box, FileText } from "react-bootstrap-icons";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

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
          className="btn btn-sm btn-light mt-auto"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <Navbar bg="light" className="shadow-sm px-3 ">
          <Navbar.Brand className="fw-bold">Admin Panel</Navbar.Brand>
        </Navbar>

        {/* Content */}
        <Container fluid className="p-4" >
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
