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

// --- SECTIONS ---

// Hero component removed in favor of AcmeHero


const Features = () => (
  <section className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">
          Features
        </h2>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Everything you need to issue credentials
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Layout,
            title: "Custom Templates",
            desc: "Drag & drop builder. Upload your own designs or use our professional presets.",
          },
          {
            icon: Zap,
            title: "Bulk Generation",
            desc: "Upload a CSV with thousands of names. We generate and email them instantly.",
          },
          {
            icon: ShieldCheck,
            title: "Bank-Grade Security",
            desc: "Every certificate gets a unique ID and QR code for instant, fraud-proof verification.",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="py-12 bg-indigo-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-indigo-800">
        <div className="p-4">
          <Building className="mx-auto mb-4 text-indigo-300" size={32} />
          <div className="text-4xl font-extrabold mb-1">10+</div>
          <div className="text-indigo-200">Companies Onboard</div>
        </div>
        <div className="p-4">
          <Users className="mx-auto mb-4 text-indigo-300" size={32} />
          <div className="text-4xl font-extrabold mb-1">20+</div>
          <div className="text-indigo-200">Active Issuers</div>
        </div>
        <div className="p-4">
          <Award className="mx-auto mb-4 text-indigo-300" size={32} />
          <div className="text-4xl font-extrabold mb-1">200+</div>
          <div className="text-indigo-200">Certificates Verified</div>
        </div>
      </div>
    </div>
  </section>
);

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

const ApiCTA = () => (
  <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="md:w-1/2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-sm font-semibold mb-6">
          <Code size={16} /> For Developers
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Build on our Infrastructure
        </h2>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Automate certificate generation directly from your own application
          using our robust REST API. Perfect for LMS platforms, event apps, and
          HR tools.
        </p>
        <Link
          to="/docs"
          className="inline-flex items-center text-white font-bold hover:text-indigo-400 no-underline text-lg"
        >
          Read the Documentation <ArrowRight className="ml-2" size={20} />
        </Link>
      </div>
      <div className="md:w-1/2 bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 font-mono text-sm">
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="space-y-2 text-indigo-300">
          <p>
            <span className="text-pink-400">POST</span> /api/v1/certificates
          </p>
          <p className="text-gray-400">{`{`}</p>
          <p className="pl-4">
            <span className="text-blue-400">"template_id"</span>:{" "}
            <span className="text-green-400">"tmpl_123"</span>,
          </p>
          <p className="pl-4">
            <span className="text-blue-400">"recipient_name"</span>:{" "}
            <span className="text-green-400">"Jane Doe"</span>,
          </p>
          <p className="pl-4">
            <span className="text-blue-400">"course"</span>:{" "}
            <span className="text-green-400">"React Advanced"</span>
          </p>
          <p className="text-gray-400">{`}`}</p>
          <p className="mt-4 text-green-500">// Response: 201 Created</p>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "CertifyMe is a game changer. The ability to custom my certificates and issue them in bulk made all the difference.",
      name: "Chibuzor Azodo, PhD",
      title: "Founder, Staunch Analytics Ltd",
      image: "/images/chibuzor-azodo.png",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 relative">
          <Quote
            size={48}
            className="text-indigo-100 absolute top-8 left-8 -z-0"
          />
          <div className="relative z-10">
            <p className="text-xl md:text-2xl text-gray-700 font-medium italic mb-8">
              "{testimonials[0].quote}"
            </p>
            <div className="flex items-center justify-center gap-4">
              <img
                src={testimonials[0].image}
                alt={testimonials[0].name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-bold text-gray-900">
                  {testimonials[0].name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonials[0].title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function LandingPage() {
  return (
    <div className="font-sans text-gray-900 bg-white">
      <PublicHeader />
      <main>
        <LandingHero />
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
        <Features />
        <Stats />
        <Testimonials />
        <Pricing />
        <ApiCTA />
      </main>
      <PublicFooter />
    </div>
  );
}

export default LandingPage;
