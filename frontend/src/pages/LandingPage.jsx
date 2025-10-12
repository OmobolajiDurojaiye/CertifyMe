import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import {
  Check,
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  Building,
  Users,
  Award,
  BookOpen,
  DollarSign,
  Search,
  Code,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

// --- Sub-components for Landing Page Sections ---

const Partners = () => (
  <section className="partners-section">
    <h2 className="section-eyebrow">Trusted by Leading Organizations</h2>
    <div className="partners-grid">
      {/* Add your partner logos here. They will auto-fit. */}
      <div className="partner-logo">
        <img
          src="/images/partners/logo1.png"
          alt="Nile University of Nigeria"
        />
      </div>
      <div className="partner-logo">
        <img src="/images/partners/logo2.png" alt="Staunch Analytics" />
      </div>
      <div className="partner-logo">
        <img src="/images/partners/logo3.png" alt="Nile career service" />
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="stats-section">
    <div className="stat-card">
      <Building size={40} className="stat-icon" />
      <span className="stat-number">10+</span>
      <span className="stat-label">Companies Onboard</span>
    </div>
    <div className="stat-card">
      <Users size={40} className="stat-icon" />
      <span className="stat-number">20+</span>
      <span className="stat-label">Active Users</span>
    </div>
    <div className="stat-card">
      <Award size={40} className="stat-icon" />
      <span className="stat-number">200+</span>
      <span className="stat-label">Certificates Issued</span>
    </div>
  </section>
);

const testimonialsData = [
  {
    quote:
      "CertifyMe is definitely a game changer. For someone like me that organises multiple training sessions, the ability to custom my certificates and issue it to different people at bulk made all the difference. Definitely worth the purchase.",
    name: "Chibuzor Azodo, PhD",
    title: "Founder, Staunch Analytics LtD",
    avatar: "/images/chibuzor-azodo.png",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const handleSlideChange = (newIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFading(false);
    }, 300); // Corresponds to CSS transition duration
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % testimonialsData.length;
    handleSlideChange(newIndex);
  };

  const handlePrev = () => {
    const newIndex =
      (currentIndex - 1 + testimonialsData.length) % testimonialsData.length;
    handleSlideChange(newIndex);
  };

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 7000); // Change slide every 7 seconds
    return () => clearInterval(timer);
  }, [currentIndex]);

  const currentTestimonial = testimonialsData[currentIndex];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">See what people are saying.</p>

        <div className="testimonial-slider">
          <button onClick={handlePrev} className="slider-nav prev">
            <ChevronLeft size={28} />
          </button>

          <div className={`testimonial-slide ${isFading ? "fading" : ""}`}>
            <div className="testimonial-image-wrapper">
              <img
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                className="testimonial-avatar"
              />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-quote">“{currentTestimonial.quote}”</p>
              <span className="testimonial-author-name">
                {currentTestimonial.name}
              </span>
              <span className="testimonial-author-title">
                {currentTestimonial.title}
              </span>
            </div>
          </div>

          <button onClick={handleNext} className="slider-nav next">
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="slider-dots">
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ApiDocsCTA = () => (
  <section className="api-cta-section">
    <div className="api-cta-icon-wrapper">
      <Code size={48} />
    </div>
    <div className="api-cta-content">
      <h2 className="section-title">Integrate with Our Powerful API</h2>
      <p className="section-subtitle">
        Automate certificate generation, delivery, and verification directly
        from your own application. Our REST API is simple, secure, and built for
        developers.
      </p>
      <Link to="/docs" className="demo-button-secondary">
        <span>Read the Docs</span>
        <ArrowRight size={20} />
      </Link>
    </div>
  </section>
);

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
            <a
              href="#pricing"
              className="mobile-menu-link"
              onClick={toggleMenu}
            >
              <DollarSign />
              <span>Pricing</span>
            </a>
            <Link
              to="/search"
              className="mobile-menu-link"
              onClick={toggleMenu}
            >
              <Search />
              <span>Ledger</span>
            </Link>
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

        <Partners />
        <Stats />
        <Testimonials />

        <section id="pricing" className="pricing-section">
          <h2 className="section-title">Flexible Plans for Every Scale</h2>
          <p className="section-subtitle">
            Choose a plan that fits your needs. No subscriptions, just
            pay-as-you-go credits.
          </p>
          <div className="pricing-grid">
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
              <Link to="/signup?plan=starter" className="plan-button">
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
              <Link to="/signup?plan=growth" className="plan-button">
                Choose Growth
              </Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
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
              <Link to="/signup?plan=pro" className="plan-button primary">
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
              <Link to="/signup?plan=enterprise" className="plan-button">
                Choose Enterprise
              </Link>
            </div>
          </div>
        </section>

        <ApiDocsCTA />
      </main>

      <PublicFooter />
    </div>
  );
}

export default LandingPage;
