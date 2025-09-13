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
import { getCurrentUser, initializePayment, uploadUserSignature } from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { SERVER_BASE_URL } from "../config"; // --- IMPORT SERVER URL ---
import { UploadCloud } from "lucide-react";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [signatureFile, setSignatureFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
        if (res.data.signature_image_url) {
          setPreview(SERVER_BASE_URL + res.data.signature_image_url);
        }
      } catch (error) {
        toast.error("Your session may have expired. Please log in again.");
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();

    // Handle Paystack callback
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("trxref") || params.get("reference");
    if (paymentStatus) {
      toast.success("Payment processed! Refreshing your plan...");
      setTimeout(() => {
        fetchUser(); // Refresh user data
        navigate("/dashboard/settings", { replace: true }); // Redirect to settings
      }, 2000);
    }
  }, [navigate, location]);

  const handleUpgrade = async (plan) => {
    setProcessingPlan(plan);
    try {
      // Call backend to get payment details
      const res = await initializePayment(plan);
      const paymentData = res.data;

      // Validate payment data
      if (
        !paymentData ||
        !paymentData.publicKey ||
        !paymentData.email ||
        !paymentData.amount ||
        !paymentData.reference
      ) {
        throw new Error("Incomplete payment data received from server");
      }

      // Paystack configuration
      const config = {
        publicKey: paymentData.publicKey,
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency || "NGN",
        reference: paymentData.reference,
        metadata: paymentData.metadata || {},
        channels: ["card", "bank", "ussd", "mobile_money"], // Add supported channels
      };

      // Initialize Paystack payment
      const initialize = usePaystackPayment(config);
      initialize({
        onSuccess: (response) => {
          toast.success("Payment successful! Redirecting...");
          setProcessingPlan(null);
          // Redirect to settings with reference to trigger useEffect
          navigate(`/dashboard/settings?reference=${response.reference}`);
        },
        onClose: () => {
          toast.error("Payment modal closed.");
          setProcessingPlan(null);
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.response?.data?.msg ||
          error.message ||
          "Failed to initialize payment."
      );
      setProcessingPlan(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid PNG or JPG image.");
    }
  };

  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    if (!signatureFile) {
      toast.error("Please select a signature file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("signature", signatureFile);

    const promise = uploadUserSignature(formData);

    toast.promise(promise, {
      loading: "Uploading signature...",
      success: (res) => {
        setUser((prev) => ({
          ...prev,
          signature_image_url: res.data.signature_image_url,
        }));
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Upload failed.",
    });

    promise.finally(() => setIsUploading(false));
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
        {user.role === "starter" && user.subscription_expiry && (
          <p>
            Your plan expires on:{" "}
            <strong>
              {new Date(user.subscription_expiry).toLocaleDateString()}
            </strong>
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
            {/* --- PROFILE INFO CARD --- */}
            <Card className="page-content-card mb-4">
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
                </Form>
              )}
            </Card>

            {/* --- SIGNATURE MANAGEMENT CARD (NEW) --- */}
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                Signature Management
              </Card.Title>
              <Card.Text>
                Upload a transparent PNG of your signature. This will be used on
                all certificates you issue.
              </Card.Text>
              <Form onSubmit={handleSubmitSignature}>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Signature Image (PNG or JPG)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                  />
                </Form.Group>
                {preview && (
                  <div
                    className="mb-3 p-3 border rounded text-center"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <p className="fw-bold text-muted">Signature Preview:</p>
                    <img
                      src={preview}
                      alt="Signature Preview"
                      style={{
                        maxHeight: "80px",
                        maxWidth: "100%",
                        filter: "invert(0%)",
                      }}
                    />
                  </div>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isUploading || !signatureFile}
                >
                  {isUploading ? (
                    <Spinner as="span" size="sm" />
                  ) : (
                    <UploadCloud size={16} className="me-2" />
                  )}
                  {isUploading ? " Uploading..." : " Save Signature"}
                </Button>
              </Form>
            </Card>
            {/* --- END OF SIGNATURE CARD --- */}
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
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

export default SettingsPage;
