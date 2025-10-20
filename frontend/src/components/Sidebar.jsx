// frontend/src/components/Sidebar.jsx

import React from "react";
import { Nav, Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  HouseDoor,
  FileEarmarkText,
  Collection,
  Gear,
  BoxArrowRight,
  PlusCircle,
  Folder,
  QuestionCircle,
  BarChartLine,
} from "react-bootstrap-icons";
import { useUser } from "../context/UserContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Upgrade to a paid plan to unlock insights!
    </Tooltip>
  );

  return (
    <div className="sidebar">
      {/* --- TOP SECTION: Main Navigation --- */}
      <div>
        <Link to="/dashboard" className="sidebar-logo">
          <Image src="/images/certbadge.png" width={32} />
          <span>CertifyMe</span>
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
          {user &&
            (user.role === "free" ? (
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
              >
                <div className="nav-link nav-link-upgrade">
                  <BarChartLine />
                  <span>Analytics</span>
                  <span className="badge bg-success ms-auto">Upgrade</span>
                </div>
              </OverlayTrigger>
            ) : (
              <Nav.Item as="li">
                <NavLink to="/dashboard/analytics" className="nav-link">
                  <BarChartLine />
                  <span>Analytics</span>
                </NavLink>
              </Nav.Item>
            ))}
        </Nav>
      </div>

      {/* --- BOTTOM SECTION: Settings, Support & Logout --- */}
      <div>
        <hr className="sidebar-divider" />
        <Nav className="flex-column" as="ul">
          <Nav.Item as="li">
            <NavLink to="/dashboard/settings" className="nav-link">
              <Gear />
              <span>Settings</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <NavLink to="/dashboard/support" className="nav-link">
              <QuestionCircle />
              <span>Contact Support</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link href="#" onClick={handleLogout} className="nav-link">
              <BoxArrowRight />
              <span>Logout</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
