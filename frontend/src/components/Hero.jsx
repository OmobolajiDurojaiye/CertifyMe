// frontend/src/components/Hero.jsx
import React from "react";
import { Container, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section id="home" className="hero-section">
      {/* BACKGROUND ELEMENTS - THEY WILL BE BEHIND EVERYTHING */}
      <div className="hero-background">
        <div className="hero-bg-shape shape-1"></div>
        <div className="hero-bg-shape shape-2"></div>
        {/* <Image
          // src="/images/hero-graphic.png" // Your decorative shield image
          alt="Secure credential seal"
          className="hero-graphic"
        /> */}
      </div>

      {/* FOREGROUND CONTENT - THIS WILL BE ON TOP */}
      <Container className="hero-content-container">
        <div className="hero-content">
          <img
            // src="/images/certbadge.png"
            alt="CertifyMe Logo"
            height="50"
            className="mb-4"
          />
          <h1 className="display-3 fw-bolder mb-4">
            Revolutionize Your Credentialing Process
          </h1>
          <p
            className="lead text-white-75 mb-5 mx-auto"
            style={{ maxWidth: "700px" }}
          >
            Effortlessly create, issue, and verify secure digital certificates
            and badges. Trusted by educators and businesses worldwide.
          </p>
          <div>
            <Button
              as={Link}
              to="/signup"
              variant="primary"
              size="lg"
              className="me-3 px-5 py-3 fw-bold"
            >
              Start Free Trial
            </Button>
            <Button
              href="#features"
              variant="outline-light"
              size="lg"
              className="px-5 py-3 fw-bold"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
