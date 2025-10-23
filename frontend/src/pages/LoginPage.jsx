import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  Eye,
  EyeSlash,
  ExclamationTriangleFill,
  CheckCircleFill,
} from "react-bootstrap-icons";
import { loginUser, resendVerificationEmail } from "../api";
import "../styles/Auth.css";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
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
      const response = await resendVerificationEmail(formData.email);
      setSuccess(response.data.msg);
      setShowResend(false); // Hide the resend prompt after success
      setError(""); // Clear the related error
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
    setShowResend(false);

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
        // Show both the error and the actionable resend prompt
        setError(errorData.msg || "Please verify your account to continue.");
        setShowResend(true);
      } else {
        setError(errorData?.msg || "Login failed. Please try again.");
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

          {/* --- NEW MODERN ALERTS --- */}
          {error && (
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
          {showResend && (
            <div className="custom-alert custom-alert-warning">
              <ExclamationTriangleFill size={20} className="alert-icon" />
              <span>Your account needs verification.</span>
              <Button
                variant="link"
                className="resend-link p-0"
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            </div>
          )}
          {/* --- END OF MODERN ALERTS --- */}

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
