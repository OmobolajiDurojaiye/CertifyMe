import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github } from "lucide-react";
import "../styles/LandingPage.css"; // Styles are co-located for simplicity

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-column footer-brand">
          <div className="footer-logo">
            <img
              src="/images/certbadge.png"
              alt="CertifyMe Logo"
              className="logo-icon"
            />
            <span className="logo-text">CertifyMe</span>
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
          &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default PublicFooter;
