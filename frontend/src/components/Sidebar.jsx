import React, { useState } from "react";
import { Nav, Image } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  HouseDoor,
  FileEarmarkText,
  Collection,
  Gear,
  BoxArrowRight,
  PlusCircle,
  Folder,
  List,
} from "react-bootstrap-icons";

function Sidebar() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        className="hamburger-btn d-md-none"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <List size={24} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div>
          <Link to="/dashboard" className="sidebar-logo">
            <Image src="/images/certbadge.png" width={32} />
            <span>
              <span className="green">Certify</span>
              <span className="blue">Me</span>
            </span>
          </Link>
          <Nav className="flex-column" as="ul">
            <Nav.Item as="li">
              <NavLink to="/dashboard" className="nav-link" end>
                <HouseDoor />
                <span>My Certificates</span>
              </NavLink>
            </Nav.Item>
            <Nav.Item as="li">
              <NavLink to="/dashboard/groups" className="nav-link">
                <Folder />
                <span>Groups</span>
              </NavLink>
            </Nav.Item>
            <Nav.Item as="li">
              <NavLink to="/dashboard/templates" className="nav-link">
                <Collection />
                <span>Templates</span>
              </NavLink>
            </Nav.Item>
            <Nav.Item as="li">
              <NavLink to="/dashboard/create" className="nav-link">
                <PlusCircle />
                <span>Create Certificate</span>
              </NavLink>
            </Nav.Item>
            <Nav.Item as="li">
              <NavLink to="/dashboard/bulk-create" className="nav-link">
                <FileEarmarkText />
                <span>Bulk Create</span>
              </NavLink>
            </Nav.Item>
            <Nav.Item as="li">
              <NavLink to="/dashboard/settings" className="nav-link">
                <Gear />
                <span>Settings</span>
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

      {/* Overlay for Mobile Sidebar */}
      <div
        className={`mobile-sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
}

export default Sidebar;
