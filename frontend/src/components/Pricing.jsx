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

// Data for the pricing plans
const plans = [
  {
    title: "Free",
    price: "$0",
    priceDetails: "/ month",
    description: "For individuals and small teams getting started.",
    features: [
      "Issue up to 10 certificates/mo",
      "Basic templates",
      "Public verification pages",
      "CertifyMe branding included",
    ],
    buttonText: "Start for Free",
    buttonVariant: "outline-primary",
    highlighted: false,
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
      "Certificate analytics",
      "Email delivery & support",
    ],
    buttonText: "Choose Monthly",
    buttonVariant: "success",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    title: "Lifetime",
    price: "$99",
    priceDetails: "one-time",
    description: "Pay once, own it forever. The best value.",
    features: [
      "Everything in Monthly, forever",
      "Lifetime access, no recurring fees",
      "Early access to new features",
      "Premium support",
    ],
    buttonText: "Get Lifetime Access",
    buttonVariant: "primary",
    highlighted: false,
    badge: "Best Value",
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      className="py-5"
      style={{
        background: "linear-gradient(180deg, #0B0F19 0%, #111827 100%)",
        color: "white",
      }}
    >
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Simple, Transparent Pricing</h2>
          <p className="lead text-white-50">
            Choose the plan that's right for you.
          </p>
        </div>
        <Row className="justify-content-center align-items-stretch g-4">
          {plans.map((plan, index) => (
            <Col md={6} lg={4} key={index}>
              <Card
                className={`p-4 h-100 pricing-card ${
                  plan.highlighted ? "highlighted" : ""
                }`}
              >
                <Card.Body className="d-flex flex-column">
                  {plan.badge && (
                    <Badge
                      pill
                      bg={plan.title === "Lifetime" ? "" : "success"}
                      style={
                        plan.title === "Lifetime"
                          ? { backgroundColor: "#FACC15", color: "#1E293B" }
                          : {}
                      }
                      className="position-absolute top-0 start-50 translate-middle"
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  {/* Added specific classes for each title for easier styling */}
                  <h3
                    className={`fw-bold plan-title ${plan.title.toLowerCase()}-title`}
                  >
                    {plan.title}
                  </h3>
                  <p className="fs-1 fw-bolder mb-0">
                    {plan.price}
                    <span className="fs-5 text-muted">
                      {" "}
                      {plan.priceDetails}
                    </span>
                  </p>
                  <p className="mb-4">{plan.description}</p>
                  <ListGroup variant="flush" className="mb-4">
                    {plan.features.map((feature, i) => (
                      <ListGroup.Item
                        key={i}
                        className="bg-transparent border-0 px-0 d-flex"
                      >
                        <CheckCircleFill className="text-success me-2 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Button
                    variant={plan.buttonVariant}
                    className="mt-auto fw-bold py-2"
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
