import React from "react";
import { Tab, Nav, Row, Col, Card, Form, Button } from "react-bootstrap";

function SettingsPage() {
  return (
    <div>
      <h2 className="fw-bold mb-4">Settings</h2>

      <Tab.Container id="settings-tabs" defaultActiveKey="profile">
        <Nav variant="tabs" className="mb-4 settings-tabs">
          <Nav.Item>
            <Nav.Link eventKey="profile">Profile</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="billing">Billing</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="security">Security</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                Public Profile
              </Card.Title>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Bolaji"
                        className="custom-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="bolaji@example.com"
                        disabled
                        className="custom-form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary">Update Profile</Button>
              </Form>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="billing">
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                Billing Information
              </Card.Title>
              <p>
                You are currently on the <strong>Pro Plan</strong>.
              </p>
              <Button variant="outline-primary" className="me-2">
                Change Plan
              </Button>
              <Button variant="outline-secondary">View Invoices</Button>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="security">
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                Change Password
              </Card.Title>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        className="custom-form-control"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        className="custom-form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary">Update Password</Button>
              </Form>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

export default SettingsPage;
