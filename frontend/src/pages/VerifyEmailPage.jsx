import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { verifyEmail, signupUser } from "../api";
import "../styles/Auth.css";

function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      // If user lands here directly without coming from signup, redirect them
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await verifyEmail({
        email,
        verification_code: verificationCode,
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      // The signupUser endpoint now handles resending if the user is unverified.
      // We send dummy data for other fields as the backend might require them.
      await signupUser({
        email,
        name: "Resend",
        password: "dummy_password",
        account_type: "individual",
      });
      setSuccess("A new verification code has been sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Failed to resend code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel">
          <h2>Almost There!</h2>
          <p>
            Just one more step to secure your account and start issuing
            credentials.
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
          <h3>Verify Your Email</h3>
          <p className="text-muted mb-4">
            We've sent a 6-digit code to <strong>{email}</strong>. Please enter
            it below.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="verification_code">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                name="verification_code"
                value={verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                required
                maxLength="6"
              />
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
                "Verify & Sign In"
              )}
            </Button>
          </Form>
          <div className="text-center mt-4 text-muted">
            Didn't receive a code?{" "}
            <Button
              variant="link"
              className="auth-switch-link p-0"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button>
            <p className="mt-3">
              <Link to="/signup" className="auth-switch-link">
                Use a different email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
