import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Spinner, Alert } from "react-bootstrap";
import { verifyEmail, resendVerificationEmail } from "../api";
import { Mail, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";

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
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    // Only allow numbers and max 6 chars
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        err.response?.data?.msg || "Verification failed. Check the code."
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
      const response = await resendVerificationEmail(email);
      setSuccess(response.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="d-flex min-vh-100 bg-white">
      {/* LEFT SIDE - BRANDING */}
      <div
        className="d-none d-lg-flex col-lg-6 bg-indigo-900 text-white flex-column justify-content-center align-items-center p-5 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
        }}
      >
        <div
          className="position-relative z-1 text-center"
          style={{ maxWidth: "480px" }}
        >
          <ShieldCheck size={64} className="mb-4 text-indigo-300" />
          <h1 className="fw-bold display-6 mb-3">Secure Your Account</h1>
          <p className="lead opacity-75">
            Verification helps us keep your data safe and ensures you are a real
            person.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center p-4 p-md-5 bg-light">
        <div
          className="w-100 bg-white p-4 p-md-5 rounded-4 shadow-sm text-center"
          style={{ maxWidth: "450px" }}
        >
          <div className="mb-4">
            <div className="bg-indigo-50 d-inline-flex p-3 rounded-circle mb-3 text-indigo-600">
              <Mail size={32} />
            </div>
            <h2 className="fw-bold text-dark mb-2">Check Your Email</h2>
            <p className="text-muted small mb-0">
              We've sent a 6-digit code to:
            </p>
            <p className="fw-bold text-dark">{email}</p>
          </div>

          {error && (
            <Alert
              variant="danger"
              className="border-0 bg-danger-subtle text-danger small py-2"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              className="border-0 bg-success-subtle text-success small py-2"
            >
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                value={verificationCode}
                onChange={handleChange}
                placeholder="000000"
                className="text-center fw-bold fs-3 tracking-widest border-2 py-2"
                style={{ letterSpacing: "0.5em" }}
                autoFocus
                required
              />
            </Form.Group>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm"
              style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  Verify & Sign In <ArrowRight size={18} className="ms-1" />
                </>
              )}
            </button>
          </Form>

          <div className="d-flex flex-column gap-2 text-sm">
            <div className="text-muted">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="btn btn-link p-0 text-indigo-600 text-decoration-none fw-bold"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </div>

            <div className="border-top pt-3 mt-2">
              <Link
                to="/login"
                className="text-muted text-decoration-none small d-inline-flex align-items-center hover:text-dark"
              >
                <ArrowLeft size={14} className="me-1" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
