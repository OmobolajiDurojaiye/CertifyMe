import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { requestPasswordReset } from "../api";
import "../styles/Auth.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.data.msg);
    } catch (err) {
      setError(
        err.response?.data?.msg || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel">
          <h2>Forgot Your Password?</h2>
          <p>
            No problem. Enter your email address and we'll send you a link to
            reset it.
          </p>
        </div>
        <div className="auth-form-container">
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "35px" }}
          />
          <h3>Reset Password</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={!!message} // Disable form after success
              />
            </Form.Group>
            <Button
              className="btn-auth w-100"
              type="submit"
              disabled={loading || !!message}
            >
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </Form>
          <p className="text-center mt-4 text-muted">
            Remember your password?{" "}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
