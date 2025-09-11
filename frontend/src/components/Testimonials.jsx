// frontend/src/components/Testimonials.jsx
import React from "react";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jane Doe",
    role: "CEO, EduTech Inc.",
    content:
      "CertifyMe has transformed how we issue credentials. It's fast, secure, and our students love the digital badges!",
    avatar: "https://via.placeholder.com/150",
  },
  {
    name: "John Smith",
    role: "HR Manager, Global Corp",
    content:
      "The bulk issuance feature saved us hours of work. Verification is seamless and fraud-proof.",
    avatar: "https://via.placeholder.com/150",
  },
  {
    name: "Emily Chen",
    role: "University Administrator",
    content:
      "Intuitive interface and excellent support. We've issued thousands of certificates without a hitch.",
    avatar: "https://via.placeholder.com/150",
  },
  {
    name: "Michael Rodriguez",
    role: "Training Coordinator",
    content:
      "The customization options are fantastic. Our branded certificates look professional and modern.",
    avatar: "https://via.placeholder.com/150",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-5 bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold">What Our Customers Say</h2>
          <p className="lead text-muted">
            Join thousands of satisfied users revolutionizing credential
            management.
          </p>
        </div>
        <Carousel indicators={false} className="testimonial-carousel">
          {testimonials.reduce((acc, testimonial, index) => {
            if (index % 2 === 0) {
              acc.push(
                <Carousel.Item key={index}>
                  <Row className="justify-content-center g-4">
                    <Col md={5}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column p-4">
                          <Quote size={32} className="text-primary mb-3" />
                          <p className="flex-grow-1">{testimonial.content}</p>
                          <div className="d-flex align-items-center mt-3">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="rounded-circle me-3"
                              width="50"
                              height="50"
                            />
                            <div>
                              <h6 className="mb-0">{testimonial.name}</h6>
                              <small className="text-muted">
                                {testimonial.role}
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    {testimonials[index + 1] && (
                      <Col md={5}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Body className="d-flex flex-column p-4">
                            <Quote size={32} className="text-primary mb-3" />
                            <p className="flex-grow-1">
                              {testimonials[index + 1].content}
                            </p>
                            <div className="d-flex align-items-center mt-3">
                              <img
                                src={testimonials[index + 1].avatar}
                                alt={testimonials[index + 1].name}
                                className="rounded-circle me-3"
                                width="50"
                                height="50"
                              />
                              <div>
                                <h6 className="mb-0">
                                  {testimonials[index + 1].name}
                                </h6>
                                <small className="text-muted">
                                  {testimonials[index + 1].role}
                                </small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </Carousel.Item>
              );
            }
            return acc;
          }, [])}
        </Carousel>
      </Container>
    </section>
  );
}

export default Testimonials;
