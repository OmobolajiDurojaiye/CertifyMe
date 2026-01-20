import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { 
    Check, 
    ArrowRight, 
    Zap, 
    Building2, 
    Globe2, 
    ShieldCheck, 
    Briefcase,
    HelpCircle,
    BadgeCheck
} from "lucide-react";
import { motion } from "motion/react";

const PricingCard = ({ plan, isPopular }) => {
  const Icon = plan.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
        isPopular
          ? "border-indigo-600 shadow-2xl shadow-indigo-200 z-10 bg-white ring-4 ring-indigo-50"
          : "border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/80"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
            {/* <StarIcon className="w-3 h-3 text-yellow-300" />  */}Most Popular
          </div>
        </div>
      )}
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl ${plan.colorClass}`}>
          <Icon size={28} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      <p className="text-gray-500 text-sm mb-6 h-10 leading-relaxed font-medium">{plan.for}</p>

      <div className="flex items-baseline mb-2">
        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {plan.priceUSD}
        </span>
        <span className="text-gray-500 ml-2 font-medium">/ {plan.priceNGN}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 inline-block py-1 px-2 rounded-md mb-8 w-max">
          {plan.certs} Credits Included
      </p>

      <div className="bg-gray-50 rounded-xl py-3 px-4 mb-8 border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cost per cert</p>
            <p className="font-bold text-gray-900">{plan.costPerCert}</p>
        </div>
        <div className="h-8 w-px bg-gray-200"></div>
        <div className="text-right">
             <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Validity</p>
             <p className="font-bold text-gray-900">Lifetime</p>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {plan.features.map((feat, idx) => (
          <li key={idx} className="flex items-start text-sm text-gray-600">
            <div className="shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <Check size={12} className="text-green-600" />
            </div>
            {feat}
          </li>
        ))}
      </ul>

      <Link
        to={`/signup?plan=${plan.name.toLowerCase()}`}
        className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-200 no-underline flex items-center justify-center gap-2 group ${
          isPopular
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30"
            : "bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
        }`}
      >
        Choose {plan.name}
        <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${!isPopular && "text-gray-400"}`} />
      </Link>
    </motion.div>
  );
}

const FaqItem = ({ q, a }) => (
  <div className="border-b border-gray-200 py-8 last:border-0">
    <h4 className="flex items-start gap-4 font-bold text-gray-900 text-lg mb-3">
        <HelpCircle className="text-indigo-600 shrink-0 mt-1" size={20} />
        {q}
    </h4>
    <p className="text-gray-600 leading-relaxed pl-9">{a}</p>
  </div>
);

// Small custom icon for "Most Popular" badge
const StarIcon = (props) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      colorClass: "bg-orange-100 text-orange-600",
      priceUSD: "$15",
      priceNGN: "₦22,500",
      certs: "500",
      costPerCert: "₦45",
      for: "Perfect for workshops, bootcamps, and small cohorts.",
      features: [
        "500 certificate credits",
        "Unlimited templates",
        "Email delivery & PDF downloads",
        "Secure online verification",
      ],
    },
    {
      name: "Growth",
      icon: Building2,
      colorClass: "bg-blue-100 text-blue-600",
      priceUSD: "$50",
      priceNGN: "₦70,000",
      certs: "2,000",
      costPerCert: "₦35",
      for: "Ideal for schools and training centers issuing regularly.",
      features: [
        "2,000 certificate credits",
        "Everything in Starter, plus:",
        "Priority support",
        "Faster processing queue",
        "Custom branding options"
      ],
    },
    {
      name: "Pro",
      icon: ShieldCheck,
      colorClass: "bg-indigo-100 text-indigo-600",
      priceUSD: "$100",
      priceNGN: "₦145,000",
      certs: "5,000",
      costPerCert: "₦29",
      for: "For institutions needing automation and deeper integration.",
      features: [
        "5,000 certificate credits",
        "Everything in Growth, plus:",
        "Full API access",
        "Bulk CSV upload (Unlimited)",
        "Priority email & chat support",
      ],
    },
    {
      name: "Enterprise",
      icon: Globe2,
      colorClass: "bg-purple-100 text-purple-600",
      priceUSD: "$300",
      priceNGN: "₦440,000",
      certs: "20,000",
      costPerCert: "₦22",
      for: "For universities, exam bodies, and large organizations.",
      features: [
        "20,000 certificate credits",
        "Everything in Pro, plus:",
        "Dedicated account manager",
        "SLA-backed support",
        "Custom onboarding & training"
      ],
    },
  ];

  return (
    <div className="bg-white font-sans overflow-x-hidden">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative py-24 text-center overflow-hidden">
             {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-slate-50 -z-20"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-8 animate-fade-in-up">
                    <Zap size={14} /> Pay-as-you-go Pricing
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                Simple pricing.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Pay only for what you issue.
                </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                CertifyMe uses a transparent credit-based system. One certificate equals one credit. No hidden fees. No monthly subscriptions.
                </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8 items-start">
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

        {/* Feature Comparison */}
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Everything needed to issue at scale</h2>
                 <p className="text-lg text-gray-500">Robust features included with every single plan.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                    <BadgeCheck size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-6">
                  Available on All Plans
                </h3>
                <ul className="space-y-4">
                  {[
                      "Secure certificate verification", 
                      "PDF certificate downloads",
                      "Email delivery to recipients",
                      "Unlimited templates design",
                      "Fraud-resistant certificate IDs"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                        <Check size={18} className="text-green-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl text-white">
                 <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Briefcase size={24} />
                </div>
                <h3 className="font-bold text-white text-xl mb-6">
                  Pro & Enterprise Exclusives
                </h3>
                <ul className="space-y-4">
                     {[
                      "Full API Access", 
                      "SLA-backed support guarantees",
                      "Custom onboarding & staff training",
                      "Dedicated Account Manager",
                      "Advanced Analytics Dashboard"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                        <Check size={18} className="text-indigo-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-16 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
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
                a="Yes. You can purchase a new credit bundle at any time. Your new credits will be added to your existing balance instantly."
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
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Start issuing certificates within minutes
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              No complex setup. No long onboarding. Choose a credit pack and start
              issuing verifiable certificates today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1 no-underline"
              >
                Get Started Now
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all no-underline"
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
