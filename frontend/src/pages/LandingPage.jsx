// frontend/src/pages/LandingPage.jsx
import React from "react";
import NavigationBar from "../components/NavigationBar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import "../styles/LandingPage.css";

function LandingPage() {
  return (
    <div>
      <NavigationBar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

export default LandingPage;
