import React, { useState, useEffect } from "react";
import {
  Tab,
  Nav,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { usePaystackPayment } from "react-paystack";
import { getCurrentUser, initializePayment } from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // <-- STEP 1: Import useNavigate

const PlanCard = ({
  title,
  price,
  features,
  actionText,
  onAction,
  current,
  disabled = false,
  loading = false,
}) => (
  <Card
    className={`h-100 d-flex flex-column ${current ? "border-primary" : ""}`}
  >
    <Card.Body className="d-flex flex-column">
      <h5 className="fw-bold">{title}</h5>
      <h2 className="fw-bolder my-3">{price}</h2>
      <ul className="list-unstyled mb-4">
        {features.map((feature, index) => (
          <li key={index} className="mb-2 d-flex align-items-center">
            <svg
              className="me-2 flex-shrink-0"
              width="16"
              height="16"
              fill="green"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        {current ? (
          <Button variant="outline-success" className="w-100" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-100"
            onClick={onAction}
            disabled={disabled || loading}
          >
            {loading ? <Spinner size="sm" /> : actionText}
          </Button>
        )}
      </div>
    </Card.Body>
  </Card>
);

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const navigate = useNavigate(); // <-- STEP 2: Initialize useNavigate

  // This is a special hook from the react-paystack library.
  // We pass it a config object.
  const initializePaystack = usePaystackPayment({
    // STEP 3: Add this line to the config.
    // This tells the library "DO NOT automatically redirect after payment".
    redirect: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        toast.error("Could not load user data. Please refresh.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpgrade = async (plan) => {
    setProcessingPlan(plan);
    try {
      // First, we ask our backend to prepare the payment
      const res = await initializePayment(plan);
      const { publicKey, amount, email, reference } = res.data;

      // Then, we open the Paystack modal with the details from our backend
      initializePaystack({
        // This is what happens if payment is successful
        onSuccess: () => {
          toast.success("Payment successful! Redirecting to your dashboard...");
          // STEP 4: WE are now in control. We manually and reliably
          // navigate the user to the dashboard using React Router.
          setTimeout(() => {
            navigate("/dashboard");
            window.location.reload(); // Force a reload to get new user data
          }, 2000);
        },
        // This is what happens if the user closes the modal
        onClose: () => {
          toast.error("Payment modal closed.");
          setProcessingPlan(null);
        },
        // Pass the payment details to the modal
        publicKey,
        amount,
        email,
        reference,
      });

    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to initialize payment.");
      setProcessingPlan(null);
    }
  };

  const BillingContent = () => {
    if (loadingUser) return <Spinner animation="border" />;
    if (!user)
      return <Alert variant="danger">Could not load user information.</Alert>;

    return (
      <Card className="page-content-card">
        <Card.Title as="h5" className="fw-bold mb-4">
          Billing Information
        </Card.Title>
        <p>
          You are currently on the{" "}
          <strong className="text-capitalize">{user.role} Plan</strong>.
        </p>
        {user.role === "free" && (
          <p>
            Your remaining certificate quota is:{" "}
            <strong>{user.cert_quota}</strong>
          </p>
        )}
        <hr className="my-4" />

        <h5 className="fw-bold mb-3">Upgrade Your Plan</h5>
        <Row>
          <Col md={6} className="mb-3">
            <PlanCard
              title="Monthly Plan"
              price="$15 / month"
              features={[
                "Unlimited certificates",
                "Custom branding",
                "Email delivery",
                "Priority support",
              ]}
              actionText="Upgrade to Monthly"
              onAction={() => handleUpgrade("starter")}
              current={user.role === "starter"}
              disabled={user.role === "pro"}
              loading={processingPlan === "starter"}
            />
          </Col>
          <Col md={6} className="mb-3">
            <PlanCard
              title="Lifetime Plan"
              price="$99 one-time"
              features={[
                "Everything in Monthly",
                "Lifetime access",
                "No recurring fees",
              ]}
              actionText="Go Lifetime"
              onAction={() => handleUpgrade("pro")}
              current={user.role === "pro"}
              loading={processingPlan === "pro"}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Toaster position="top-center" />
      <h2 className="fw-bold mb-4">Settings</h2>

      <Tab.Container id="settings-tabs" defaultActiveKey="billing">
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
              {loadingUser ? (
                <Spinner />
              ) : (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={user?.name}
                          disabled
                          className="custom-form-control"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          defaultValue={user?.email}
                          disabled
                          className="custom-form-control"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" disabled>
                    Update Profile
                  </Button>
                </Form>
              )}
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="billing">
            <BillingContent />
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
                <Button variant="primary" disabled>
                  Update Password
                </Button>
              </Form>
            </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

export default SettingsPage;