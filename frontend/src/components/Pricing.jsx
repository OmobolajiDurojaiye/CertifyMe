// frontend/src/components/Pricing.jsx
import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { CheckCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const plans = [
  {
    title: "Free",
    price: "$0",
    priceDetails: "forever",
    description: "For individuals and small teams getting started.",
    features: [
      "Issue up to 10 certificates/month",
      "Basic templates",
      "Public verification pages",
      "CertifyMe branding on certs",
    ],
    buttonText: "Start for Free",
    buttonVariant: "outline-primary",
    link: "/signup",
  },
  {
    title: "Monthly",
    price: "$15",
    priceDetails: "/ month",
    description: "For professionals and growing businesses.",
    features: [
      "Unlimited certificates & badges",
      "Custom branding (your logo)",
      "Access to all templates",
      "Email delivery & support",
      "Certificate analytics",
    ],
    buttonText: "Choose Monthly",
    buttonVariant: "primary",
    highlighted: true,
    badge: "Most Popular",
    link: "/signup",
  },
  {
    title: "Lifetime",
    price: "$99",
    priceDetails: "one-time",
    description: "Pay once, own it forever. The absolute best value.",
    features: [
      "Everything in Monthly, forever",
      "Lifetime access, no recurring fees",
      "Early access to new features",
      "Premium, priority support",
    ],
    buttonText: "Get Lifetime Access",
    buttonVariant: "outline-primary",
    badge: "Best Value",
    link: "/signup",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-5 bg-white">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold">Simple, Transparent Pricing</h2>
          <p className="lead text-muted">
            Choose the plan that scales with your success.
          </p>
        </div>
        <Row className="justify-content-center g-4">
          {plans.map((plan, index) => (
            <Col md={6} lg={4} key={index}>
              <Card
                className={`h-100 pricing-card ${
                  plan.highlighted ? "highlighted shadow-lg" : "shadow"
                }`}
              >
                <Card.Body className="d-flex flex-column p-4">
                  {plan.badge && (
                    <Badge
                      pill
                      bg="primary"
                      className="position-absolute top-0 start-50 translate-middle"
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  <h3 className="fw-bold plan-title mb-2">{plan.title}</h3>
                  <p className="display-5 fw-bold mb-1">{plan.price}</p>
                  <p className="text-muted small mb-4">{plan.priceDetails}</p>
                  <p className="text-muted mb-4">{plan.description}</p>
                  <ListGroup variant="flush" className="mb-4 flex-grow-1">
                    {plan.features.map((feature, i) => (
                      <ListGroup.Item key={i} className="border-0 px-0 pb-2">
                        <CheckCircleFill className="text-primary me-2" />
                        {feature}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Button
                    as={Link}
                    to={plan.link}
                    variant={plan.buttonVariant}
                    className="mt-auto py-3 fw-bold"
                  >
                    {plan.buttonText}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Pricing;
