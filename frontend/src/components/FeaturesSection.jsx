import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { 
  Palette, 
  UploadCloud, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    id: "editor",
    title: "Visual Template Editor",
    subtitle: "Design Beautiful Certificates",
    description: "Create stunning credentials with our drag-and-drop editor. Choose from dozens of professionally designed templates or customize your own. Real-time preview guarantees what you see is what they get.",
    image: "/images/feature-editor.png",
    icon: Palette,
    color: "indigo",
    orientation: "left",
    benefits: [
        "Drag & drop text, images, and signatures",
        "Real-time visual preview",
        "Support for custom background images"
    ]
  },
  {
    id: "bulk",
    title: "Bulk Issuance Engine",
    subtitle: "Scale Without Effort",
    description: "Issue thousands of certificates in minutes. Simply upload a CSV file, map your columns, and let our engine handle the rest. We generate, sign, and email credentials automatically.",
    image: "/images/feature-bulk.png",
    icon: UploadCloud,
    color: "blue",
    orientation: "right",
    benefits: [
        "One-click CSV/Excel upload",
        "Automatic attribute mapping",
        "Background processing for large batches"
    ]
  },
  {
    id: "analytics",
    title: "Real-Time Analytics",
    subtitle: "Track Your Impact",
    description: "Gain insights into your credentialing program. data-driven decisions with our comprehensive dashboard. Track issuance rates, recipient engagement, and social sharing metrics in real-time.",
    image: "/images/feature-analytics.png",
    icon: BarChart3,
    color: "purple",
    orientation: "left",
    benefits: [
        "Track email open & bounce rates",
        "Monitor certification performance",
        "Visual growth charts"
    ]
  },
  {
    id: "verify",
    title: "Instant Verification",
    subtitle: "Fraud-Proof Credentials",
    description: "Every certificate comes with a unique, tamper-proof verification page. Third parties can instantly verify authenticity by scanning a QR code or visiting the unique URL.",
    image: "/images/feature-verification.png",
    icon: ShieldCheck,
    color: "green",
    orientation: "right",
    benefits: [
        "Unique QR code for every certificate",
        "Publicly accessible verification pages",
        "Bank-grade fraud protection"
    ]
  },
];

const coreBenefits = [
    {
        icon: Zap,
        title: "Flexible Issuance",
        description: "Whether you need to issue a single certificate or thousands at once, we've got you covered. Support for individual creation and bulk CSV uploads."
    },
    {
        icon: ShieldCheck,
        title: "Smart Verification",
        description: "Ensure authenticity with our dual-layer security. Every credential includes a unique QR Code and a 32-digit verification token."
    },
    {
        icon: Palette,
        title: "Custom Templates",
        description: "Drag & drop builder. Upload your own designs or use our professional presets to match your brand identity perfectly."
    }
];

const FeatureItem = ({ feature, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className="py-16 md:py-24 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Image Section */}
          <motion.div 
            className="w-full md:w-1/2 relative"
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
               {/* Gradient Glow */}
               <div className={`absolute -inset-1 blur-2xl opacity-20 bg-gradient-to-tr from-${feature.color}-500 to-${feature.color}-300 transition-opacity duration-500 group-hover:opacity-40`}></div>
               
               <img 
                 src={feature.image} 
                 alt={feature.title}
                 className="relative w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
               />

               {/* Decorative floating badge */}
               <motion.div 
                 className="absolute -bottom-6 -right-6 md:bottom-8 md:right-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3"
                 initial={{ y: 20, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3, duration: 0.5 }}
               >
                 <div className={`p-2 rounded-lg bg-${feature.color}-100 text-${feature.color}-600`}>
                    <feature.icon size={24} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Feature</p>
                    <p className="text-sm font-bold text-gray-900">{feature.title}</p>
                 </div>
               </motion.div>
            </div>
          </motion.div>

          {/* Text Section */}
          <motion.div 
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${feature.color}-50 text-${feature.color}-700 text-sm font-medium border border-${feature.color}-100`}>
              <span className={`w-2 h-2 rounded-full bg-${feature.color}-500 animate-pulse`}></span>
              {feature.subtitle}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {feature.title}
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              {feature.description}
            </p>

            <ul className="space-y-3 pt-2">
              {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                      <div className={`w-5 h-5 rounded-full bg-${feature.color}-100 flex items-center justify-center text-${feature.color}-600`}>
                        <ArrowRight size={12} />
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                  </li>
              ))}
            </ul>
             
          </motion.div>

        </div>
      </div>
    </div>
  );
};

const CoreBenefitsGrid = () => {
    return (
        <div className="container max-w-7xl mx-auto px-4 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {coreBenefits.map((benefit, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                            <benefit.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                        <p className="text-gray-500 leading-relaxed">
                            {benefit.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function FeaturesSection() {
  const navigate = useNavigate();
  return (
    <section id="features" className="bg-white py-12 md:py-20 relative overflow-hidden">
      
      {/* Section Header */}
      <div className="container max-w-7xl mx-auto px-4 mb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
        >
             <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
             <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
               Everything you need to issue credentials
             </p>
        </motion.div>
      </div>
      
      {/* Core Benefits Grid */}
      <CoreBenefitsGrid />

      <div className="space-y-0 relative">
        {/* Connecting Line (Optional, decorative) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 hidden md:block -z-10 transform -translate-x-1/2"></div>
         
        {features.map((feature, index) => (
          <FeatureItem key={feature.id} feature={feature} index={index} />
        ))}
      </div>


      {/* Bottom CTA */}
      <div className="container mx-auto px-4 mt-16 text-center">
         <motion.div 
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
         >
             <Button 
                onClick={() => navigate('/signup')} 
                size="lg" 
                className="h-14 px-8 rounded-full text-lg shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
            >
                Start Using These Features Free
             </Button>
         </motion.div>
      </div>
    </section>
  );
}
