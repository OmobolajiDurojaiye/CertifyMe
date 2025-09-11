// frontend/src/components/Features.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  Presentation,
  Layers,
  ShieldCheck,
  Award,
  Globe,
  Mail,
  Smartphone,
  Zap,
} from "lucide-react";

const featureData = [
  {
    icon: <Presentation size={40} className="text-primary" />,
    title: "Stunning Templates",
    description:
      "Craft beautiful, customizable certificates with our drag-and-drop builder. No design skills required.",
  },
  {
    icon: <Layers size={40} className="text-primary" />,
    title: "Bulk Issuance",
    description:
      "Generate and distribute thousands of personalized credentials with a single upload.",
  },
  {
    icon: <ShieldCheck size={40} className="text-primary" />,
    title: "Blockchain Security",
    description:
      "Ensure tamper-proof verification with cutting-edge blockchain technology.",
  },
  {
    icon: <Award size={40} className="text-primary" />,
    title: "Digital Badges",
    description:
      "Create shareable badges compatible with LinkedIn, portfolios, and more.",
  },
  {
    icon: <Globe size={40} className="text-primary" />,
    title: "Global Verification",
    description:
      "Instant online verification accessible from anywhere in the world.",
  },
  {
    icon: <Mail size={40} className="text-primary" />,
    title: "Automated Delivery",
    description:
      "Send certificates via email or integrate with your LMS seamlessly.",
  },
  {
    icon: <Smartphone size={40} className="text-primary" />,
    title: "Mobile-First Design",
    description:
      "Fully responsive platform for issuing and viewing on any device.",
  },
  {
    icon: <Zap size={40} className="text-primary" />,
    title: "API Integration",
    description: "Connect with your existing systems for automated workflows.",
  },
];

function Features() {
  return (
    <section id="features" className="py-5 bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold">
            Powerful Features for Modern Credentialing
          </h2>
          <p className="lead text-muted">
            Everything you need to streamline your certification process.
          </p>
        </div>
        <Row className="g-4">
          {featureData.map((feature, index) => (
            <Col md={6} lg={3} key={index}>
              <div className="feature-card h-100 p-4 rounded-lg shadow-sm bg-white">
                <div
                  className="feature-icon mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                  style={{ width: "60px", height: "60px" }}
                >
                  {feature.icon}
                </div>
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
