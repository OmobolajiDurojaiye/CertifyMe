import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Award, ShieldLock, Easel2, Collection } from "react-bootstrap-icons";

const featureData = [
  {
    icon: <Easel2 size={28} />,
    title: "Professional Templates",
    description:
      "Design beautiful, branded certificates with our easy-to-use template builder. No design skills required.",
  },
  {
    icon: <Award size={28} />,
    title: "Instant Digital Badges",
    description:
      "Issue verifiable digital badges that recipients can share on LinkedIn and other social platforms.",
  },
  {
    icon: <ShieldLock size={28} />,
    title: "Secure & Verifiable",
    description:
      "Every certificate comes with a unique, secure link to prevent fraud and ensure authenticity.",
  },
  {
    icon: <Collection size={28} />,
    title: "Issue in Bulk",
    description:
      "Upload a simple CSV file to generate and send hundreds of personalized certificates at once.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="py-5"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Why CertifyMe?</h2>
          <p className="lead text-muted">
            Everything you need to manage digital credentials, simplified.
          </p>
        </div>
        <Row className="g-4">
          {featureData.map((feature, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="p-3 text-center feature-card h-100">
                <Card.Body>
                  <div className="feature-icon mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <Card.Title as="h4" className="mb-3">
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {feature.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Features;
