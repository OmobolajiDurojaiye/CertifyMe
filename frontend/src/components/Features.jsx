import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
// --- THIS IS THE FIX ---
import { Award, ShieldCheck, Presentation, Layers } from "lucide-react"; // Changed 'Easel' to 'Presentation'
// --- END OF FIX ---

const featureData = [
  {
    // --- THIS IS THE FIX ---
    icon: <Presentation size={28} />, // Changed 'Easel' to 'Presentation'
    // --- END OF FIX ---
    title: "Beautiful Templates",
    description:
      "Design stunning, branded certificates with our intuitive builder. No design experience needed.",
  },
  {
    icon: <Layers size={28} />,
    title: "Issue in Bulk",
    description:
      "Upload a simple spreadsheet to generate and send hundreds of personalized certificates at once.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure & Verifiable",
    description:
      "Every certificate includes a unique, secure link to prevent fraud and ensure authenticity forever.",
  },
  {
    icon: <Award size={28} />,
    title: "Digital Badges",
    description:
      "Issue verifiable digital badges that recipients can proudly share on LinkedIn and other platforms.",
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
          <h2 className="display-5 fw-bold">Why You'll Love CertifyMe</h2>
          <p className="lead text-muted">
            Focus on your event, not the paperwork. We've simplified everything.
          </p>
        </div>
        <Row className="g-4">
          {featureData.map((feature, index) => (
            <Col md={6} lg={3} key={index}>
              <div className="feature-card h-100">
                <div className="feature-icon mb-4">{feature.icon}</div>
                <h4 className="mb-3 fw-bold">{feature.title}</h4>
                <p className="text-muted">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Features;
