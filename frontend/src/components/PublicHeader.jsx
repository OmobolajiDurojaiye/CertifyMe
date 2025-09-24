import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import "../styles/LandingPage.css";

const PublicHeader = ({
  theme = "dark",
  showMenuButton = false,
  onMenuClick,
}) => {
  // --- FIX: Add a 'has-mobile-menu' class when the menu button is shown ---
  const headerClass = `chrono-header ${
    theme === "light" ? "light-theme" : ""
  } ${showMenuButton ? "has-mobile-menu" : ""}`;

  return (
    <header className={headerClass}>
      <div className="nav-left">
        {showMenuButton && (
          <button onClick={onMenuClick} className="mobile-menu-button">
            <Menu size={24} />
          </button>
        )}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            height="28"
            className="logo-icon"
          />
          <span className="logo-text">CertifyMe</span>
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/docs" className="signin-link">
          API Docs
        </Link>
        <Link to="/login" className="signin-link">
          Log In
        </Link>
        <Link to="/signup" className="demo-button-secondary">
          Sign Up Free
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;
