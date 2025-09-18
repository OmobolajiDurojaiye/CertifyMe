import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { adminLogin } from "../api";
import "../styles/Auth.css";

function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for a success message or error from the verification page or protected route
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
    if (location.state?.error) {
      setError(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await adminLogin(formData);
      localStorage.setItem("token", response.data.access_token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel" style={{ backgroundColor: "#dc3545" }}>
          <h2>Administrator Access</h2>
          <p>
            Welcome to the CertifyMe Admin Control Panel. Please authenticate to
            continue.
          </p>
        </div>
        <div className="auth-form-container">
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "35px" }}
          />
          <h3>Admin Sign In</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Admin Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@certifyme.com"
                required
              />
            </Form.Group>
            <Form.Group className="mb-4 position-relative" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </Form.Group>
            <Button
              className="btn-auth w-100"
              style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner as="span" size="sm" /> : "Sign In"}
            </Button>
          </Form>
          <p className="text-center mt-4 text-muted">
            <Link to="/" className="auth-switch-link">
              Back to Main Site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
