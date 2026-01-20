import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  ArrowRight
} from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

export function LandingHero() {
  const navigate = useNavigate();

  return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="w-full py-12 md:py-20 lg:py-24">
            <motion.div
              className="flex flex-col items-center space-y-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.1, duration: 0.5 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold border border-indigo-100 mb-2"
              >
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Now supporting visual drag & drop editor
              </motion.div>

              <motion.h1
                className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl/none text-gray-900 max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                 Digital Credentials, <br/>
                 <span className="text-indigo-600">Reimagined.</span>
              </motion.h1>

              <motion.p
                className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-500 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Create, issue, and manage{" "}
                <span className="font-semibold text-gray-900">
                  verifiable certificates
                </span>{" "}
                and{" "}
                <span className="font-semibold text-gray-900">badges</span>{" "}
                at scale. The smartest way to recognize achievement.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                 <Button 
                    onClick={() => navigate("/signup")}
                    className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all"
                 >
                  Start Issuing Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '#features'}
                    className="h-12 px-8 rounded-xl border-gray-300 text-gray-700 text-lg font-medium hover:bg-gray-50"
                >
                  View Features
                </Button>
              </motion.div>

              <motion.div
                className="flex flex-col items-center space-y-3 pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex items-center space-x-6 text-sm font-medium pt-8">
                  <span className="flex items-center text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Free Template Library
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Bulk CSV Import
                  </span>
                  <span className="flex items-center text-gray-600">
                     <Check className="w-4 h-4 text-green-500 mr-2" />
                     Bank-Grade Security
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="w-full relative max-w-5xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                 {/* Decorative background glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full -z-10 opacity-60"></div>

                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl bg-white/50 backdrop-blur-sm p-2">
                   <div className="rounded-xl overflow-hidden bg-white border border-gray-100">
                        <img
                        src="/images/dashboard-preview.png"
                        alt="ProofDeck Dashboard Preview"
                        className="w-full h-auto object-cover"
                        />
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </section>
      </div>
  );
}
