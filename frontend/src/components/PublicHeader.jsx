import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import "../styles/LandingPage.css";
import { THEME } from "../theme";

const PublicHeader = ({
  theme = "dark",
  showMenuButton = false,
  onMenuClick,
}) => {
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
            src={THEME.APP_LOGO}
            alt={THEME.APP_NAME}
            height="28"
            className="logo-icon"
          />
          <span className="logo-text">{THEME.APP_NAME}</span>
        </Link>
      </div>
      <div className="nav-right">
        <a href="/#pricing" className="signin-link">
          Pricing
        </a>
        <Link to="/search" className="signin-link">
          Ledger
        </Link>
        <Link to="/verify" className="signin-link">
          Verify
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
