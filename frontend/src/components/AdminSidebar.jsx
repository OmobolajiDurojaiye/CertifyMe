import React from "react";
import { Nav, Image } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Speedometer2,
  PeopleFill,
  BoxArrowRight,
  PaletteFill,
  CashStack,
  FileEarmarkText,
  BarChartFill,
  ChatDotsFill, // --- NEW ICON ---
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
              <CashStack />
              <span>Payments</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/certificates" className="nav-link">
              <FileEarmarkText />
              <span>Certificates</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/admin/analytics" className="nav-link">
              <BarChartFill />
              <span>Analytics</span>
            </NavLink>
          </Nav.Item>
          {/* --- THIS IS THE NEW FEATURE --- */}
          <Nav.Item as="li">
            <NavLink to="/admin/support" className="nav-link">
              <ChatDotsFill />
              <span>Support Tickets</span>
            </NavLink>
          </Nav.Item>
          {/* --- END OF NEW FEATURE --- */}
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
