import React from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";

function Hero() {
  return (
    <section id="home" className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="text-center text-lg-start">
            <h1 className="display-3 fw-bolder mb-3">
              Issue Certificates & Badges in Minutes.
            </h1>
            <p className="lead text-white-50 mb-4">
              CertifyMe helps schools, trainers, and businesses create and share
              verifiable certificates with ease.
            </p>
            <Button variant="success" size="lg" className="me-3 px-4 py-3">
              Get Started Free
            </Button>
            <Button variant="outline-light" size="lg" className="px-4 py-3">
              See How It Works
            </Button>
          </Col>
          <Col lg={6} className="d-none d-lg-block text-center">
            {/* Using the local app icon from the /public/images/ folder */}
            <Image
              src="/images/certbadge.png"
              alt="CertifyMe App Icon"
              className="hero-image"
              style={{ maxWidth: "350px" }} // Control the size of the icon
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Hero;
