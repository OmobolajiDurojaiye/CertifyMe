import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { Check, Star, ArrowRight } from "lucide-react";

const PricingCard = ({ plan, isPopular }) => (
  <div
    className={`relative flex flex-col p-8 rounded-2xl border ${
      isPopular
        ? "border-indigo-600 shadow-2xl scale-105 z-10 bg-white"
        : "border-gray-200 bg-white"
    }`}
  >
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg">
          Most Popular
        </div>
      </div>
    )}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
    <p className="text-gray-500 text-sm mb-6 h-10">{plan.for}</p>

    <div className="flex items-baseline mb-1">
      <span className="text-4xl font-extrabold text-gray-900">
        {plan.priceUSD}
      </span>
      <span className="text-gray-500 ml-2">/ {plan.priceNGN}</span>
    </div>
    <p className="text-xs text-gray-400 mb-6">{plan.certs} Credits</p>

    <div className="bg-indigo-50 text-indigo-700 text-center rounded-lg py-2 px-3 mb-8">
      <p className="font-bold text-sm mb-0">{plan.costPerCert}</p>
      <p className="text-xs font-medium">per certificate</p>
    </div>

    <ul className="space-y-4 mb-8 flex-1 text-gray-600 text-sm">
      {plan.features.map((feat, idx) => (
        <li key={idx} className="flex items-start">
          <Check size={16} className="text-green-500 mr-3 shrink-0 mt-0.5" />
          {feat}
        </li>
      ))}
    </ul>

    <Link
      to={`/signup?plan=${plan.name.toLowerCase()}`}
      className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-colors no-underline ${
        isPopular
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      }`}
    >
      Choose {plan.name}
    </Link>
  </div>
);

const FaqItem = ({ q, a }) => (
  <div className="border-b border-gray-200 py-6">
    <h4 className="font-bold text-gray-900 text-lg mb-2">{q}</h4>
    <p className="text-gray-600 leading-relaxed">{a}</p>
  </div>
);

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      priceUSD: "$15",
      priceNGN: "₦22,500",
      certs: "500",
      costPerCert: "₦45",
      for: "For workshops, bootcamps, and small cohorts.",
      features: [
        "500 certificate credits",
        "Unlimited templates",
        "Email delivery & PDF downloads",
        "Secure online verification",
      ],
    },
    {
      name: "Growth",
      priceUSD: "$50",
      priceNGN: "₦70,000",
      certs: "2,000",
      costPerCert: "₦35",
      for: "For schools and training centers issuing regularly.",
      features: [
        "2,000 certificate credits",
        "Everything in Starter, plus:",
        "Priority support",
        "Faster processing",
      ],
    },
    {
      name: "Pro",
      priceUSD: "$100",
      priceNGN: "₦145,000",
      certs: "5,000",
      costPerCert: "₦29",
      for: "For institutions needing automation and integrations.",
      features: [
        "5,000 certificate credits",
        "Everything in Growth, plus:",
        "API access",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      priceUSD: "$300",
      priceNGN: "₦440,000",
      certs: "20,000",
      costPerCert: "₦22",
      for: "For universities, exam bodies, and large organizations.",
      features: [
        "20,000 certificate credits",
        "Everything in Pro, plus:",
        "SLA-backed support",
        "Custom onboarding (on request)",
      ],
    },
  ];

  return (
    <div className="bg-white font-sans">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="py-20 text-center bg-gray-50 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Simple pricing. Pay only for what you issue.
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              CertifyMe uses a credit-based system. One certificate equals one
              credit. No hidden fees. No surprises.
            </p>
            <p className="text-sm text-gray-500">
              Trusted by schools, training centers, and institutions issuing
              verifiable digital certificates.
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Choose a plan that fits your institution
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                All plans include secure certificate verification, PDF
                downloads, and email delivery. Upgrade anytime.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  isPopular={plan.name === "Pro"}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Cost Clarity */}
        <section className="py-16 bg-indigo-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Transparent cost per certificate
            </h3>
            <p className="text-gray-600 mb-4">
              With CertifyMe, you always know what you’re paying. As your
              institution grows, the cost per certificate goes down.
            </p>
            <p className="text-indigo-600 font-semibold">
              From ₦45 per certificate on Starter → as low as ₦22 per
              certificate on Enterprise.
            </p>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
              What’s Included
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">
                  Available on All Plans
                </h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> Secure certificate
                    verification
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> PDF certificate
                    downloads
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> Email delivery to
                    recipients
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> Unlimited templates
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> Fraud-resistant
                    certificate IDs
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">
                  Available on Pro & Enterprise
                </h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> API access
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> SLA-backed support
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500" /> Custom onboarding (on
                    request)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-gray-200">
              <FaqItem
                q="What is a credit?"
                a="One credit equals one issued certificate. If you create a certificate but delete it before sending, the credit is returned to your account."
              />
              <FaqItem
                q="Do credits expire?"
                a="No. Your credits remain available in your account until you use them, regardless of how long ago you purchased them."
              />
              <FaqItem
                q="Can I upgrade my plan later?"
                a="Yes. You can purchase a new credit bundle at any time. Your new credits will be added to your existing balance."
              />
              <FaqItem
                q="Can I start small and scale later?"
                a="Absolutely. Most institutions start with the Starter or Growth plan and purchase larger credit bundles as their issuance needs increase."
              />
              <FaqItem
                q="Do recipients need an account to verify certificates?"
                a="No. Certificates are publicly verifiable via a secure link and QR code. Anyone can confirm a certificate's authenticity without logging in."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start issuing certificates in minutes
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              No complex setup. No long onboarding. Choose a plan and start
              issuing verifiable certificates today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all no-underline"
              >
                Get Started with CertifyMe
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg no-underline"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PricingPage;
