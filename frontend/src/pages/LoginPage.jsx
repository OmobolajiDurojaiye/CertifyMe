import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Spinner, Alert } from "react-bootstrap";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { loginUser, resendVerificationEmail } from "../api";

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

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      const response = await resendVerificationEmail(formData.email);
      setSuccess(response.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code.");
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
          state: { defaultTab: "billing", planToPurchase: plan },
        });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.unverified) {
        setShowVerificationPrompt(true);
      } else {
        setError(errorData?.msg || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex justify-center items-center gap-2 mb-6 no-underline"
        >
          <img src="/images/certbadge.png" alt="Logo" className="h-10 w-10" />
          <span className="font-bold text-2xl text-gray-900">CertifyMe</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500 no-underline"
          >
            create a free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && !showVerificationPrompt && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5" /> {success}
            </div>
          )}

          {showVerificationPrompt && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-2">
                <AlertTriangle size={16} /> Verification Required
              </h4>
              <p className="text-xs text-yellow-700 mb-3">
                Your account isn't verified yet.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-xs font-semibold text-yellow-800 underline hover:text-yellow-900"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
                <Link
                  to="/verify-email"
                  state={{ email: formData.email }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Enter Code &rarr;
                </Link>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-500 no-underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <span className="flex items-center">
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
