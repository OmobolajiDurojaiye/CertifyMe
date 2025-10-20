// frontend/src/pages/SupportHubPage.jsx

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { helpArticles } from "../data/helpArticles.jsx";
import { Search, ChatQuoteFill } from "react-bootstrap-icons";
import { useSupportStatus } from "../hooks/useSupportStatus";
import "../styles/HelpCenter.css"; // --- IMPORT THE NEW STYLESHEET

function SupportHubPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isOnline } = useSupportStatus();

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid>
      <Row className="justify-content-center text-center py-5 bg-light rounded-3 mb-5">
        <Col md={8}>
          <h1 className="display-5 fw-bold">CertifyMe Help Center</h1>
          <p className="fs-5 text-muted">
            Your one-stop guide to creating, managing, and verifying
            certificates.
          </p>
          <Form>
            <InputGroup size="lg" className="mt-4">
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="How can we help you today?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form>
        </Col>
      </Row>

      <h3 className="mb-4">Browse Help Topics</h3>
      <Row xs={1} md={2} lg={4} className="g-4">
        {filteredArticles.map((article) => (
          <Col key={article.slug}>
            <Card
              as={Link}
              to={`/dashboard/support/articles/${article.slug}`}
              className="h-100 text-decoration-none help-topic-card" // --- UPDATED CLASS
            >
              <Card.Body className="text-center p-4">
                {/* --- NEW ICON STRUCTURE --- */}
                <div className={`icon-wrapper bg-${article.theme}-soft`}>
                  {React.cloneElement(article.icon, {
                    className: `text-${article.theme}`,
                  })}
                </div>
                <Card.Title className="fw-bold h5 mt-3">
                  {article.title}
                </Card.Title>
                <Card.Text className="text-muted small">
                  {article.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <hr className="mb-5" />
          <div className="text-center support-contact-card p-4 p-md-5">
            <ChatQuoteFill size={40} className="text-primary mb-4" />
            <h2 className="fw-bold">Can't find an answer?</h2>
            <p className="text-muted fs-5 mb-4">
              Our Nigerian-based support team is here to help you. Create a
              ticket, and we'll get back to you promptly.
            </p>
            <div className="status-indicator-container">
              <span
                className={`status-indicator ${
                  isOnline ? "online" : "offline"
                }`}
              ></span>
              <span className={isOnline ? "text-success" : "text-danger"}>
                {isOnline ? "We're Online" : "Currently Offline"}
              </span>
            </div>
            <Button
              as={Link}
              to="/dashboard/support/tickets"
              variant="primary"
              size="lg"
              className="px-5 py-3"
            >
              Create a Support Ticket
            </Button>
            <p className="mt-3 mb-0 text-muted small">
              Support Hours: Mon - Fri, 9am - 5pm (WAT)
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default SupportHubPage;
