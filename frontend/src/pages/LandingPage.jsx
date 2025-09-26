import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import { Check, X, BookOpen, LogIn, UserPlus } from "lucide-react";
import PublicHeader from "../components/PublicHeader";

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="chrono-body">
      <PublicHeader showMenuButton={true} onMenuClick={toggleMenu} />

      {isMenuOpen && (
        <div className="mobile-menu-fullscreen">
          <button onClick={toggleMenu} className="mobile-menu-close">
            <X size={32} />
          </button>
          <nav className="mobile-menu-nav">
            <Link to="/docs" className="mobile-menu-link" onClick={toggleMenu}>
              <BookOpen />
              <span>API Docs</span>
            </Link>
            <Link to="/login" className="mobile-menu-link" onClick={toggleMenu}>
              <LogIn />
              <span>Log In</span>
            </Link>
            <Link
              to="/signup"
              className="mobile-menu-link"
              onClick={toggleMenu}
            >
              <UserPlus />
              <span>Sign Up Free</span>
            </Link>
          </nav>
        </div>
      )}

      <main className="chrono-main-content">
        <div className="hero-content">
          {/* --- MODIFIED: Using a new class and image source for better control --- */}
          <div className="hero-graphic">
            <img
              src="/images/hero-graphic.png"
              alt="Certificate Seal and Shield"
            />
          </div>
          <h1 className="hero-headline">
            Generate Certificates in Seconds — Fast, Easy & Professional.
          </h1>
          <p className="hero-subheadline">
            CertifyMe lets you create branded templates, upload a CSV of
            recipients, auto-generate secure PDFs, and deliver them in bulk—all
            without fakeable docs or bloated tools. Start issuing in minutes.
          </p>
          <Link to="/signup" className="demo-button-primary">
            Start Issuing Now
          </Link>
        </div>

        <section id="pricing" className="pricing-section">
          <div className="pricing-card">
            <h3 className="plan-title">Starter</h3>
            <div className="plan-price">
              $15 <span className="plan-suffix">for 500 certs</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> 500 Certificate Credits
              </li>
              <li>
                <Check size={16} /> Unlimited Templates
              </li>
              <li>
                <Check size={16} /> Email Delivery
              </li>
              <li>
                <Check size={16} /> PDF Downloads
              </li>
            </ul>
            <Link to="/signup" className="plan-button">
              Choose Starter
            </Link>
          </div>
          <div className="pricing-card">
            <h3 className="plan-title">Growth</h3>
            <div className="plan-price">
              $50 <span className="plan-suffix">for 2,000 certs</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> 2,000 Certificate Credits
              </li>
              <li>
                <Check size={16} /> Unlimited Templates
              </li>
              <li>
                <Check size={16} /> Email Delivery
              </li>
              <li>
                <Check size={16} /> PDF Downloads
              </li>
              <li>
                <Check size={16} /> Priority Support
              </li>
            </ul>
            <Link to="/signup" className="plan-button">
              Choose Growth
            </Link>
          </div>
          <div className="pricing-card">
            <h3 className="plan-title">Pro</h3>
            <div className="plan-price">
              $100 <span className="plan-suffix">for 5,000 certs</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> 5,000 Certificate Credits
              </li>
              <li>
                <Check size={16} /> Unlimited Templates
              </li>
              <li>
                <Check size={16} /> Email Delivery
              </li>
              <li>
                <Check size={16} /> PDF Downloads
              </li>
              <li>
                <Check size={16} /> API Access
              </li>
            </ul>
            <Link to="/signup" className="plan-button">
              Choose Pro
            </Link>
          </div>
          <div className="pricing-card">
            <h3 className="plan-title">Enterprise</h3>
            <div className="plan-price">
              $300 <span className="plan-suffix">for 20,000 certs</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> 20,000 Certificate Credits
              </li>
              <li>
                <Check size={16} /> Unlimited Templates
              </li>
              <li>
                <Check size={16} /> Email Delivery
              </li>
              <li>
                <Check size={16} /> PDF Downloads
              </li>
              <li>
                <Check size={16} /> Custom Support
              </li>
              <li>
                <Check size={16} /> API Access
              </li>
            </ul>
            <Link to="/signup" className="plan-button">
              Choose Enterprise
            </Link>
          </div>
        </section>
      </main>

      <footer className="chrono-footer">
        <small>
          &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default LandingPage;
