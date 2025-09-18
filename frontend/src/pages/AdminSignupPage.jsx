import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { adminSignup } from "../api";
import "../styles/Auth.css";

function AdminSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminSignup(formData);
      // On success, navigate to the verify page and pass the email
      navigate("/admin/verify", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel" style={{ backgroundColor: "#0d6efd" }}>
          <h2>Create Your Admin Account</h2>
          <p>
            This is a one-time setup for the master administrator of CertifyMe.
          </p>
        </div>
        <div className="auth-form-container">
          <img
            src="/images/certbadge.png"
            alt="CertifyMe Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "35px" }}
          />
          <h3>Admin Setup</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button className="btn-auth w-100" type="submit" disabled={loading}>
              {loading ? (
                <Spinner as="span" size="sm" />
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default AdminSignupPage;
