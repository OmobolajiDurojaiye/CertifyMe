import React from "react";
import { Container, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-bg-shape shape-1"></div>
      <div className="hero-bg-shape shape-2"></div>
      <Container className="text-center position-relative">
        <div className="hero-content">
          <h1 className="display-3 fw-bolder mb-3">
            Issue Professional Certificates in Minutes
          </h1>
          <p className="lead text-white-50 mb-4 mx-auto">
            The simplest way for schools and businesses to create, manage, and
            deliver secure, verifiable digital credentials.
          </p>
          <Button
            as={Link}
            to="/signup"
            variant="success"
            size="lg"
            className="me-3 px-4 py-2"
          >
            Start for Free
          </Button>
          <Button
            href="#features"
            variant="outline-light"
            size="lg"
            className="px-4 py-2"
          >
            Learn More
          </Button>
        </div>
        <div className="mt-5">
          <Image
            src="/images/hero-cert.png"
            alt="Certificate Preview"
            className="hero-certificate-img"
            style={{ maxWidth: "700px" }}
          />
        </div>
      </Container>
    </section>
  );
}

export default Hero;
