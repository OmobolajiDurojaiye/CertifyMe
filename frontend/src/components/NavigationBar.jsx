// frontend/src/components/NavigationBar.jsx
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar
      variant="dark"
      expand="lg"
      fixed="top"
      className={scrolled ? "navbar-sticky navbar-scrolled" : "navbar-sticky"}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
          <img
            // src="/images/certbadge.png"
            alt="CertifyMe Logo"
            height="28" // Further reduced logo size for better fit
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link href="#features" className="mx-3">
              Features
            </Nav.Link>
            <Nav.Link href="#pricing" className="mx-3">
              Pricing
            </Nav.Link>
            <Nav.Link href="#testimonials" className="mx-3">
              Testimonials
            </Nav.Link>
            <Nav.Link href="#faq" className="mx-3">
              FAQ
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link
              as={Link}
              to="/login"
              className="me-3 d-flex align-items-center"
            >
              Log In
            </Nav.Link>
            <Button as={Link} to="/signup" variant="primary" className="px-4">
              Get Started Free
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
