import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import toast, { Toaster } from "react-hot-toast";
import { sendContactMessage } from "../api";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendContactMessage(formData);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Toaster position="top-right" />
      <PublicHeader />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Info */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Have a question, a feature request, or need help with a
              large-scale deployment? Our team is ready to help.
            </p>
            <div className="mt-8 border-t border-gray-200 pt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                  <p className="text-gray-500">
                    For direct inquiries, reach out to our support inbox.
                  </p>
                  <a
                    href="mailto:hello.certifyme@gmail.com"
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    hello.certifyme@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {submitted ? (
              <div className="p-8 md:p-12 text-center">
                <CheckCircle
                  size={56}
                  className="text-green-500 mx-auto mb-6"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Message Sent!
                </h2>
                <p className="text-gray-600">
                  Thank you for reaching out. We've received your message and
                  will get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Send a Message
                </h2>
                <p className="text-sm text-gray-500 -mt-2">
                  We typically reply within 24 hours.
                </p>

                <FormInput
                  label="Full Name"
                  name="name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"
                  >
                    <MessageSquare size={18} className="text-gray-400" /> Your
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"
    >
      <Icon size={18} className="text-gray-400" /> {label}
    </label>
    <input
      id={props.name}
      required={required}
      {...props}
      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm"
    />
  </div>
);

export default ContactPage;
