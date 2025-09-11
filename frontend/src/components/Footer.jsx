// frontend/src/components/Footer.jsx
import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Linkedin, Twitter, Github, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="py-5 bg-dark text-white">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4">
            <img
              // src="/images/certbadge.png"
              alt="CertifyMe Logo"
              height="35" // Further reduced logo size
              className="mb-3"
            />
            <p className="text-muted">
              Empowering organizations to issue secure, verifiable digital
              credentials with ease.
            </p>
            <div className="d-flex">
              <a href="#" className="text-white me-3">
                <Linkedin size={24} />
              </a>
              <a href="#" className="text-white me-3">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white">
                <Github size={24} />
              </a>
            </div>
          </Col>
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Product</h6>
            <Nav className="flex-column">
              <Nav.Link href="#features" className="text-muted p-0 mb-2">
                Features
              </Nav.Link>
              <Nav.Link href="#pricing" className="text-muted p-0 mb-2">
                Pricing
              </Nav.Link>
              <Nav.Link href="#integrations" className="text-muted p-0 mb-2">
                Integrations
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Company</h6>
            <Nav className="flex-column">
              <Nav.Link href="#about" className="text-muted p-0 mb-2">
                About Us
              </Nav.Link>
              <Nav.Link href="#blog" className="text-muted p-0 mb-2">
                Blog
              </Nav.Link>
              <Nav.Link href="#careers" className="text-muted p-0 mb-2">
                Careers
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Support</h6>
            <Nav className="flex-column">
              <Nav.Link href="#help" className="text-muted p-0 mb-2">
                Help Center
              </Nav.Link>
              <Nav.Link href="#contact" className="text-muted p-0 mb-2">
                Contact Us
              </Nav.Link>
              <Nav.Link href="#status" className="text-muted p-0 mb-2">
                Status
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Contact</h6>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <Mail size={18} className="me-2" />
                info@certifyme.com
              </li>
              <li className="mb-2">
                <Phone size={18} className="me-2" />
                +1 (555) 123-4567
              </li>
              <li>
                <MapPin size={18} className="me-2" />
                San Francisco, CA
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="border-secondary" />
        <Row>
          <Col className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} CertifyMe. All rights reserved.
              |{" "}
              <a href="#privacy" className="text-muted">
                Privacy Policy
              </a>{" "}
              |{" "}
              <a href="#terms" className="text-muted">
                Terms of Service
              </a>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
