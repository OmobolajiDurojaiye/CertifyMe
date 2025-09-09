import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

function Header() {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand
          href="#home"
          className="fw-bold fs-4"
          style={{ color: "#1E293B" }}
        >
          CertifyMe
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="#features" className="me-3">
              Features
            </Nav.Link>
            <Nav.Link href="#pricing" className="me-3">
              Pricing
            </Nav.Link>
            <Nav.Link href="#login" className="me-3">
              Log In
            </Nav.Link>
            <Button variant="primary" style={{ backgroundColor: "#2563EB" }}>
              Sign Up for Free
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
