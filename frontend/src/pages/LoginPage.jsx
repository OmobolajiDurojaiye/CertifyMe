import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  Eye,
  EyeSlash,
  ExclamationTriangleFill,
  CheckCircleFill,
} from "react-bootstrap-icons";
import { loginUser, resendVerificationEmail } from "../api"; // Correct API function is already imported
import "../styles/Auth.css";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
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

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // Call the correct, dedicated API endpoint for resending the code.
      const response = await resendVerificationEmail(formData.email);
      // --- END OF FIX ---
      setSuccess(response.data.msg);
      setShowVerificationPrompt(true); // Keep the prompt visible
    } catch (err) {
      setError(
        err.response?.data?.msg || "Failed to resend code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setShowVerificationPrompt(false);

    try {
      const response = await loginUser(formData);
      localStorage.setItem("token", response.data.access_token);

      if (plan) {
        navigate("/dashboard/settings", {
          state: {
            defaultTab: "billing",
            planToPurchase: plan,
          },
        });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.unverified) {
        setError("");
        setShowVerificationPrompt(true);
      } else {
        setError(errorData?.msg || "Login failed. Please try again.");
        setShowVerificationPrompt(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel">
          <h2>Welcome Back to CertifyMe</h2>
          <p>The smartest way to issue and manage your digital credentials.</p>
        </div>
        <div className="auth-form-container">
          <Link to="/">
            <img
              src="/images/certbadge.png"
              alt="CertifyMe Logo"
              className="auth-logo"
            />
          </Link>
          <h3>Sign In</h3>

          {error && !showVerificationPrompt && (
            <div className="custom-alert custom-alert-danger">
              <ExclamationTriangleFill size={20} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="custom-alert custom-alert-success">
              <CheckCircleFill size={20} className="alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {showVerificationPrompt && (
            <div className="custom-alert custom-alert-warning verification-prompt">
              <ExclamationTriangleFill size={20} className="alert-icon" />
              <div className="alert-content">
                <span className="alert-title">
                  Account Verification Required
                </span>
                <p className="alert-message">
                  To sign in, please complete the verification step.
                </p>
                <div className="alert-actions">
                  <Button
                    variant="link"
                    className="resend-link"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </Button>
                  <Link
                    to="/verify-email"
                    state={{ email: formData.email }}
                    className="verify-action-btn"
                  >
                    Enter Code
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
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
                "Sign In"
              )}
            </Button>
          </Form>
          <p className="text-center mt-4 text-muted">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-switch-link">
              Sign Up
            </Link>
            {" | "}
            <Link to="/forgot-password" className="auth-switch-link">
              Forgot Password?
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

export default LoginPage;
