import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Linkedin, Twitter, Github } from "react-bootstrap-icons";

function Footer() {
  return (
    <footer
      className="py-5"
      style={{ backgroundColor: "#111827", color: "white" }}
    >
      <Container>
        <Row>
          <Col lg={4} md={12} className="mb-4 mb-lg-0">
            <h5 className="fw-bold fs-4">
              <span style={{ color: "#22C55E" }}>Certify</span>
              <span style={{ color: "#2563EB" }}>Me</span>
            </h5>
            <p className="text-white-50 mt-2">
              Create, manage, and verify digital certificates and badges with
              ease.
            </p>
          </Col>
          <Col lg={2} md={4} xs={6} className="mb-4 mb-lg-0">
            <h6 className="fw-bold">Links</h6>
            <Nav className="flex-column">
              <Nav.Link href="#features" className="text-white-50 p-0 mb-2">
                Features
              </Nav.Link>
              <Nav.Link href="#pricing" className="text-white-50 p-0 mb-2">
                Pricing
              </Nav.Link>
              <Nav.Link href="#support" className="text-white-50 p-0 mb-2">
                Support
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={2} md={4} xs={6} className="mb-4 mb-lg-0">
            <h6 className="fw-bold">About</h6>
            <Nav className="flex-column">
              <Nav.Link href="#about" className="text-white-50 p-0 mb-2">
                About Us
              </Nav.Link>
              <Nav.Link href="#contact" className="text-white-50 p-0 mb-2">
                Contact
              </Nav.Link>
            </Nav>
          </Col>
          <Col lg={4} md={4} className="mb-4 mb-lg-0 text-lg-end">
            <a href="#" className="text-white me-3">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-white me-3">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white">
              <Github size={20} />
            </a>
          </Col>
        </Row>
        <hr
          className="my-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        />
        <Row>
          <Col className="text-center text-white-50">
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
