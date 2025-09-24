// SettingsPage.jsx
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
  Modal,
  InputGroup,
} from "react-bootstrap";
import { usePaystackPayment } from "react-paystack";
import {
  getCurrentUser,
  initializePayment as apiInitializePayment,
  uploadUserSignature,
  generateApiKey, // --- NEW: Import the new API function ---
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { SERVER_BASE_URL } from "../config";
import { UploadCloud, Key, Copy, Check, Info } from "lucide-react"; // --- NEW: Import icons ---

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
const BillingContent = ({ user, processingPlan, handleUpgrade }) => (
  <Card className="page-content-card mb-4">
    <Card.Body>
      <Card.Title as="h5" className="fw-bold mb-4">
        Choose Your Plan
      </Card.Title>
      <Alert variant="info" className="mb-4">
        Current Plan: {user?.role?.toUpperCase() || "FREE"} -{" "}
        {user?.cert_quota || 10} certificates remaining
      </Alert>
      <Row>
        <Col md={3}>
          <PlanCard
            title="Starter"
            price="$15 for 500 certs"
            features={[
              "500 Certificate Credits",
              "Unlimited Templates",
              "Email Delivery",
              "PDF Downloads",
            ]}
            actionText="Upgrade to Starter"
            onAction={() => handleUpgrade("starter")}
            current={user?.role === "starter"}
            loading={processingPlan === "starter"}
          />
        </Col>
        <Col md={3}>
          <PlanCard
            title="Growth"
            price="$50 for 2,000 certs"
            features={[
              "2,000 Certificate Credits",
              "Unlimited Templates",
              "Email Delivery",
              "PDF Downloads",
              "Priority Support",
            ]}
            actionText="Upgrade to Growth"
            onAction={() => handleUpgrade("growth")}
            current={user?.role === "growth"}
            loading={processingPlan === "growth"}
          />
        </Col>
        <Col md={3}>
          <PlanCard
            title="Pro"
            price="$100 for 5,000 certs"
            features={[
              "5,000 Certificate Credits",
              "Unlimited Templates",
              "Email Delivery",
              "PDF Downloads",
              "API Access",
            ]}
            actionText="Upgrade to Pro"
            onAction={() => handleUpgrade("pro")}
            current={user?.role === "pro"}
            loading={processingPlan === "pro"}
          />
        </Col>
        <Col md={3}>
          <PlanCard
            title="Enterprise"
            price="$300 for 20,000 certs"
            features={[
              "20,000 Certificate Credits",
              "Unlimited Templates",
              "Email Delivery",
              "PDF Downloads",
              "Custom Support",
              "API Access",
            ]}
            actionText="Upgrade to Enterprise"
            onAction={() => handleUpgrade("enterprise")}
            current={user?.role === "enterprise"}
            loading={processingPlan === "enterprise"}
          />
        </Col>
      </Row>
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
  const [paystackConfig, setPaystackConfig] = useState(null);

  // --- NEW: State for API Key Management ---
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const initializePayment = usePaystackPayment(paystackConfig);

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

  useEffect(() => {
    if (paystackConfig) {
      initializePayment({
        onSuccess: (response) => {
          toast.success("Payment successful! Refreshing your plan...");
          setProcessingPlan(null);
          setPaystackConfig(null);
          navigate(`/dashboard/settings?reference=${response.reference}`, {
            replace: true,
          });
          setTimeout(fetchUser, 1000);
        },
        onClose: () => {
          toast.error("Payment modal closed.");
          setProcessingPlan(null);
          setPaystackConfig(null);
        },
      });
    }
  }, [paystackConfig, initializePayment, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("trxref") || params.get("reference");
    if (paymentStatus) {
      toast.success(
        "Payment processed! Your plan details will update shortly."
      );
      navigate("/dashboard/settings", { replace: true });
    }
    fetchUser();
  }, [navigate, location.search]);

  const handleUpgrade = async (plan) => {
    setProcessingPlan(plan);
    try {
      const res = await apiInitializePayment(plan);
      const paymentData = res.data;

      setPaystackConfig({
        publicKey: paymentData.publicKey,
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency || "NGN",
        reference: paymentData.reference,
        metadata: paymentData.metadata || {},
        channels: ["card", "bank", "ussd", "mobile_money"],
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
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid PNG or JPEG image.");
    }
  };

  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    if (!signatureFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("signature", signatureFile);
    try {
      const res = await uploadUserSignature(formData);
      toast.success(res.data.msg);
      setUser({ ...user, signature_image_url: res.data.signature_image_url });
      setPreview(SERVER_BASE_URL + res.data.signature_image_url);
      setSignatureFile(null);
    } catch (error) {
      toast.error("Failed to upload signature.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- NEW: Handler for API Key Generation ---
  const handleGenerateApiKey = async () => {
    const promise = generateApiKey();
    toast.promise(promise, {
      loading: "Generating new API key...",
      success: (res) => {
        setNewApiKey(res.data.api_key);
        setShowKeyModal(true);
        fetchUser(); // Refresh user data to show API key exists
        return "API Key generated successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to generate API key.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loadingUser) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

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
          {/* --- NEW: Add Developer Tab --- */}
          <Nav.Item>
            <Nav.Link eventKey="developer">Developer</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <Card className="page-content-card mb-4">
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
                        defaultValue={user?.name}
                        disabled
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
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                Signature Management
              </Card.Title>
              <Card.Text>Upload a transparent PNG of your signature.</Card.Text>
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
                      style={{ maxHeight: "80px", maxWidth: "100%" }}
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
          </Tab.Pane>
          <Tab.Pane eventKey="billing">
            <BillingContent
              user={user}
              processingPlan={processingPlan}
              handleUpgrade={handleUpgrade}
            />
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
                      <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" disabled>
                  Update Password
                </Button>
              </Form>
            </Card>
          </Tab.Pane>

          {/* --- NEW: Add Developer Tab Pane --- */}
          <Tab.Pane eventKey="developer">
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-4">
                API Access
              </Card.Title>
              <Card.Text>
                Integrate CertifyMe with your applications using your personal
                API key. This allows you to programmatically generate
                certificates without using the dashboard.
              </Card.Text>
              {user?.api_key ? (
                <Alert variant="info" className="d-flex align-items-center">
                  <Info size={20} className="me-2 flex-shrink-0" />
                  <div>
                    An API key exists for your account. For security, it is not
                    shown here. If you've lost it, you must regenerate a new
                    one.
                  </div>
                </Alert>
              ) : (
                <Alert variant="warning">
                  You have not generated an API key yet.
                </Alert>
              )}
              <Button variant="danger" onClick={handleGenerateApiKey}>
                <Key size={18} className="me-2" />
                {user?.api_key ? "Regenerate API Key" : "Generate API Key"}
              </Button>
              <Card.Text className="mt-2 text-muted small">
                Warning: Regenerating will invalidate your old key immediately.
              </Card.Text>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* --- NEW: Modal for displaying the new API key --- */}
      <Modal show={showKeyModal} onHide={() => setShowKeyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your New API Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Please copy your new API key and store it in a safe place.
            <strong> This is the only time you will be able to see it.</strong>
          </Alert>
          <InputGroup>
            <Form.Control value={newApiKey} readOnly />
            <Button variant="outline-secondary" onClick={copyToClipboard}>
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowKeyModal(false)}>
            I have copied my key
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SettingsPage;
