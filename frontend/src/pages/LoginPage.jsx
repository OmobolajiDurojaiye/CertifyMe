import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { loginUser } from "../api";
import "../styles/Auth.css";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

    try {
      const response = await loginUser(formData);
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
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
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "35px" }}
          />
          <h3>Sign In</h3>
          {error && <Alert variant="danger">{error}</Alert>}
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
