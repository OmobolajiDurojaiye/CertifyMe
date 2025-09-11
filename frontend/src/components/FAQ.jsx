// frontend/src/components/FAQ.jsx
import React from "react";
import { Container, Accordion } from "react-bootstrap";

const faqs = [
  {
    question: "What is CertifyMe?",
    answer:
      "CertifyMe is a platform for creating, issuing, and verifying digital certificates and badges securely and efficiently.",
  },
  {
    question: "How secure are the certificates?",
    answer:
      "We use blockchain technology to ensure all certificates are tamper-proof and verifiable forever.",
  },
  {
    question: "Can I customize the designs?",
    answer:
      "Yes, our intuitive builder allows full customization with your branding, colors, and layouts.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes, our Starter plan is free with limited certificates per month.",
  },
  {
    question: "How do recipients receive their certificates?",
    answer:
      "Certificates can be sent via email, downloaded, or integrated with your systems.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "All plans include email support, with priority and dedicated support for higher tiers.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold">Frequently Asked Questions</h2>
          <p className="lead text-muted">Got questions? We've got answers.</p>
        </div>
        <Accordion>
          {faqs.map((faq, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>{faq.question}</Accordion.Header>
              <Accordion.Body>{faq.answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

export default FAQ;
