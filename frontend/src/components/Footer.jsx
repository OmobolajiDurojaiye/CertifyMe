import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Linkedin, Twitter, Github } from "lucide-react";

function Footer() {
  return (
    <footer className="py-5 bg-light border-top">
      <Container>
        <Row>
          <Col lg={4} md={12} className="mb-4 mb-lg-0">
            <h5 className="fw-bold fs-4">
              <span style={{ color: "#22C55E" }}>Certify</span>
              <span style={{ color: "#2563EB" }}>Me</span>
            </h5>
            <p className="text-muted mt-2">
              The simplest way to issue and manage digital credentials.
            </p>
            <div className="mt-3">
              <a href="#" className="text-muted me-3">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted me-3">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted">
                <Github size={20} />
              </a>
            </div>
          </Col>
          <Col lg={2} md={4} xs={6} className="mb-4 mb-lg-0">
            <h6 className="fw-bold">Product</h6>
            <Nav className="flex-column">
              <Nav.Link href="#features" className="text-muted p-0 mb-2">
                Features
              </Nav.Link>
              <Nav.Link href="#pricing" className="text-muted p-0 mb-2">
                Pricing
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={2} md={4} xs={6} className="mb-4 mb-lg-0">
            <h6 className="fw-bold">Company</h6>
            <Nav className="flex-column">
              <Nav.Link href="#about" className="text-muted p-0 mb-2">
                About Us
              </Nav.Link>
              <Nav.Link href="#contact" className="text-muted p-0 mb-2">
                Contact
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
