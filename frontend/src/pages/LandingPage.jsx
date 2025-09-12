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

        {/* ===== PRICING SECTION ===== */}
        <section id="pricing" className="pricing-section">
          <div className="pricing-card">
            <h3 className="plan-title">Pro Monthly</h3>
            <div className="plan-price">
              $15 <span className="plan-suffix">/ month</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> Unlimited Certificates
              </li>
              <li>
                <Check size={16} /> Custom Branding
              </li>
              <li>
                <Check size={16} /> Bulk Email Delivery
              </li>
            </ul>
            <Link to="/signup" className="plan-button">
              Choose Monthly
            </Link>
          </div>
          <div className="pricing-card highlighted">
            <h3 className="plan-title">Pro Lifetime</h3>
            <div className="plan-price">
              $99 <span className="plan-suffix">one-time</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={16} /> Everything in Pro, Forever
              </li>
              <li>
                <Check size={16} /> Lifetime Access & Updates
              </li>
              <li>
                <Check size={16} /> No Recurring Fees
              </li>
            </ul>
            <Link to="/signup" className="plan-button-highlighted">
              Get Lifetime Access
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
