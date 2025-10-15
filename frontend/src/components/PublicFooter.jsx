import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github } from "lucide-react";
import "../styles/LandingPage.css";
import { THEME } from "../theme";

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-column footer-brand">
          <div className="footer-logo">
            <img
              src={THEME.APP_LOGO}
              alt={THEME.APP_NAME}
              className="logo-icon"
            />
            <span className="logo-text">{THEME.APP_NAME}</span>
          </div>
          <p className="footer-tagline">
            Secure, verifiable credentials made simple.
          </p>
          <div className="social-links">
            <a
              href="#"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-links">
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <Link to="/search">Credential Ledger</Link>
            </li>
            <li>
              <Link to="/docs">API Documentation</Link>
            </li>
            <li>
              <Link to="/login">Log In</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <small>
          &copy; {new Date().getFullYear()} {THEME.APP_NAME} under exclusive
          license with <a href="https://www.certifyme.com.ng/">CertifyMe</a>.
          All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default PublicFooter;
