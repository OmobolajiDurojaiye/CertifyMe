import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { signupUser } from "../api";
import "../styles/Auth.css";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    account_type: "individual",
    company_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { name, email, password, account_type, company_name } = formData;
    const payload = { name, email, password, account_type };

    if (account_type === "company") {
      if (!company_name.trim()) {
        setError("Company Name is required for a company account.");
        setLoading(false);
        return;
      }
      payload.company_name = company_name;
    }

    try {
      await signupUser(payload);
      // Redirect to verification page instead of login
      navigate("/verify-email", { state: { email: payload.email } });
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel">
          <h2>Join the Future of Certification</h2>
          <p>
            Create your free account and start issuing secure, verifiable
            credentials in minutes.
          </p>
        </div>
        <div className="auth-form-container">
          <Link to="/">
            <img
              src="/images/certbadge.png"
              alt="CertifyMe Logo"
              className="auth-logo"
            />
          </Link>
          <h3>Create an Account</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {plan && (
            <Alert variant="info">
              You've selected the{" "}
              <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong>{" "}
              plan. Complete your registration to proceed to payment.
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Account Type</Form.Label>
              <div className="account-type-toggle">
                <input
                  type="radio"
                  name="account_type"
                  id="individual"
                  value="individual"
                  checked={formData.account_type === "individual"}
                  onChange={handleChange}
                />
                <label htmlFor="individual">Individual</label>

                <input
                  type="radio"
                  name="account_type"
                  id="company"
                  value="company"
                  checked={formData.account_type === "company"}
                  onChange={handleChange}
                />
                <label htmlFor="company">Company</label>
              </div>
            </Form.Group>

            {formData.account_type === "company" && (
              <Form.Group className="mb-3" controlId="company_name">
                <Form.Label>Company / Institution Name</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter your company's name"
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4 position-relative" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </Form.Group>
            <Button className="btn-auth w-100" type="submit" disabled={loading}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Create Account"
              )}
            </Button>
          </Form>
          <p className="text-center mt-4 text-muted">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
            {" | "}
            <Link to="/" className="auth-switch-link">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
