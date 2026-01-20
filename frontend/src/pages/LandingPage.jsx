import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Building,
  Users,
  Award,
  ArrowRight,
  Code,
  ShieldCheck,
  Zap,
  Layout,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { LandingHero } from "../components/ui/landing-hero";
import { FeaturesSection } from "../components/FeaturesSection";
import { StatsSection } from "../components/StatsSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { ApiSection } from "../components/ApiSection";

// --- SECTIONS ---

// Hero component removed in favor of AcmeHero






const PricingCard = ({
  title,
  price,
  suffix,
  features,
  isPopular,
  btnStyle,
  link,
}) => (
  <div
    className={`relative flex flex-col p-8 bg-white rounded-2xl border ${
      isPopular
        ? "border-indigo-600 shadow-xl scale-105 z-10"
        : "border-gray-200 shadow-sm"
    } transition-all`}
  >
    {isPopular && (
      <div className="absolute top-0 right-0 -mt-3 mr-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="flex items-baseline mb-8">
      <span className="text-4xl font-extrabold text-gray-900">{price}</span>
      <span className="text-gray-500 ml-2">{suffix}</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, idx) => (
        <li key={idx} className="flex items-start text-sm text-gray-600">
          <Check size={18} className="text-green-500 mr-3 shrink-0" />
          {feat}
        </li>
      ))}
    </ul>
    <Link
      to={link}
      className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-colors no-underline ${
        btnStyle === "primary"
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      }`}
    >
      Choose {title}
    </Link>
  </div>
);

const Pricing = () => (
  <section id="pricing" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Flexible Pay-As-You-Go
        </h2>
        <p className="mt-4 text-xl text-gray-500">
          No monthly subscriptions. Credits never expire. Upgrade only when you
          need to.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        <PricingCard
          title="Starter"
          price="$15"
          suffix="for 500 certs"
          features={[
            "500 Credits",
            "Unlimited Templates",
            "Email Delivery",
            "PDF Downloads",
          ]}
          link="/signup?plan=starter"
        />
        <PricingCard
          title="Growth"
          price="$50"
          suffix="for 2,000 certs"
          features={[
            "2,000 Credits",
            "Unlimited Templates",
            "Email Delivery",
            "Priority Support",
          ]}
          link="/signup?plan=growth"
        />
        <PricingCard
          title="Pro"
          price="$100"
          suffix="for 5,000 certs"
          features={[
            "5,000 Credits",
            "Everything in Growth",
            "API Access",
            "Custom Branding",
          ]}
          isPopular={true}
          btnStyle="primary"
          link="/signup?plan=pro"
        />
        <PricingCard
          title="Enterprise"
          price="$300"
          suffix="for 20,000 certs"
          features={[
            "20,000 Credits",
            "Dedicated Manager",
            "SLA Support",
            "API Access",
          ]}
          link="/signup?plan=enterprise"
        />
      </div>
    </div>
  </section>
);



function LandingPage() {
  return (
    <div className="font-sans text-gray-900 bg-white">
      <PublicHeader />
      <main>
        <LandingHero />
        <StatsSection />
        <FeaturesSection />
        <div className="py-10 border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <img
              src="/images/partners/logo1.png"
              className="h-8 md:h-10 object-contain"
              alt="Partner"
            />
            <img
              src="/images/partners/logo2.png"
              className="h-8 md:h-10 object-contain"
              alt="Partner"
            />
            <img
              src="/images/partners/logo3.png"
              className="h-8 md:h-10 object-contain"
              alt="Partner"
            />
          </div>
        </div>

        <TestimonialSection />
        <Pricing />
        <ApiSection />
      </main>
      <PublicFooter />
    </div>
  );
}

export default LandingPage;
