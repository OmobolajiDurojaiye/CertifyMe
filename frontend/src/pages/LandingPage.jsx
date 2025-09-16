import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import { Check } from "lucide-react";

function LandingPage() {
  return (
    <div className="chrono-body">
      {/* ===== HEADER / NAVIGATION ===== */}
      <header className="chrono-header">
        <div className="nav-left">
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            height="28"
            className="logo-icon"
          />
          <span className="logo-text">CertifyMe</span>
        </div>
        <div className="nav-right">
          <Link to="/login" className="signin-link">
            Log In
          </Link>
          <Link to="/signup" className="demo-button-secondary">
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="chrono-main-content">
        {/* ===== CENTRAL HERO TEXT ===== */}
        <div className="hero-content">
          <div className="hero-logo">
            <img src="/images/certbadge.png" alt="CertifyMe Logo" height="64" />
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

        {/* ===== PRICING SECTION (UPDATED TO MATCH SETTINGS PAGE) ===== */}
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

      {/* ===== FOOTER ===== */}
      <footer className="chrono-footer">
        <small>
          &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
        </small>
      </footer>
    </div>
  );
}

export default LandingPage;
