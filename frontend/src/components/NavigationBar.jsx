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
          <span style={{ color: "#22C55E" }}>Certify</span>
          <span style={{ color: "#2563EB" }}>Me</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {/* These links would be for scrolling, which we can implement later if needed */}
            <Nav.Link href="#features" className="mx-2">
              Features
            </Nav.Link>
            <Nav.Link href="#pricing" className="mx-2">
              Pricing
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link
              as={Link}
              to="/login"
              className="me-2 d-flex align-items-center"
            >
              Log In
            </Nav.Link>
            <Button as={Link} to="/signup" variant="success">
              Get Started
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
