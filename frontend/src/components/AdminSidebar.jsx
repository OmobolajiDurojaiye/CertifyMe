import React from "react";
import { Nav, Image } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Speedometer2,
  PeopleFill,
  BoxArrowRight,
  PaletteFill,
  CashStack,
  FileEarmarkText, // NEW for Certificates
  BarChartFill, // NEW for Analytics (use BarChart from icons)
} from "react-bootstrap-icons";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="sidebar">
      <div>
        <Link to="/admin/dashboard" className="sidebar-logo">
          <Image src="/images/certbadge.png" width={32} />
          <span>
            <span className="green">Certify</span>
            <span className="blue">Me</span>
            {/* <span className="text-danger fw-bold ms-2">ADMIN</span> */}
          </span>
        </Link>
        <Nav className="flex-column" as="ul">
          <Nav.Item as="li">
            <NavLink to="/admin/dashboard" className="nav-link" end>
              <Speedometer2 />
              <span>Dashboard</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/users" className="nav-link">
              <PeopleFill />
              <span>User Management</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/payments" className="nav-link">
              {" "}
              {/* Enabled */}
              <CashStack />
              <span>Payments</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/certificates" className="nav-link">
              {" "}
              {/* NEW & Enabled */}
              <FileEarmarkText />
              <span>Certificates</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/analytics" className="nav-link">
              {" "}
              {/* NEW & Enabled */}
              <BarChartFill />
              <span>Analytics</span>
            </NavLink>
          </Nav.Item>
        </Nav>
      </div>
      <Nav className="flex-column" as="ul">
        <Nav.Item as="li">
          <Nav.Link href="#" onClick={handleLogout} className="nav-link">
            <BoxArrowRight />
            <span>Logout</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
}

export default AdminSidebar;
