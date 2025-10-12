import React, { useState, useEffect, useCallback } from "react";
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
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { usePaystackPayment } from "react-paystack";
import {
  getCurrentUser,
  initializePayment as apiInitializePayment,
  uploadUserSignature,
  generateApiKey,
  switchToCompany,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { SERVER_BASE_URL } from "../config";
import { UploadCloud, Key, Copy, Check, Info, Lock } from "lucide-react";
import {
  QuestionCircle,
  BoxArrowRight,
  ChevronRight,
} from "react-bootstrap-icons";
import { useUser } from "../context/UserContext";

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
        Current Plan: {user?.role?.toUpperCase() || "FREE"} -
        {user?.cert_quota || 10} certificates remaining
      </Alert>
      <Row className="g-3">
        <Col md={6} lg={3}>
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
        <Col md={6} lg={3}>
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
        <Col md={6} lg={3}>
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
        <Col md={6} lg={3}>
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

const SignatureLock = () => (
  <div
    className="d-flex flex-column justify-content-center align-items-center position-absolute"
    style={{
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 10,
      borderRadius: "inherit",
    }}
  >
    <Lock size={48} className="text-warning mb-3" />
    <h5 className="fw-bold">This is a Premium Feature</h5>
    <p className="text-muted mb-3">
      Upgrade your plan to upload a custom signature.
    </p>
    <Button
      as={Link}
      to="/dashboard/settings"
      state={{ defaultTab: "billing" }}
      variant="success"
    >
      Upgrade Now
    </Button>
  </div>
);

const ApiAccessLock = () => (
  <Card className="page-content-card text-center p-5">
    <Key size={64} className="text-primary mx-auto mb-4" />
    <h3 className="fw-bold">Unlock API Access</h3>
    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "500px" }}>
      Integrate CertifyMe with your own applications and automate your workflow.
      API access is available on Pro and Enterprise plans.
    </p>
    <div className="d-grid gap-2 col-6 mx-auto">
      <Button
        as={Link}
        to="/dashboard/settings"
        state={{ defaultTab: "billing" }}
        variant="primary"
        size="lg"
      >
        Upgrade to Pro
      </Button>
    </div>
  </Card>
);

const roleOrder = {
  free: 0,
  starter: 1,
  growth: 2,
  pro: 3,
  enterprise: 4,
};

function SettingsPage() {
  const { user, loading: loadingUserContext } = useUser();
  const [localUser, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [signatureFile, setSignatureFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  const isFreeUser = user && user.role === "free";
  const hasApiAccess = user && ["pro", "enterprise"].includes(user.role);
  const isCompanyUser = user && user.company;

  const initializePayment = usePaystackPayment(paystackConfig);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setLocalUser(res.data);
      if (res.data.signature_image_url) {
        setPreview(SERVER_BASE_URL + res.data.signature_image_url);
      }
    } catch (error) {
      toast.error("Your session may have expired. Please log in again.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = useCallback(
    async (plan) => {
      setProcessingPlan(plan);
      try {
        const res = await apiInitializePayment(plan);
        setPaystackConfig({
          ...res.data,
          currency: res.data.currency || "NGN",
        });
      } catch (error) {
        toast.error(
          error.response?.data?.msg || "Failed to initialize payment."
        );
        setProcessingPlan(null);
      }
    },
    [setProcessingPlan, setPaystackConfig]
  );

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const planToPurchase = location.state?.planToPurchase;
    if (planToPurchase && !loading && localUser) {
      const planOrder = roleOrder[planToPurchase];
      const currentOrder = roleOrder[localUser.role] ?? 0;

      if (planOrder < currentOrder) {
        toast.error(
          `You cannot downgrade. Your current plan is ${localUser.role}.`
        );
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      toast.success(
        `Redirecting to payment for ${
          planToPurchase.charAt(0).toUpperCase() + planToPurchase.slice(1)
        } plan...`
      );
      handleUpgrade(planToPurchase);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.state,
    loading,
    localUser,
    handleUpgrade,
    navigate,
    location.pathname,
  ]);

  useEffect(() => {
    if (paystackConfig) {
      initializePayment({
        onSuccess: () => {
          toast.success("Payment successful! Refreshing your account...");
          setTimeout(() => window.location.reload(), 1500);
        },
        onClose: () => {
          toast.error("Payment modal closed.");
          setProcessingPlan(null);
        },
      });
    }
  }, [paystackConfig, initializePayment]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setSignatureFile(file);
      setPreview(URL.createObjectURL(file));
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
      setLocalUser({
        ...localUser,
        signature_image_url: res.data.signature_image_url,
      });
      setPreview(SERVER_BASE_URL + res.data.signature_image_url);
      setSignatureFile(null);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to upload signature.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    toast.promise(generateApiKey(), {
      loading: "Generating new API key...",
      success: (res) => {
        setNewApiKey(res.data.api_key);
        setShowKeyModal(true);
        fetchUser();
        return "API Key generated successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to generate API key.",
    });
  };

  const handleSwitchToCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast.error("Please enter a company name.");
      return;
    }
    setIsSwitching(true);
    try {
      const res = await switchToCompany(newCompanyName);
      toast.success(res.data.msg);
      window.location.reload();
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Failed to create company account."
      );
    } finally {
      setIsSwitching(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const defaultTabKey = location.state?.defaultTab || "profile";

  if (loading || loadingUserContext) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  const renderDevTooltip = (props) => (
    <Tooltip id="dev-tooltip" {...props}>
      <Lock size={12} className="me-1" /> Available on Pro and Enterprise plans
    </Tooltip>
  );

  return (
    <div>
      <Toaster position="top-center" />
      <h2 className="fw-bold mb-4">Settings</h2>
      <Tab.Container id="settings-tabs" defaultActiveKey={defaultTabKey}>
        <Nav variant="tabs" className="mb-4 settings-tabs">
          <Nav.Item>
            <Nav.Link eventKey="profile">Profile</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="billing">Billing</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            {hasApiAccess ? (
              <Nav.Link eventKey="developer">Developer</Nav.Link>
            ) : (
              <OverlayTrigger placement="top" overlay={renderDevTooltip}>
                <span className="d-inline-block">
                  <Nav.Link eventKey="developer" disabled>
                    Developer
                  </Nav.Link>
                </span>
              </OverlayTrigger>
            )}
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <Card className="page-content-card mb-4">
              <Card.Title as="h5" className="fw-bold mb-4">
                Public Profile
              </Card.Title>
              {isCompanyUser && (
                <Alert variant="success">
                  <Info size={20} className="me-2" />
                  This account is part of the{" "}
                  <strong>{user.company.name}</strong> company. Certificates you
                  create will be issued by this company.
                </Alert>
              )}
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={localUser?.name}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        defaultValue={localUser?.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card>

            {!isCompanyUser && (
              <Card className="page-content-card mb-4">
                <Card.Title as="h5" className="fw-bold mb-4">
                  Create a Company Account
                </Card.Title>
                <Card.Text>
                  Switch to a company account to have all your certificates
                  officially issued under your company's name. This action
                  cannot be undone.
                </Card.Text>
                <Form onSubmit={handleSwitchToCompany}>
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Company / Institution Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your company's name"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={isSwitching}
                      >
                        {isSwitching ? (
                          <>
                            <Spinner as="span" size="sm" className="me-2" />
                            Creating...
                          </>
                        ) : (
                          "Switch to Company Account"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            )}

            <Card
              className="page-content-card mb-4"
              style={{ position: "relative" }}
            >
              {isFreeUser && <SignatureLock />}
              <Card.Title as="h5" className="fw-bold mb-4">
                Signature Management
              </Card.Title>
              <Card.Text>Upload a transparent PNG of your signature.</Card.Text>
              <Form
                onSubmit={handleSubmitSignature}
                style={{ filter: isFreeUser ? "blur(4px)" : "none" }}
              >
                <Form.Group className="mb-3">
                  <Form.Label>Upload Signature Image (PNG or JPG)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    disabled={isFreeUser}
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
                  disabled={isUploading || !signatureFile || isFreeUser}
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
            <Card className="page-content-card">
              <Card.Title as="h5" className="fw-bold mb-3">
                Account Actions
              </Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  onClick={() => navigate("/dashboard/support")}
                  className="d-flex justify-content-between align-items-center px-0"
                >
                  <div className="d-flex align-items-center">
                    <QuestionCircle size={20} className="me-3 text-primary" />
                    <span className="fw-medium">Contact Support</span>
                  </div>
                  <ChevronRight />
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  onClick={handleLogout}
                  className="d-flex justify-content-between align-items-center px-0 text-danger"
                >
                  <div className="d-flex align-items-center">
                    <BoxArrowRight size={20} className="me-3" />
                    <span className="fw-medium">Logout</span>
                  </div>
                  <ChevronRight />
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="billing">
            <BillingContent
              user={user}
              processingPlan={processingPlan}
              handleUpgrade={handleUpgrade}
            />
          </Tab.Pane>

          <Tab.Pane eventKey="developer">
            {hasApiAccess ? (
              <Card className="page-content-card">
                <Card.Title as="h5" className="fw-bold mb-4">
                  API Access
                </Card.Title>
                <Card.Text>
                  Integrate CertifyMe with your applications using your personal
                  API key.
                </Card.Text>
                {localUser?.api_key ? (
                  <Alert variant="info" className="d-flex align-items-center">
                    <Info size={20} className="me-2 flex-shrink-0" />
                    <div>
                      An API key exists for your account. For security, it is
                      not shown here. If you've lost it, you must regenerate a
                      new one.
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="warning">
                    You have not generated an API key yet.
                  </Alert>
                )}
                <Button variant="danger" onClick={handleGenerateApiKey}>
                  <Key size={18} className="me-2" />
                  {localUser?.api_key
                    ? "Regenerate API Key"
                    : "Generate API Key"}
                </Button>
                <Card.Text className="mt-2 text-muted small">
                  Warning: Regenerating will invalidate your old key
                  immediately.
                </Card.Text>
              </Card>
            ) : (
              <ApiAccessLock />
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

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
